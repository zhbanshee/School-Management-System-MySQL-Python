"""Security boundaries are exercised against real account/session/workspace files."""

import sqlite3
import time
import pytest
from werkzeug.security import check_password_hash
from backend.app import create_app
from backend.auth import COOKIE_NAME, token_hash

PASSWORD = "Correct horse battery staple!"


@pytest.fixture
def app(tmp_path):
    app = create_app(str(tmp_path / "school.db"))
    app.config.update(TESTING=True)
    return app


def register(client, email="owner@example.com", sample=False, **extra):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "School Owner",
            "email": email,
            "password": PASSWORD,
            "sample_data": sample,
            **extra,
        },
    )
    if response.status_code == 201:
        client.environ_base["HTTP_X_CSRF_TOKEN"] = response.json["csrf_token"]
    return response


def test_every_school_endpoint_requires_authentication(app):
    client = app.test_client()
    for method, url in [
        ("GET", "/api/data"),
        ("GET", "/api/export/students"),
        ("POST", "/api/students"),
        ("PUT", "/api/students/1001"),
        ("DELETE", "/api/students/1001"),
    ]:
        assert client.open(url, method=method, json={}).status_code == 401
    assert client.get("/api/auth/session").json == {"user": None, "csrf_token": None}
    assert client.get("/api/health").status_code == 200


def test_password_hash_and_opaque_session_cookie(app):
    client = app.test_client()
    response = register(client)
    assert response.status_code == 201
    cookie = response.headers["Set-Cookie"]
    assert "HttpOnly" in cookie and "SameSite=Lax" in cookie and "Path=/" in cookie
    raw = client.get_cookie(COOKIE_NAME).value
    with sqlite3.connect(app.config["AUTH_DATABASE"]) as connection:
        stored_hash = connection.execute(
            "SELECT PasswordHash FROM Accounts"
        ).fetchone()[0]
        stored_token = connection.execute("SELECT TokenHash FROM Sessions").fetchone()[
            0
        ]
    assert PASSWORD not in stored_hash and stored_hash.startswith("scrypt:")
    assert check_password_hash(stored_hash, PASSWORD)
    assert stored_token == token_hash(raw) and stored_token != raw
    assert "PasswordHash" not in str(response.json)
    assert client.get("/api/data").headers["Cache-Control"] == "no-store"


@pytest.mark.parametrize(
    "changes",
    [
        {"name": ""},
        {"email": "invalid"},
        {"password": "short"},
        {"password": "x" * 129},
        {"sample_data": "false"},
    ],
)
def test_registration_rejects_invalid_input_without_creating_an_account(app, changes):
    client = app.test_client()
    assert register(client, **changes).status_code == 422
    with sqlite3.connect(app.config["AUTH_DATABASE"]) as connection:
        assert connection.execute("SELECT COUNT(*) FROM Accounts").fetchone()[0] == 0


def test_email_normalization_and_duplicate_signup(app):
    first = app.test_client()
    second = app.test_client()
    assert register(first, email="  OWNER@Example.COM  ").status_code == 201
    assert register(second).status_code == 409
    result = second.post(
        "/api/auth/login", json={"email": "OWNER@EXAMPLE.COM", "password": PASSWORD}
    )
    assert (
        result.status_code == 200
        and result.json["user"]["email"] == "owner@example.com"
    )


def test_logout_revokes_the_server_session_and_cookie_replay(app):
    client = app.test_client()
    register(client)
    raw = client.get_cookie(COOKIE_NAME).value
    assert client.post("/api/auth/logout").status_code == 200
    assert client.get_cookie(COOKIE_NAME) is None
    replay = app.test_client()
    replay.set_cookie(COOKIE_NAME, raw)
    assert replay.get("/api/data").status_code == 401
    assert client.get("/api/data").status_code == 401


def test_login_rotates_session_and_csrf_tokens(app):
    client = app.test_client()
    response = register(client)
    raw = client.get_cookie(COOKIE_NAME).value
    login = client.post(
        "/api/auth/login", json={"email": "owner@example.com", "password": PASSWORD}
    )
    assert login.status_code == 200
    assert login.json["csrf_token"] != response.json["csrf_token"]
    assert client.get_cookie(COOKIE_NAME).value != raw
    replay = app.test_client()
    replay.set_cookie(COOKIE_NAME, raw)
    assert replay.get("/api/data").status_code == 401


def test_expired_session_is_rejected_and_cleared(app):
    client = app.test_client()
    register(client)
    with sqlite3.connect(app.config["AUTH_DATABASE"]) as connection:
        connection.execute("UPDATE Sessions SET ExpiresAt=?", (int(time.time()) - 1,))
    assert client.get("/api/data").status_code == 401
    assert client.get("/api/auth/session").json["user"] is None
    assert client.get_cookie(COOKIE_NAME) is None


def test_valid_session_survives_app_restart(app):
    client = app.test_client()
    register(client)
    raw = client.get_cookie(COOKIE_NAME).value
    from pathlib import Path

    account_file = Path(app.config["AUTH_DATABASE"])
    path = account_file.parent.parent / "school.db"
    restarted = create_app(str(path)).test_client()
    restarted.set_cookie(COOKIE_NAME, raw)
    assert (
        restarted.get("/api/auth/session").json["user"]["email"] == "owner@example.com"
    )


def test_csrf_guard_blocks_mutations_and_logout(app):
    client = app.test_client()
    register(client)
    client.environ_base.pop("HTTP_X_CSRF_TOKEN")
    assert client.post("/api/students", json={}).status_code == 403
    assert client.post("/api/auth/logout").status_code == 403
    assert client.get("/api/data").status_code == 200
    client.environ_base["HTTP_X_CSRF_TOKEN"] = "wrong-token"
    assert client.delete("/api/students/1001").status_code == 403


