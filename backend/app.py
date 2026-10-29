"""Local portfolio API. Run with python -m backend.app."""

import csv
import os
import io
import re
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from pathlib import Path
from flask import Flask, g, jsonify, request, send_from_directory, Response
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv
from backend.database import Database
from backend.auth import AuthStore
from backend.auth_routes import install_auth

load_dotenv()
ENTITIES = {
    "students": (
        "Students",
        "StudentID",
        ["StudentName", "StudentSurname", "StudentEmail"],
    ),
    "teachers": (
        "Teachers",
        "TeacherID",
        ["TeacherName", "TeacherSurname", "TeacherEmail", "Department"],
    ),
    "courses": (
        "Courses",
        "CourseID",
        ["CourseTitle", "Credits", "ClassDay", "ClassTime", "Classroom"],
    ),
    "registrations": (
        "Registrations",
        "RegistrationID",
        ["StudentID", "CourseID", "TeacherID", "RegistrationDate", "Grade"],
    ),
    "attendance": (
        "Attendance",
        "AttendanceID",
        ["RegistrationID", "AttendanceDate", "AttendanceStatus"],
    ),
}


def serial(value):
    if isinstance(value, (date, datetime, time)):
        return value.isoformat()
    if isinstance(value, timedelta):
        seconds = int(value.total_seconds())
        return f"{seconds//3600:02}:{seconds%3600//60:02}"
    if isinstance(value, Decimal):
        return float(value)
    return value


