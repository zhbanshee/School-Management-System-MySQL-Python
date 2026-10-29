"""Exercise the real database adapter and API, using an isolated SQLite file."""

import csv
import io
import pytest
from backend.app import create_app


@pytest.fixture
def client(tmp_path):
    app = create_app(str(tmp_path / "test.db"))
    app.config.update(TESTING=True)
    client = app.test_client()
    registered = client.post(
        "/api/auth/register",
        json={
            "name": "Test administrator",
            "email": "admin@example.com",
            "password": "Schoolhouse-tests-2026!",
            "sample_data": True,
        },
    )
    assert registered.status_code == 201
    client.environ_base["HTTP_X_CSRF_TOKEN"] = registered.json["csrf_token"]
    return client


def new_student(**overrides):
    return dict(
        StudentID=9001,
        StudentName="Ana",
        StudentSurname="O’Neill",
        StudentEmail="ana@example.com",
        **overrides,
    )


def test_demo_has_consistent_nonduplicate_relations(client):
    data = client.get("/api/data").json
    assert data["demo"] and len(data["students"]) == 24
    assert len({(r["StudentID"], r["CourseID"]) for r in data["registrations"]}) == len(
        data["registrations"]
    )
    assert client.get("/api/health").json["storage"] == "sqlite"


def test_student_create_update_persist_and_delete(client):
    assert client.post("/api/students", json=new_student()).status_code == 201
    response = client.put(
        "/api/students/9001",
        json={
            "StudentName": "Anastasia",
            "StudentSurname": "O’Neill",
            "StudentEmail": "ana@example.com",
        },
    )
    assert response.status_code == 200
    assert (
        next(
            s
            for s in client.get("/api/data").json["students"]
            if s["StudentID"] == 9001
        )["StudentName"]
        == "Anastasia"
    )
    assert client.delete("/api/students/9001").status_code == 200
    assert client.delete("/api/students/9001").status_code == 404


@pytest.mark.parametrize(
    "field,value",
    [
        ("StudentID", 0),
        ("StudentID", True),
        ("StudentID", 1.5),
        ("StudentEmail", "wrong"),
        ("StudentName", " "),
        ("StudentID", 2147483648),
    ],
)
def test_validation_does_not_insert_bad_records(client, field, value):
    payload = new_student()
    payload[field] = value
    assert client.post("/api/students", json=payload).status_code == 422
    assert len(client.get("/api/data").json["students"]) == 24


def test_conflict_rolls_back_and_connection_recovers(client):
    assert client.post("/api/students", json=new_student()).status_code == 201
    assert client.post("/api/students", json=new_student()).status_code == 409
    payload = new_student()
    payload.update(StudentID=9002, StudentEmail="other@example.com")
    assert client.post("/api/students", json=payload).status_code == 201


def test_registration_foreign_keys_duplicates_and_grading(client):
    payload = dict(
        StudentID=1001,
        CourseID=303,
        TeacherID=203,
        RegistrationDate="2026-10-28",
        Grade="N/A",
    )
    response = client.post("/api/registrations", json=payload)
    assert response.status_code == 201
    record_id = response.json["id"]
    assert client.post("/api/registrations", json=payload).status_code == 422
    payload["Grade"] = "A"
    assert (
        client.put(f"/api/registrations/{record_id}", json=payload).status_code == 200
    )
    payload["StudentID"] = 99999
    assert client.post("/api/registrations", json=payload).status_code == 422
    payload["StudentID"] = 1002
    payload["RegistrationDate"] = "2026-02-30"
    assert client.post("/api/registrations", json=payload).status_code == 422


def test_attendance_duplicate_guard_and_update(client):
    payload = dict(
        RegistrationID=1, AttendanceDate="2020-01-01", AttendanceStatus="Late"
    )
    response = client.post("/api/attendance", json=payload)
    assert response.status_code == 201
    assert client.post("/api/attendance", json=payload).status_code == 422
    payload["AttendanceStatus"] = "Present"
    assert (
        client.put(f"/api/attendance/{response.json['id']}", json=payload).status_code
        == 200
    )
    payload["AttendanceStatus"] = "Unknown"
    assert client.post("/api/attendance", json=payload).status_code == 422


def test_delete_cascades_to_enrollments_and_attendance(client):
    before = client.get("/api/data").json
    ids = {
        r["RegistrationID"] for r in before["registrations"] if r["StudentID"] == 1001
    }
    assert ids
    assert client.delete("/api/students/1001").status_code == 200
    after = client.get("/api/data").json
    assert not any(r["RegistrationID"] in ids for r in after["registrations"])
    assert not any(r["RegistrationID"] in ids for r in after["attendance"])


def test_csv_has_headers_and_neutralizes_spreadsheet_formulas(client):
    payload = new_student()
    payload["StudentName"] = '=HYPERLINK("https://example.com")'
    assert client.post("/api/students", json=payload).status_code == 201
    response = client.get("/api/export/students")
    rows = list(csv.reader(io.StringIO(response.text)))
    assert response.status_code == 200 and rows[0][0] == "StudentID"
    assert rows[-1][1].startswith("'=")
    assert "attachment" in response.headers["Content-Disposition"]


def test_invalid_routes_and_payloads(client):
    assert client.post("/api/unknown", json={}).status_code == 404
    assert client.post("/api/students", json=[]).status_code == 422
    assert (
        client.post(
            "/api/students", data="{broken", content_type="application/json"
        ).status_code
        == 400
    )
    assert client.get("/api/export/unknown").status_code == 404


def test_empty_demo_stays_empty_on_restart(tmp_path):
    path = str(tmp_path / "empty.db")
    app = create_app(path)
    client = app.test_client()
    registered = client.post(
        "/api/auth/register",
        json={
            "name": "Test administrator",
            "email": "admin@example.com",
            "password": "Schoolhouse-tests-2026!",
            "sample_data": True,
        },
    )
    client.environ_base["HTTP_X_CSRF_TOKEN"] = registered.json["csrf_token"]
    data = client.get("/api/data").json
    for row in data["students"]:
        client.delete(f"/api/students/{row['StudentID']}")
    restarted = create_app(path).test_client()
    assert (
        restarted.post(
            "/api/auth/login",
            json={"email": "admin@example.com", "password": "Schoolhouse-tests-2026!"},
        ).status_code
        == 200
    )
    assert restarted.get("/api/data").json["students"] == []