def test_cross_origin_auth_and_mutation_requests_are_rejected(app):
    client = app.test_client()
    assert (
        client.post(
            "/api/auth/register",
            headers={"Origin": "https://attacker.example"},
            json={},
        ).status_code
        == 403
    )
    register(client)
    assert (
        client.post(
            "/api/auth/logout", headers={"Origin": "https://attacker.example"}
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/api/auth/logout", headers={"Origin": "http://localhost"}
        ).status_code
        == 200
    )


def test_account_and_export_isolation_including_overlapping_record_ids(app):
    first = app.test_client()
    second = app.test_client()
    register(first, email="first@example.com")
    register(second, email="second@example.com")
    alice = {
        "StudentID": 1,
        "StudentName": "Alice",
        "StudentSurname": "First",
        "StudentEmail": "alice@first.example",
    }
    bob = {
        "StudentID": 1,
        "StudentName": "Bob",
        "StudentSurname": "Second",
        "StudentEmail": "bob@second.example",
    }
    assert first.post("/api/students", json=alice).status_code == 201
    assert second.get("/api/data").json["students"] == []
    assert "alice@first.example" not in second.get("/api/export/students").text
    assert second.post("/api/students", json=bob).status_code == 201
    assert first.get("/api/data").json["students"][0]["StudentName"] == "Alice"
    assert second.get("/api/data").json["students"][0]["StudentName"] == "Bob"
    alice["StudentID"] = 2
    alice["StudentEmail"] = "another@first.example"
    first.post("/api/students", json=alice)
    assert second.delete("/api/students/2").status_code == 404
    assert len(first.get("/api/data").json["students"]) == 2


def test_public_registration_cannot_claim_mysql_or_another_workspace(app):
    client = app.test_client()
    response = register(
        client, workspace_kind="mysql", AccountID="../../demo", role="admin"
    )
    assert response.status_code == 201
    assert response.json["user"]["workspace"] == {"storage": "sqlite", "demo": False}
    assert len(response.json["user"]["id"]) == 32
    assert client.get("/api/data").json["storage"] == "sqlite"


def test_sample_records_are_optional_and_private(app):
    sample = app.test_client()
    empty = app.test_client()
    register(sample, email="sample@example.com", sample=True)
    register(empty, email="empty@example.com", sample=False)
    assert len(sample.get("/api/data").json["students"]) == 24
    assert sample.get("/api/data").json["demo"] is True
    assert empty.get("/api/data").json["students"] == []
    assert empty.get("/api/data").json["demo"] is False


def test_login_errors_are_generic_and_attempts_are_limited(app):
    client = app.test_client()
    register(client)
    client.post("/api/auth/logout")
    wrong = client.post(
        "/api/auth/login", json={"email": "owner@example.com", "password": "wrong"}
    )
    missing = client.post(
        "/api/auth/login", json={"email": "absent@example.com", "password": "wrong"}
    )
    assert wrong.status_code == missing.status_code == 401
    assert wrong.json == missing.json
    for _ in range(4):
        assert (
            client.post(
                "/api/auth/login",
                json={"email": "owner@example.com", "password": "wrong"},
            ).status_code
            == 401
        )
    limited = client.post(
        "/api/auth/login", json={"email": "owner@example.com", "password": PASSWORD}
    )
    assert limited.status_code == 429 and int(limited.headers["Retry-After"]) > 0


def test_auth_requires_json_and_rejects_malformed_bodies(app):
    client = app.test_client()
    assert client.post("/api/auth/register", data="email=a").status_code == 415
    assert (
        client.post(
            "/api/auth/register", data="{broken", content_type="application/json"
        ).status_code
        == 400
    )
    assert client.post("/api/auth/register", json=[]).status_code == 422


def test_secure_cookie_setting(app):
    app.config["AUTH_COOKIE_SECURE"] = True
    response = register(app.test_client())
    assert "; Secure;" in response.headers["Set-Cookie"]


@pytest.mark.parametrize(
    "error", [RuntimeError("disk unavailable"), sqlite3.IntegrityError("seed conflict")]
)
def test_failed_workspace_setup_removes_the_incomplete_account(app, monkeypatch, error):
    from pathlib import Path
    from backend.database import Database

    def broken_seed(_self):
        raise error

    monkeypatch.setattr(Database, "seed", broken_seed)
    client = app.test_client()
    assert register(client, sample=True).status_code == 503
    with sqlite3.connect(app.config["AUTH_DATABASE"]) as connection:
        assert connection.execute("SELECT COUNT(*) FROM Accounts").fetchone()[0] == 0
        assert connection.execute("SELECT COUNT(*) FROM Sessions").fetchone()[0] == 0
    assert not list(Path(app.config["WORKSPACES_DIR"]).glob("*.db"))


def test_login_attempt_limit_survives_restart(app):
    from pathlib import Path

    client = app.test_client()
    register(client)
    for _ in range(5):
        assert (
            client.post(
                "/api/auth/login",
                json={"email": "owner@example.com", "password": "wrong"},
            ).status_code
            == 401
        )
    path = Path(app.config["AUTH_DATABASE"]).parent.parent / "school.db"
    restarted = create_app(str(path)).test_client()
    assert (
        restarted.post(
            "/api/auth/login", json={"email": "owner@example.com", "password": PASSWORD}
        ).status_code
        == 429
    )