def create_app(database_path=None):
    app = Flask(__name__, static_folder=None)
    app.config["MAX_CONTENT_LENGTH"] = 64 * 1024
    # Tests derive an isolated account store from their explicit database path.
    state_dir = (
        Path(database_path).parent / (Path(database_path).stem + "-state")
        if database_path
        else Path(os.getenv("SCHOOL_STATE_DIR", str(Path(__file__).with_name("state"))))
    )
    app.config.update(
        AUTH_DATABASE=str(state_dir / "accounts.db"),
        WORKSPACES_DIR=str(state_dir / "workspaces"),
        AUTH_COOKIE_SECURE=os.getenv("SCHOOL_COOKIE_SECURE", "false").lower() == "true",
    )
    state_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    Path(app.config["WORKSPACES_DIR"]).mkdir(parents=True, exist_ok=True, mode=0o700)
    auth = AuthStore(app.config["AUTH_DATABASE"])
    auth.close()
    install_auth(app)

    dist = Path(__file__).resolve().parents[1] / "frontend" / "dist"

    def db():
        if "db" not in g:
            account = g.account
            if account["WorkspaceKind"] == "mysql":
                g.db = Database(mysql=True)
            else:
                workspace = (
                    Path(app.config["WORKSPACES_DIR"]) / f"{account['AccountID']}.db"
                )
                g.db = Database(str(workspace), mysql=False)
        return g.db

    @app.teardown_appcontext
    def close(_error):
        if "db" in g:
            g.db.connection.close()

    @app.errorhandler(400)
    def bad_request(_error):
        return jsonify(error="Send a valid JSON object."), 400

    @app.errorhandler(413)
    def too_large(_error):
        return jsonify(error="The request is too large."), 413

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", storage="sqlite", authentication="required")

    @app.get("/api/data")
    def data():
        result = {}
        for key, (table, pk, _) in ENTITIES.items():
            result[key] = [
                {k: serial(v) for k, v in row.items()}
                for row in db().rows(f"SELECT * FROM {table} ORDER BY {pk}")
            ]
        result["demo"] = bool(g.account["SampleData"])
        result["storage"] = "mysql" if db().mysql else "sqlite"
        return jsonify(result)

    def validate(entity, payload, editing=False):
        if not isinstance(payload, dict):
            raise ValueError("Send a JSON object.")
        table, pk, columns = ENTITIES[entity]
        fields = columns + (
            [pk]
            if not editing and entity in ("students", "teachers", "courses")
            else []
        )
        values = {}
        for column in fields:
            value = payload.get(column, "N/A" if column == "Grade" else "")
            if isinstance(value, str):
                value = value.strip()
            if column.endswith("ID") or column == "Credits":
                if isinstance(value, bool) or not re.fullmatch(r"[1-9]\d*", str(value)):
                    raise ValueError(f"{column} must be a positive whole number.")
                value = int(value)
                if value > 2147483647:
                    raise ValueError(f"{column} is too large.")
            elif not isinstance(value, str) or not value:
                raise ValueError(f"{column} is required.")
            if column.endswith("Email") and not re.fullmatch(
                r"[^\s@]+@[^\s@]+\.[^\s@]+", value
            ):
                raise ValueError("Enter a valid email address.")
            limit = (
                255
                if column.endswith("Email") or column == "CourseTitle"
                else 50 if column == "Classroom" else 100
            )
            if isinstance(value, str) and len(value) > limit:
                raise ValueError(f"{column} must be {limit} characters or fewer.")
            if column.endswith("Date"):
                try:
                    date.fromisoformat(value)
                except (ValueError, TypeError):
                    raise ValueError("Use a valid date in YYYY-MM-DD format.")
            if column == "ClassTime":
                try:
                    time.fromisoformat(value)
                except (ValueError, TypeError):
                    raise ValueError("Enter a valid class time.")
            if column == "ClassDay" and value not in [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ]:
                raise ValueError("Choose a day of the week.")
            if column == "Grade" and value not in ["A", "B", "C", "D", "F", "N/A"]:
                raise ValueError("Choose a valid grade.")
            if column == "AttendanceStatus" and value not in [
                "Present",
                "Absent",
                "Late",
            ]:
                raise ValueError("Choose a valid attendance status.")
            values[column] = value
        return values

    @app.route("/api/<entity>", methods=["POST"])
    @app.route("/api/<entity>/<int:record_id>", methods=["PUT", "DELETE"])
    def mutate(entity, record_id=None):
        if entity not in ENTITIES:
            return jsonify(error="Unknown resource."), 404
        table, pk, _ = ENTITIES[entity]
        connection = db()
        try:
            if record_id is not None and not connection.rows(
                f"SELECT {pk} FROM {table} WHERE {pk}=?", (record_id,)
            ):
                return (
                    jsonify(
                        error="This record no longer exists. Refresh and try again."
                    ),
                    404,
                )
            if request.method == "DELETE":
                connection.mutate(f"DELETE FROM {table} WHERE {pk}=?", (record_id,))
            else:
                values = validate(entity, request.get_json(), record_id is not None)
                # Protect relational integrity even when the legacy MySQL schema allows NULLs.
                for field, parent in [
                    ("StudentID", "Students"),
                    ("TeacherID", "Teachers"),
                    ("CourseID", "Courses"),
                    ("RegistrationID", "Registrations"),
                ]:
                    if (
                        field in values
                        and field != pk
                        and not connection.rows(
                            f"SELECT {field} FROM {parent} WHERE {field}=?",
                            (values[field],),
                        )
                    ):
                        raise ValueError(
                            f'The selected {field.removesuffix("ID").lower()} does not exist.'
                        )
                if entity == "registrations":
                    duplicates = connection.rows(
                        "SELECT RegistrationID FROM Registrations WHERE StudentID=? AND CourseID=?",
                        (values["StudentID"], values["CourseID"]),
                    )
                    if any(row["RegistrationID"] != record_id for row in duplicates):
                        raise ValueError(
                            "This student is already enrolled in this course."
                        )
                if entity == "attendance":
                    duplicates = connection.rows(
                        "SELECT AttendanceID FROM Attendance WHERE RegistrationID=? AND AttendanceDate=?",
                        (values["RegistrationID"], values["AttendanceDate"]),
                    )
                    if any(row["AttendanceID"] != record_id for row in duplicates):
                        raise ValueError(
                            "Attendance is already recorded for this enrollment and date. Edit that entry instead."
                        )
                if record_id is None:
                    fields = list(values)
                    new_id = connection.mutate(
                        f'INSERT INTO {table} ({",".join(fields)}) VALUES ({",".join("?" for _ in fields)})',
                        tuple(values.values()),
                    )
                    record_id = values.get(pk, new_id)
                else:
                    connection.mutate(
                        f'UPDATE {table} SET {",".join(f"{field}=?" for field in values)} WHERE {pk}=?',
                        (*values.values(), record_id),
                    )
            connection.connection.commit()
            return jsonify(id=record_id), 201 if request.method == "POST" else 200
        except HTTPException:
            connection.connection.rollback()
            raise
        except ValueError as error:
            connection.connection.rollback()
            return jsonify(error=str(error)), 422
        except Exception as error:
            connection.connection.rollback()
            if "unique" in str(error).lower() or getattr(error, "errno", None) == 1062:
                return (
                    jsonify(
                        error="That ID or email is already in use. Choose another."
                    ),
                    409,
                )
            app.logger.exception("Record change failed")
            return (
                jsonify(
                    error="Could not save this change. Check the values and try again."
                ),
                409,
            )

    @app.get("/api/export/<entity>")
    def export(entity):
        if entity not in ENTITIES:
            return jsonify(error="Unknown resource."), 404
        table, pk, columns = ENTITIES[entity]
        rows = db().rows(f"SELECT * FROM {table} ORDER BY {pk}")
        output = io.StringIO(newline="")
        writer = csv.writer(output)
        writer.writerow([pk, *columns])

        def safe(value):
            value = str(serial(value)) if value is not None else ""
            return (
                "'" + value
                if value.lstrip().startswith(("=", "+", "-", "@", "\t", "\r"))
                else value
            )

        writer.writerows(
            [[safe(row.get(col)) for col in [pk, *columns]] for row in rows]
        )
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="school-{entity}.csv"'
            },
        )

    @app.get("/")
    @app.get("/<path:path>")
    def frontend(path=""):
        if path.startswith("api/"):
            return jsonify(error="Unknown endpoint."), 404
        if not dist.exists():
            return (
                jsonify(
                    message="Start the frontend with npm run dev inside frontend/, or build it with npm run build."
                ),
                503,
            )
        if path and (dist / path).is_file():
            return send_from_directory(dist, path)
        return send_from_directory(dist, "index.html")

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=int(os.getenv("PORT", "5001")), debug=False)
