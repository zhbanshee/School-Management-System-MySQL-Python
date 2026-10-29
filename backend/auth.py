"""Account and opaque-session storage, separate from school record databases."""

import hashlib
import secrets
import sqlite3
import time
import uuid
from pathlib import Path
from werkzeug.security import generate_password_hash

COOKIE_NAME = "schoolhouse_session"
SESSION_SECONDS = 12 * 60 * 60
AUTH_SCHEMA = """
CREATE TABLE IF NOT EXISTS Accounts (
    AccountID TEXT PRIMARY KEY,
    Name TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    WorkspaceKind TEXT NOT NULL CHECK(WorkspaceKind IN ('sqlite','mysql')),
    SampleData INTEGER NOT NULL DEFAULT 0,
    CreatedAt INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS one_existing_mysql_workspace ON Accounts(WorkspaceKind) WHERE WorkspaceKind='mysql';
CREATE TABLE IF NOT EXISTS Sessions (
    TokenHash TEXT PRIMARY KEY,
    AccountID TEXT NOT NULL REFERENCES Accounts(AccountID) ON DELETE CASCADE,
    CSRFToken TEXT NOT NULL,
    ExpiresAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS session_expiry ON Sessions(ExpiresAt);
CREATE TABLE IF NOT EXISTS RateLimits (
    Bucket TEXT PRIMARY KEY,
    Attempts INTEGER NOT NULL,
    WindowStart INTEGER NOT NULL
);
"""


def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


class AuthStore:
    def __init__(self, path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        new = not self.path.exists()
        self.connection = sqlite3.connect(self.path, timeout=15)
        self.connection.row_factory = sqlite3.Row
        self.connection.execute("PRAGMA foreign_keys=ON")
        self.connection.executescript(AUTH_SCHEMA)
        if new:
            self.path.chmod(0o600)

    def find_account(self, email):
        row = self.connection.execute(
            "SELECT * FROM Accounts WHERE Email=?", (email,)
        ).fetchone()
        return dict(row) if row else None

    def add_account(
        self, name, email, password, sample_data=False, workspace_kind="sqlite"
    ):
        account_id = uuid.uuid4().hex
        password_hash = generate_password_hash(password, method="scrypt:32768:8:1")
        with self.connection:
            self.connection.execute(
                "INSERT INTO Accounts VALUES (?,?,?,?,?,?,?)",
                (
                    account_id,
                    name,
                    email,
                    password_hash,
                    workspace_kind,
                    int(sample_data),
                    int(time.time()),
                ),
            )
        return self.account_by_id(account_id)

    def account_by_id(self, account_id):
        row = self.connection.execute(
            "SELECT * FROM Accounts WHERE AccountID=?", (account_id,)
        ).fetchone()
        return dict(row) if row else None

    def create_session(self, account_id):
        token = secrets.token_urlsafe(32)
        csrf = secrets.token_urlsafe(32)
        now = int(time.time())
        with self.connection:
            self.connection.execute("DELETE FROM Sessions WHERE ExpiresAt<=?", (now,))
            self.connection.execute(
                "INSERT INTO Sessions VALUES (?,?,?,?)",
                (token_hash(token), account_id, csrf, now + SESSION_SECONDS),
            )
        return token, csrf

    def get_session(self, token):
        if not token or len(token) > 128:
            return None
        row = self.connection.execute(
            """SELECT a.*, s.CSRFToken, s.ExpiresAt
            FROM Sessions s JOIN Accounts a ON a.AccountID=s.AccountID
            WHERE s.TokenHash=? AND s.ExpiresAt>?""",
            (token_hash(token), int(time.time())),
        ).fetchone()
        return dict(row) if row else None

    def revoke_session(self, token):
        if token and len(token) <= 128:
            with self.connection:
                self.connection.execute(
                    "DELETE FROM Sessions WHERE TokenHash=?", (token_hash(token),)
                )

    def consume_limit(self, bucket, limit, window):
        """Atomically consume an attempt; limits survive restarts and workers."""
        now = int(time.time())
        key = token_hash(bucket)
        try:
            self.connection.execute("BEGIN IMMEDIATE")
            row = self.connection.execute(
                "SELECT * FROM RateLimits WHERE Bucket=?", (key,)
            ).fetchone()
            if not row or now - row["WindowStart"] >= window:
                self.connection.execute(
                    "INSERT OR REPLACE INTO RateLimits VALUES (?,?,?)", (key, 1, now)
                )
                allowed, retry = True, 0
            else:
                allowed = row["Attempts"] < limit
                retry = max(1, window - (now - row["WindowStart"]))
                if allowed:
                    self.connection.execute(
                        "UPDATE RateLimits SET Attempts=Attempts+1 WHERE Bucket=?",
                        (key,),
                    )
            self.connection.execute(
                "DELETE FROM RateLimits WHERE WindowStart<?", (now - 86400,)
            )
            self.connection.commit()
            return allowed, retry
        except Exception:
            self.connection.rollback()
            raise

    def clear_limit(self, bucket):
        with self.connection:
            self.connection.execute(
                "DELETE FROM RateLimits WHERE Bucket=?", (token_hash(bucket),)
            )

    def close(self):
        self.connection.close()


def public_account(account):
    return {
        "id": account["AccountID"],
        "name": account["Name"],
        "email": account["Email"],
        "workspace": {
            "storage": account["WorkspaceKind"],
            "demo": bool(account["SampleData"]),
        },
    }
