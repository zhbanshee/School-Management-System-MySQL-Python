USE SchoolManagementSystem;

-- Clear previous test data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Attendance;
TRUNCATE TABLE Registrations;
TRUNCATE TABLE Courses;
SET FOREIGN_KEY_CHECKS = 1;

-- Core CS & Mathematics
CALL sp_AddCourse(101, 'Introduction to Computer Science', 4, 'Monday', '09:00:00', 'Room A1');
CALL sp_AddCourse(102, 'Calculus I', 3, 'Tuesday', '11:00:00', 'Room B2');
CALL sp_AddCourse(103, 'Linear Algebra', 3, 'Wednesday', '14:00:00', 'Room C3');
CALL sp_AddCourse(104, 'Discrete Mathematics', 3, 'Thursday', '10:30:00', 'Room D4');
CALL sp_AddCourse(105, 'Object-Oriented Programming', 4, 'Friday', '09:00:00', 'Room A2');

-- Infrastructure & Databases
CALL sp_AddCourse(106, 'Database Management Systems', 4, 'Monday', '13:00:00', 'Lab 1');
CALL sp_AddCourse(107, 'Web Application Development', 3, 'Tuesday', '15:00:00', 'Lab 2');
CALL sp_AddCourse(108, 'Data Structures and Algorithms', 4, 'Wednesday', '09:00:00', 'Room B1');
CALL sp_AddCourse(109, 'Operating Systems', 3, 'Thursday', '14:00:00', 'Room C1');
CALL sp_AddCourse(110, 'Computer Networks and Protocols', 4, 'Friday', '11:00:00', 'Lab 3');

-- Data Science & AI Specializations
CALL sp_AddCourse(111, 'Introduction to Artificial Intelligence', 4, 'Monday', '15:30:00', 'Room D1');
CALL sp_AddCourse(112, 'Machine Learning Basics', 4, 'Tuesday', '09:00:00', 'Lab 4');
CALL sp_AddCourse(113, 'Probability and Statistics', 3, 'Wednesday', '11:00:00', 'Room A3');
CALL sp_AddCourse(114, 'Data Mining and Analytics', 3, 'Thursday', '16:00:00', 'Lab 1');
CALL sp_AddCourse(115, 'Cloud Computing Architecture', 3, 'Friday', '14:00:00', 'Room B3');

-- Advanced Software Engineering & Design
CALL sp_AddCourse(116, 'Software Engineering Principles', 4, 'Monday', '11:00:00', 'Room C2');
CALL sp_AddCourse(117, 'Cyber Security Fundamentals', 3, 'Tuesday', '13:00:00', 'Lab 2');
CALL sp_AddCourse(118, 'Mobile App Development', 3, 'Wednesday', '16:00:00', 'Lab 3');
CALL sp_AddCourse(119, 'Human-Computer Interaction', 3, 'Thursday', '09:00:00', 'Room D2');
CALL sp_AddCourse(120, 'Systems Analysis and Design', 3, 'Friday', '16:00:00', 'Room A4');

SET @s1=0, @s2=0, @s3=0, @s4=0, @s5=0;
SET @t1=0, @t2=0, @t3=0, @t4=0, @t5=0;

-- Fetching 5 available students
SELECT StudentID INTO @s1 FROM Students LIMIT 1 OFFSET 0;
SELECT StudentID INTO @s2 FROM Students LIMIT 1 OFFSET 1;
SELECT StudentID INTO @s3 FROM Students LIMIT 1 OFFSET 2;
SELECT StudentID INTO @s4 FROM Students LIMIT 1 OFFSET 3;
SELECT StudentID INTO @s5 FROM Students LIMIT 1 OFFSET 4;

-- Fetching 5 available teachers 
SELECT TeacherID INTO @t1 FROM Teachers LIMIT 1 OFFSET 0; -- Dr Donna Abbott
SELECT TeacherID INTO @t2 FROM Teachers LIMIT 1 OFFSET 1; -- Dr Ike Abshire
SELECT TeacherID INTO @t3 FROM Teachers LIMIT 1 OFFSET 2; -- Third Teacher
SELECT TeacherID INTO @t4 FROM Teachers LIMIT 1 OFFSET 3; -- Fourth Teacher
SELECT TeacherID INTO @t5 FROM Teachers LIMIT 1 OFFSET 4; -- Fifth Teacher





-- Student 1 -> Courses 101-104 (Taught by Teachers 1 to 4)
CALL sp_RegisterStudent(@s1, 101, @t1, '2026-05-21'); -- RegID: 1
CALL sp_RegisterStudent(@s1, 102, @t2, '2026-05-21'); -- RegID: 2
CALL sp_RegisterStudent(@s1, 103, @t3, '2026-05-21'); -- RegID: 3
CALL sp_RegisterStudent(@s1, 104, @t4, '2026-05-21'); -- RegID: 4

