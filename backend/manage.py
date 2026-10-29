"""Local-only provisioning of the account that can access an existing MySQL schema."""

import argparse
import getpass
from pathlib import Path
from backend.app import create_app
from backend.auth import AuthStore
from backend.database import Database


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["create-mysql-account"])
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    password = getpass.getpass("Password (12–128 characters): ")
    if not 12 <= len(password) <= 128:
        parser.error("Password must contain 12–128 characters.")
    if password != getpass.getpass("Repeat password: "):
        parser.error("Passwords do not match.")
    if not 2 <= len(args.name.strip()) <= 100:
        parser.error("Name must contain 2–100 characters.")
    import re

    email = args.email.strip().lower()
    if len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        parser.error("Enter a valid email address.")
    # Verify the configured live schema before granting an account access.
    database = Database(mysql=True)
    try:
        for table in ["Students", "Teachers", "Courses", "Registrations", "Attendance"]:
            database.rows(f"SELECT 1 FROM {table} LIMIT 1")
    finally:
        database.connection.close()
    app = create_app()
    auth = AuthStore(app.config["AUTH_DATABASE"])
    try:
        if auth.connection.execute(
            "SELECT 1 FROM Accounts WHERE WorkspaceKind='mysql'"
        ).fetchone():
            parser.error("The existing MySQL workspace already has an account.")
        auth.add_account(args.name.strip(), email, password, workspace_kind="mysql")
        print("MySQL account created. Sign in using the supplied email and password.")
    finally:
        auth.close()


if __name__ == "__main__":
    main()
