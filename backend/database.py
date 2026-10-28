"""Connection adapters; demo data is isolated from the original MySQL database."""

import os
import sqlite3
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS DemoMetadata (Key TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS Students (StudentID INTEGER PRIMARY KEY, StudentName TEXT NOT NULL, StudentSurname TEXT NOT NULL, StudentEmail TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS Teachers (TeacherID INTEGER PRIMARY KEY, TeacherName TEXT NOT NULL, TeacherSurname TEXT NOT NULL, TeacherEmail TEXT NOT NULL UNIQUE, Department TEXT);
CREATE TABLE IF NOT EXISTS Courses (CourseID INTEGER PRIMARY KEY, CourseTitle TEXT NOT NULL, Credits INTEGER CHECK(Credits>0), ClassDay TEXT, ClassTime TEXT, Classroom TEXT);
CREATE TABLE IF NOT EXISTS Registrations (RegistrationID INTEGER PRIMARY KEY AUTOINCREMENT, StudentID INTEGER NOT NULL REFERENCES Students(StudentID) ON DELETE CASCADE, CourseID INTEGER NOT NULL REFERENCES Courses(CourseID) ON DELETE CASCADE, TeacherID INTEGER NOT NULL REFERENCES Teachers(TeacherID) ON DELETE CASCADE, RegistrationDate TEXT NOT NULL, Grade TEXT DEFAULT 'N/A' CHECK(Grade IN ('A','B','C','D','F','N/A')));
CREATE TABLE IF NOT EXISTS Attendance (AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT, RegistrationID INTEGER NOT NULL REFERENCES Registrations(RegistrationID) ON DELETE CASCADE, AttendanceDate TEXT NOT NULL, AttendanceStatus TEXT CHECK(AttendanceStatus IN ('Present','Absent','Late')));
"""


class Database:
    def __init__(self, path=None):
        self.mysql = path is None and os.getenv("SCHOOL_DB", "sqlite") == "mysql"
        if self.mysql:
            import mysql.connector

            self.connection = mysql.connector.connect(
                host=os.getenv("MYSQL_HOST", "localhost"),
                port=int(os.getenv("MYSQL_PORT", "3306")),
                user=os.getenv("MYSQL_USER", "root"),
                password=os.getenv("MYSQL_PASSWORD", ""),
                database=os.getenv("MYSQL_DATABASE", "SchoolManagementSystem"),
            )
        else:
            self.connection = sqlite3.connect(
                path
                or os.getenv("SQLITE_PATH", str(Path(__file__).with_name("demo.db")))
            )
            self.connection.row_factory = sqlite3.Row
            self.connection.execute("PRAGMA foreign_keys=ON")
            self.connection.executescript(SCHEMA)

    def execute(self, sql, params=()):
        cursor = (
            self.connection.cursor(dictionary=True)
            if self.mysql
            else self.connection.cursor()
        )
        cursor.execute(sql.replace("?", "%s") if self.mysql else sql, params)
        return cursor

    def rows(self, sql, params=()):
        cursor = self.execute(sql, params)
        try:
            return [dict(row) for row in cursor.fetchall()]
        finally:
            cursor.close()

    def mutate(self, sql, params=()):
        cursor = self.execute(sql, params)
        result = cursor.lastrowid
        cursor.close()
        return result

    def seed(self):
        if self.mysql or self.rows("SELECT Key FROM DemoMetadata WHERE Key='seeded'"):
            return
        if self.rows("SELECT COUNT(*) AS n FROM Students")[0]["n"]:
            self.mutate("INSERT INTO DemoMetadata VALUES ('seeded')")
            self.connection.commit()
            return
        students = [
            ("Amelia", "Bennett"),
            ("Oliver", "Chen"),
            ("Sofia", "Martinez"),
            ("Noah", "Williams"),
            ("Aisha", "Khan"),
            ("Leo", "Anderson"),
            ("Isabella", "Rossi"),
            ("Ethan", "Park"),
            ("Mia", "Thompson"),
            ("Arman", "Sadykov"),
            ("Zoe", "Mitchell"),
            ("Daniel", "Kim"),
            ("Chloe", "Davis"),
            ("Adam", "Wilson"),
            ("Layla", "Hassan"),
            ("Lucas", "Brown"),
            ("Emily", "Taylor"),
            ("Timur", "Aliyev"),
            ("Grace", "Lee"),
            ("Oscar", "Clarke"),
            ("Sara", "Ahmed"),
            ("Hugo", "Martin"),
            ("Nora", "Evans"),
            ("Alice", "Morgan"),
        ]
        for i, (first, last) in enumerate(students, 1001):
            self.mutate(
                "INSERT INTO Students VALUES (?,?,?,?)",
                (i, first, last, f"{first.lower()}.{last.lower()}@student.school.edu"),
            )
        teachers = [
            (201, "Eleanor", "Hayes", "eleanor.hayes@school.edu", "Mathematics"),
            (202, "James", "Wright", "james.wright@school.edu", "Computer Science"),
            (203, "Clara", "Wilson", "clara.wilson@school.edu", "Humanities"),
            (204, "David", "Okafor", "david.okafor@school.edu", "Sciences"),
        ]
        for row in teachers:
            self.mutate("INSERT INTO Teachers VALUES (?,?,?,?,?)", row)
        courses = [
            (301, "Applied mathematics", 4, "Monday", "09:00", "A-204"),
            (302, "Introduction to computer science", 3, "Tuesday", "10:30", "Lab 02"),
            (303, "World literature", 3, "Wednesday", "11:00", "B-108"),
            (304, "Physics & the everyday", 4, "Thursday", "14:00", "Lab 01"),
            (305, "Creative writing", 2, "Friday", "09:00", "B-102"),
            (306, "Data & society", 3, "Monday", "13:00", "A-110"),
        ]
        for row in courses:
            self.mutate("INSERT INTO Courses VALUES (?,?,?,?,?,?)", row)
        from datetime import date, timedelta

        for i in range(36):
            course_index = (i % 6 + i // 24) % 6
            reg = self.mutate(
                "INSERT INTO Registrations (StudentID,CourseID,TeacherID,RegistrationDate,Grade) VALUES (?,?,?,?,?)",
                (
                    1001 + i % 24,
                    301 + course_index,
                    [201, 202, 203, 204, 203, 202][course_index],
                    date.today().replace(day=1).isoformat(),
                    ["A", "B", "A", "N/A", "C", "B"][i % 6],
                ),
            )
            for days in range(7):
                self.mutate(
                    "INSERT INTO Attendance (RegistrationID,AttendanceDate,AttendanceStatus) VALUES (?,?,?)",
                    (
                        reg,
                        (date.today() - timedelta(days=days)).isoformat(),
                        (
                            "Absent"
                            if (i + days) % 13 == 0
                            else "Late" if (i + days) % 17 == 0 else "Present"
                        ),
                    ),
                )
        self.mutate("INSERT INTO DemoMetadata VALUES ('seeded')")
        self.connection.commit()
