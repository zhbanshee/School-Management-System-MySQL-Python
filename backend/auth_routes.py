"""Authentication routes and the account boundary for every school-data endpoint."""

import re
import secrets
import sqlite3
from pathlib import Path
from flask import g, jsonify, request
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash
from backend.auth import AuthStore, COOKIE_NAME, SESSION_SECONDS, public_account
from backend.database import Database

DUMMY_HASH = generate_password_hash(
    secrets.token_urlsafe(32), method="scrypt:32768:8:1"
)
PUBLIC_ENDPOINTS = {
    "/api/health",
    "/api/auth/session",
    "/api/auth/register",
    "/api/auth/login",
}


def install_auth(app):
    def store():
        if "auth" not in g:
            g.auth = AuthStore(app.config["AUTH_DATABASE"])
        return g.auth

    def payload():
        body = request.get_json()
        if not isinstance(body, dict):
            raise ValueError("Send a JSON object.")
        return body

    def email_value(value):
        if not isinstance(value, str) or len(value) > 254:
            raise ValueError("Enter a valid email address.")
        email = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
            raise ValueError("Enter a valid email address.")
        return email

    def limit(bucket, count, window):
        allowed, retry = store().consume_limit(bucket, count, window)
        if not allowed:
            response = jsonify(
                error="Too many attempts. Please wait before trying again."
            )
            response.status_code = 429
            response.headers["Retry-After"] = str(retry)
            return response
        return None

    def issue_session(account, status=200):
        store().revoke_session(request.cookies.get(COOKIE_NAME))
        token, csrf = store().create_session(account["AccountID"])
        response = jsonify(user=public_account(account), csrf_token=csrf)
        response.status_code = status
        response.set_cookie(
            COOKIE_NAME,
            token,
            max_age=SESSION_SECONDS,
            httponly=True,
            secure=app.config["AUTH_COOKIE_SECURE"],
            samesite="Lax",
            path="/",
        )
        return response

    @app.before_request
    def protect_api():
        if not request.path.startswith("/api/"):
            return None
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            origin = request.headers.get("Origin")
            if origin and origin != request.host_url.rstrip("/"):
                return (
                    jsonify(
                        error="This request must come from your Schoolhouse workspace."
                    ),
                    403,
                )
        g.account = store().get_session(request.cookies.get(COOKIE_NAME))
        if request.path in PUBLIC_ENDPOINTS:
            return None
        if not g.account:
            return jsonify(error="Sign in to access your school workspace."), 401
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            csrf = request.headers.get("X-CSRF-Token", "")
            if not csrf or not secrets.compare_digest(csrf, g.account["CSRFToken"]):
                return (
                    jsonify(
                        error="The security token is missing or expired. Refresh and try again."
                    ),
                    403,
                )
        return None

    @app.after_request
    def security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "same-origin"
        if request.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        return response

    @app.teardown_appcontext
    def close_auth(_error):
        if "auth" in g:
            g.auth.close()

    @app.errorhandler(415)
    def unsupported_media(_error):
        return jsonify(error="Send this request as application/json."), 415

    @app.get("/api/auth/session")
    def current_session():
        if not g.account:
            response = jsonify(user=None, csrf_token=None)
            if request.cookies.get(COOKIE_NAME):
                response.delete_cookie(
                    COOKIE_NAME,
                    path="/",
                    httponly=True,
                    secure=app.config["AUTH_COOKIE_SECURE"],
                    samesite="Lax",
                )
            return response
        return jsonify(
            user=public_account(g.account), csrf_token=g.account["CSRFToken"]
        )

    @app.post("/api/auth/register")
    def register():
        throttled = limit(
            f"register:{request.remote_addr}",
            app.config.get("AUTH_REGISTER_LIMIT", 10),
            3600,
        )
        if throttled is not None:
            return throttled
        account = None
        workspace = None

        def remove_incomplete_account():
            if account:
                with store().connection:
                    store().connection.execute(
                        "DELETE FROM Accounts WHERE AccountID=?",
                        (account["AccountID"],),
                    )
                if workspace and workspace.exists():
                    workspace.unlink()

        try:
            body = payload()
            email = email_value(body.get("email"))
            name = body.get("name")
            if not isinstance(name, str) or not 2 <= len(name.strip()) <= 100:
                raise ValueError("Enter your name using 2–100 characters.")
            password = body.get("password")
            if not isinstance(password, str) or not 12 <= len(password) <= 128:
                raise ValueError("Use a password between 12 and 128 characters.")
            sample_data = body.get("sample_data", True)
            if not isinstance(sample_data, bool):
                raise ValueError("Choose whether to include sample data.")
            # A public registration can only provision its own isolated SQLite workspace.
            # MySQL access can only be provisioned by the local operator, never a request payload.
            account = store().add_account(
                name.strip(), email, password, sample_data=sample_data
            )
            workspace = (
                Path(app.config["WORKSPACES_DIR"]) / f"{account['AccountID']}.db"
            )
            workspace.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            database = Database(str(workspace), mysql=False)
            try:
                if sample_data:
                    database.seed()
            finally:
                database.connection.close()
            return issue_session(account, 201)
        except HTTPException:
            raise
        except ValueError as error:
            return jsonify(error=str(error)), 422
        except sqlite3.IntegrityError:
            if account:
                app.logger.exception("Workspace initialization failed")
                remove_incomplete_account()
                return (
                    jsonify(error="Could not create your workspace. Please try again."),
                    503,
                )
            return (
                jsonify(
                    error="Could not create an account with these details. Try signing in or use another email."
                ),
                409,
            )
        except Exception:
            app.logger.exception("Account creation failed")
            remove_incomplete_account()
            return (
                jsonify(error="Could not create your workspace. Please try again."),
                503,
            )

    @app.post("/api/auth/login")
    def login():
        throttled = limit(f"login-ip:{request.remote_addr}", 30, 900)
        if throttled is not None:
            return throttled
        try:
            body = payload()
            email = email_value(body.get("email"))
            password = body.get("password")
            if not isinstance(password, str) or not password or len(password) > 128:
                return jsonify(error="Email or password is incorrect."), 401
        except ValueError as error:
            return jsonify(error=str(error)), 422
        bucket = f"login-account:{email}"
        throttled = limit(bucket, 5, 900)
        if throttled is not None:
            return throttled
        account = store().find_account(email)
        valid = check_password_hash(
            account["PasswordHash"] if account else DUMMY_HASH, password
        )
        if not account or not valid:
            return jsonify(error="Email or password is incorrect."), 401
        store().clear_limit(bucket)
        return issue_session(account)

    @app.post("/api/auth/logout")
    def logout():
        store().revoke_session(request.cookies.get(COOKIE_NAME))
        response = jsonify(message="Signed out.")
        response.delete_cookie(
            COOKIE_NAME,
            path="/",
            httponly=True,
            secure=app.config["AUTH_COOKIE_SECURE"],
            samesite="Lax",
        )
        return response