-- Student 2 -> Courses 105-108 (Taught by Teachers 5, 1, 2, 3)
CALL sp_RegisterStudent(@s2, 105, @t5, '2026-05-21'); -- RegID: 5
CALL sp_RegisterStudent(@s2, 106, @t1, '2026-05-21'); -- RegID: 6
CALL sp_RegisterStudent(@s2, 107, @t2, '2026-05-21'); -- RegID: 7
CALL sp_RegisterStudent(@s2, 108, @t3, '2026-05-21'); -- RegID: 8

-- Student 3 -> Courses 109-112 (Taught by Teachers 4, 5, 1, 2)
CALL sp_RegisterStudent(@s3, 109, @t4, '2026-05-21'); -- RegID: 9
CALL sp_RegisterStudent(@s3, 110, @t5, '2026-05-21'); -- RegID: 10
CALL sp_RegisterStudent(@s3, 111, @t1, '2026-05-21'); -- RegID: 11
CALL sp_RegisterStudent(@s3, 112, @t2, '2026-05-21'); -- RegID: 12

-- Student 4 -> Courses 113-116 (Taught by Teachers 3, 4, 5, 1)
CALL sp_RegisterStudent(@s4, 113, @t3, '2026-05-21'); -- RegID: 13
CALL sp_RegisterStudent(@s4, 114, @t4, '2026-05-21'); -- RegID: 14
CALL sp_RegisterStudent(@s4, 115, @t5, '2026-05-21'); -- RegID: 15
CALL sp_RegisterStudent(@s4, 116, @t1, '2026-05-21'); -- RegID: 16

-- Student 5 -> Courses 117-120 (Taught by Teachers 2, 3, 4, 5)
CALL sp_RegisterStudent(@s5, 117, @t2, '2026-05-21'); -- RegID: 17
CALL sp_RegisterStudent(@s5, 118, @t3, '2026-05-21'); -- RegID: 18
CALL sp_RegisterStudent(@s5, 119, @t4, '2026-05-21'); -- RegID: 19
CALL sp_RegisterStudent(@s5, 120, @t5, '2026-05-21'); -- RegID: 20


-- Setting grades
CALL sp_SetGrade(1, 'A');   CALL sp_SetGrade(2, 'B');   CALL sp_SetGrade(3, 'C');   CALL sp_SetGrade(4, 'A');
CALL sp_SetGrade(5, 'B');   CALL sp_SetGrade(6, 'A');   CALL sp_SetGrade(7, 'D');   CALL sp_SetGrade(8, 'C');
CALL sp_SetGrade(9, 'A');   CALL sp_SetGrade(10, 'B');  CALL sp_SetGrade(11, 'A');  CALL sp_SetGrade(12, 'A');
CALL sp_SetGrade(13, 'C');  CALL sp_SetGrade(14, 'B');  CALL sp_SetGrade(15, 'F');  CALL sp_SetGrade(16, 'A');
CALL sp_SetGrade(17, 'B');  CALL sp_SetGrade(18, 'C');  CALL sp_SetGrade(19, 'A');  CALL sp_SetGrade(20, 'B');

-- Marking attendance
CALL sp_MarkAttendance(1, '2026-05-21', 'Present');  CALL sp_MarkAttendance(2, '2026-05-21', 'Late');
CALL sp_MarkAttendance(3, '2026-05-21', 'Present');  CALL sp_MarkAttendance(4, '2026-05-21', 'Absent');
CALL sp_MarkAttendance(5, '2026-05-21', 'Present');  CALL sp_MarkAttendance(6, '2026-05-21', 'Present');
CALL sp_MarkAttendance(7, '2026-05-21', 'Late');     CALL sp_MarkAttendance(8, '2026-05-21', 'Present');
CALL sp_MarkAttendance(9, '2026-05-21', 'Absent');   CALL sp_MarkAttendance(10, '2026-05-21', 'Present');
CALL sp_MarkAttendance(11, '2026-05-21', 'Present'); CALL sp_MarkAttendance(12, '2026-05-21', 'Present');
CALL sp_MarkAttendance(13, '2026-05-21', 'Late');    CALL sp_MarkAttendance(14, '2026-05-21', 'Present');
CALL sp_MarkAttendance(15, '2026-05-21', 'Absent');  CALL sp_MarkAttendance(16, '2026-05-21', 'Present');
CALL sp_MarkAttendance(17, '2026-05-21', 'Present'); CALL sp_MarkAttendance(18, '2026-05-21', 'Late');
CALL sp_MarkAttendance(19, '2026-05-21', 'Present'); CALL sp_MarkAttendance(20, '2026-05-21', 'Present');

CALL sp_GetAllRegistrations();
CALL sp_GetAllAttendanceReport();


SELECT * FROM Students;
SELECT * FROM Teachers;
SELECT * FROM Courses;
SELECT * FROM Registrations;
SELECT * FROM Attendance;