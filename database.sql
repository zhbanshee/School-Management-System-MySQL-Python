DROP DATABASE IF EXISTS SchoolManagementSystem;
CREATE DATABASE SchoolManagementSystem;
USE SchoolManagementSystem;

-- Creating a table for student information
CREATE TABLE Students (
    StudentID INT PRIMARY KEY,
    StudentName VARCHAR(100) NOT NULL,
    StudentSurname VARCHAR(100) NOT NULL,
    StudentEmail VARCHAR(255) UNIQUE
);

CREATE INDEX idx_student_email ON Students(StudentEmail);

-- Creating a table for teacher information
CREATE TABLE Teachers (
    TeacherID INT PRIMARY KEY,
    TeacherName VARCHAR(100) NOT NULL,
    TeacherSurname VARCHAR(100) NOT NULL,
    TeacherEmail VARCHAR(255) UNIQUE,
    Department VARCHAR(100)
);

-- Creating table for course information
CREATE TABLE Courses (
    CourseID INT PRIMARY KEY,
    CourseTitle VARCHAR(255) NOT NULL,
    Credits INT CHECK (Credits > 0),
    ClassDay VARCHAR(20),
    ClassTime TIME,
    Classroom VARCHAR(50)
);

-- Creating registration table to link previous tables
CREATE TABLE Registrations (
    RegistrationID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT,
    CourseID INT,
    TeacherID INT,
    RegistrationDate DATE,
    Grade VARCHAR(5) DEFAULT 'N/A',
    CONSTRAINT chk_grade CHECK (Grade IN ('A' , 'B', 'C', 'D', 'F', 'N/A')),
    CONSTRAINT fk_student FOREIGN KEY (StudentID)
        REFERENCES Students (StudentID)
        ON DELETE CASCADE,
    CONSTRAINT fk_course FOREIGN KEY (CourseID)
        REFERENCES Courses (CourseID)
        ON DELETE CASCADE,
    CONSTRAINT fk_teacher FOREIGN KEY (TeacherID)
        REFERENCES Teachers (TeacherID)
        ON DELETE CASCADE
);

-- Creating table to check attendance
CREATE TABLE Attendance (
    AttendanceID INT AUTO_INCREMENT PRIMARY KEY,
    RegistrationID INT,
    AttendanceDate DATE,
    AttendanceStatus VARCHAR(20) NOT NULL,
    CONSTRAINT chk_status CHECK (AttendanceStatus IN ('Present' , 'Absent', 'Late')),
    FOREIGN KEY (RegistrationID)
        REFERENCES Registrations (RegistrationID)
        ON DELETE CASCADE
);

DELIMITER //

-- Creating a procedure to add a student
CREATE PROCEDURE sp_AddStudent(IN s_id INT, IN s_name VARCHAR(100), IN s_surname VARCHAR(100), IN s_email VARCHAR(255))
BEGIN
    INSERT INTO Students (StudentID, StudentName, StudentSurname, StudentEmail) VALUES (s_id, s_name, s_surname, s_email);
END //

-- Creating a procedure to update student details
CREATE PROCEDURE sp_UpdateStudent(IN s_id INT, IN s_name VARCHAR(100), IN s_surname VARCHAR(100), IN s_email VARCHAR(255))
BEGIN
    UPDATE Students SET StudentName = s_name, StudentSurname = s_surname, StudentEmail = s_email WHERE StudentID = s_id;
END //

-- Creating a procedure to add a teacher
CREATE PROCEDURE sp_AddTeacher(IN t_id INT, IN t_name VARCHAR(100), IN t_surname VARCHAR(100), IN t_email VARCHAR(255), IN t_dept VARCHAR(100))
BEGIN
    INSERT INTO Teachers (TeacherID, TeacherName, TeacherSurname, TeacherEmail, Department) VALUES (t_id, t_name, t_surname, t_email, t_dept);
END //

-- Creating a procedure to update teacher details
CREATE PROCEDURE sp_UpdateTeacher(IN t_id INT, IN t_name VARCHAR(100), IN t_surname VARCHAR(100), IN t_email VARCHAR(255), IN t_dept VARCHAR(100))
BEGIN
    UPDATE Teachers SET TeacherName = t_name, TeacherSurname = t_surname, TeacherEmail = t_email, Department = t_dept WHERE TeacherID = t_id;
END //

