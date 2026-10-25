# School Management System & Relational Database Engine

An end-to-end Python database management application connected to MySQL via `mysql.connector`. Built with Object-Oriented Programming (OOP) principles, relational database normalization (up to 3NF), MySQL Stored Procedures, and comprehensive input validation.

---

## ✨ Key Features
* **Full CRUD Operations:** Manage Students, Teachers, Courses, Registrations, and Attendance via an interactive CLI menu.
* **Database Normalization (3NF):** Designed schemas with Primary Keys, Foreign Keys (`ON DELETE CASCADE`), `CHECK` constraints, and optimized B-Tree indexes.
* **MySQL Stored Procedures:** Encapsulated all database queries inside server-side stored procedures (`sp_AddStudent`, `sp_SetGrade`, `sp_GetAllRegistrations`, etc.) for query isolation and security.
* **Object-Oriented Programming (OOP):**
  * **Inheritance:** `StudentInfo` and `TeacherInfo` inherit common properties from the `User` base class.
  * **Encapsulation & Validation:** Input parsing, email format checking, and name validation (`is_valid()`).
  * **Polymorphism:** Custom validation logic overridden across child classes.
* **CSV Data Pipeline:** Automated CSV import module (`import_data.py`) with prefix matching (`Dr./Mrs.` vs `Mr./Ms.`), skipping empty rows and graceful duplicate handling via `ER_DUP_ENTRY`.
* **In-Memory Data Manipulation:** Custom **Bubble Sort** implementation for ordering registration records by ID before displaying formatted reports.

---

## 🛠️ Tech Stack
* **Language:** Python 3.x
* **Database:** MySQL Workbench / MySQL Server
* **Driver:** `mysql.connector`
* **Testing:** PyTest (Unit Testing) & SQL Integration Scripts
* **Version Control:** Git / GitHub

---

## 📐 Database Architecture (ERD Highlights)
The database consists of 5 normalized relational tables:
1. `Students` (StudentID, StudentName, StudentSurname, StudentEmail)
2. `Teachers` (TeacherID, TeacherName, TeacherSurname, TeacherEmail, Department)
3. `Courses` (CourseID, CourseTitle, Credits, ClassDay, ClassTime, Classroom)
4. `Registrations` (RegistrationID, StudentID, CourseID, TeacherID, RegistrationDate, Grade)
5. `Attendance` (AttendanceID, RegistrationID, AttendanceDate, AttendanceStatus)

---

## 📁 Repository Structure
├── main.py                             # Interactive CLI menu application
├── db_controller.py                    # MySQL connection & Stored Procedure wrapper
├── models.py                           # OOP User, StudentInfo, and TeacherInfo classes
├── import_data.py                      # CSV automated data import pipeline
├── database.sql                        # DDL table creation & Stored Procedures
├── testing.sql                         # Database integration testing script
├── Fictional People Database (JMD).csv # Sample CSV dataset for seeding
├── School_System_Technical_Report.pdf  # Detailed design report & SDLC analysis
└── README.md                           # Project documentation

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+ installed.
* MySQL Server running locally.

### 2. Database Setup
1. Open MySQL Workbench or MySQL CLI.
2. Execute `database.sql` to create the schema, tables, constraints, and stored procedures.

### 3. Install Dependencies
```bash
pip install mysql-connector-python pytest
4. Configuration
Update your MySQL database credentials in db_controller.py:
Python
self.db_link = mysql.connector.connect(
    host='localhost',
    user='root',
    password='YOUR_MYSQL_PASSWORD',
    database='SchoolManagementSystem'
)
5. Run Application
Bash
python main.py
