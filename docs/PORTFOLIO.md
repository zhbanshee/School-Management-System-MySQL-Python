# Presenting Schoolhouse

## CV wording

**Schoolhouse — Full-stack School Management Application**
React · TypeScript · Python · Flask · MySQL · SQLite · pytest · Playwright

> Designed and developed a full-stack school management application using React, TypeScript, Python and MySQL. Built a normalized relational schema and stored-procedure-based CLI, then added a Flask REST API, responsive administration interface, enrollment and grading workflows, attendance analytics and CSV export. Verified core functionality with 38 API/security tests and 14 desktop/mobile browser scenarios.

The original Python CLI, OOP models, MySQL schema, stored procedures and report are your own work, as confirmed by you. Present the project as your application and explain its evolution from coursework into a full-stack interface. Be ready to explain and maintain the implementation, including the AI-assisted additions. Use measured outcomes only; no invented user counts, performance gains or deployment claims are needed.

## Short version for a one-page CV

**Schoolhouse | Full-stack School Management System**
React, TypeScript, Python, Flask, MySQL, SQLite

- Developed a school administration application covering students, teachers, courses, enrollments, grades and attendance, with a responsive React/TypeScript interface and Flask REST API.
- Designed a normalized MySQL schema with foreign keys and CRUD stored procedures; added parameterized web queries, validation, CSV export and an isolated SQLite demo.
- Verified core workflows with 38 API/security tests and 14 desktop/mobile browser scenarios; added a GitHub Actions verification workflow.

The workflow has been added to the repository; claim successful CI runs only after it has actually run on GitHub. The local test suites have passed. MySQL browser integration still needs a configured live-database check.

## A three-minute demo

1. Open Overview: explain that attendance and school totals come from the database, and switch the timetable day.
2. Open Students, search for a name, then create a student with your own fictional details.
3. Enroll the student in a course with a teacher and assign a grade.
4. Add an attendance entry. Try recording it twice to demonstrate validation.
5. Refresh to show persistence, filter a directory, and export CSV.
6. Show the API and browser tests, then explain the boundary between SQLite demo storage and the existing MySQL adapter.

## Decisions to explain in an interview

- React state and typed shared record contracts; one form maps to each entity's schema.
- Parameterized SQL, allowlisted table names and transaction rollback.
- Foreign keys and cascade semantics: what disappears when a student is deleted, and why the UI confirms it.
- Why client validation improves usability while server validation protects the database.
- Why a local SQLite demo helps evaluation without replacing the original MySQL schema.
- How API tests exercise actual database operations and browser tests exercise connected user workflows.
- Accessibility choices: native dialogs, labels, focus, keyboard navigation and reduced motion.
- What must change before production: shared-workspace permissions, email verification/recovery, unique constraints, concurrency handling, pagination and deployment configuration.

## Ownership and limits

You authored the original CLI, OOP models, MySQL schema/stored procedures, import pipeline and technical report. The web interface, Flask API, demo adapter, browser tests and design documentation are the new extension. The current application includes authentication and isolated per-account workspaces; the MySQL path must be tested with a configured live server before claiming MySQL integration testing.

## Account access

Implemented registration, sign-in and sign-out with scrypt password hashing, server-side session revocation, HttpOnly cookies, CSRF protection, attempt limits and isolated SQLite workspaces. Existing MySQL access is locally provisioned. Email verification, password recovery, MFA and shared staff roles remain future work.