-- Creating a procedure to add a course
CREATE PROCEDURE sp_AddCourse(IN c_id INT, IN c_title VARCHAR(255), IN c_credits INT, IN c_day VARCHAR(20), IN c_time TIME, IN c_room VARCHAR(50))
BEGIN
    INSERT INTO Courses (CourseID, CourseTitle, Credits, ClassDay, ClassTime, Classroom) VALUES (c_id, c_title, c_credits, c_day, c_time, c_room);
END //

-- Creating a procedure to update course details
CREATE PROCEDURE sp_UpdateCourse(IN c_id INT, IN c_title VARCHAR(255), IN c_credits INT, IN c_day VARCHAR(20), IN c_time TIME, IN c_room VARCHAR(50))
BEGIN
    UPDATE Courses SET CourseTitle = c_title, Credits = c_credits, ClassDay = c_day, ClassTime = c_time, Classroom = c_room WHERE CourseID = c_id;
END //

-- Creating a procedure to enroll a student to a course with a teacher
CREATE PROCEDURE sp_RegisterStudent(IN s_id INT, IN c_id INT, IN t_id INT, IN r_date DATE)
BEGIN
    INSERT INTO Registrations (StudentID, CourseID, TeacherID, RegistrationDate) VALUES (s_id, c_id, t_id, IFNULL(r_date, CURDATE()));
END //

-- Creating a procedure to get all registrations with joined details
CREATE PROCEDURE sp_GetAllRegistrations()
BEGIN
    SELECT r.RegistrationID,
           CONCAT(s.StudentName, ' ', s.StudentSurname) AS Student,
           c.CourseTitle,
           CONCAT(t.TeacherName, ' ', t.TeacherSurname) AS Teacher,
           r.RegistrationDate, r.Grade
    FROM Registrations r
    JOIN Students s ON r.StudentID = s.StudentID
    JOIN Courses c ON r.CourseID = c.CourseID
    JOIN Teachers t ON r.TeacherID = t.TeacherID;
END //

-- Creating procedure to set grades
CREATE PROCEDURE sp_SetGrade(IN r_id INT,IN s_grade VARCHAR(5))
BEGIN
    UPDATE Registrations SET Grade = s_grade WHERE RegistrationID = r_id;
END//

-- Creating a procedure to delete a student by ID
CREATE PROCEDURE sp_DeleteStudent(IN s_id INT)
BEGIN
    DELETE FROM Students WHERE StudentID = s_id;
END //

-- Creating a procedure to delete a teacher by ID
CREATE PROCEDURE sp_DeleteTeacher(IN t_id INT)
BEGIN
    DELETE FROM Teachers WHERE TeacherID = t_id;
END //

-- Creating a procedure to delete a course by ID
CREATE PROCEDURE sp_DeleteCourse(IN c_id INT)
BEGIN
    DELETE FROM Courses WHERE CourseID = c_id;
END //

-- Creating a procedure to mark attendance
CREATE PROCEDURE sp_MarkAttendance( IN r_id INT, IN a_date DATE, IN a_status VARCHAR(20))
BEGIN
    INSERT INTO Attendance (RegistrationID, AttendanceDate, AttendanceStatus) VALUES (r_id, a_date, a_status);
END //

-- Creating a procedure to get attendance report
CREATE PROCEDURE sp_GetAllAttendanceReport()
BEGIN
    SELECT CONCAT(s.StudentName, ' ', s.StudentSurname) AS StudentName,
           c.CourseTitle,
           a.AttendanceStatus
    FROM Attendance a
    JOIN Registrations r ON a.RegistrationID = r.RegistrationID
    JOIN Students s ON r.StudentID = s.StudentID
    JOIN Courses c ON r.CourseID = c.CourseID;
END //

-- Creating a procedure to find a student by ID
CREATE PROCEDURE sp_FindStudent(IN s_id INT)
BEGIN
    SELECT * FROM Students WHERE StudentID = s_id;
END //

-- Creating a procedure to find a teacher by ID
CREATE PROCEDURE sp_FindTeacher(IN t_id INT)
BEGIN
    SELECT * FROM Teachers WHERE TeacherID = t_id;
END //

-- Creating a procedure to find a course by ID
CREATE PROCEDURE sp_FindCourse(IN c_id INT)
BEGIN
    SELECT * FROM Courses WHERE CourseID = c_id;
END //

DELIMITER ;