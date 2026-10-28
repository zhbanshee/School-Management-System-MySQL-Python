import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
from models import StudentInfo, TeacherInfo

load_dotenv()

#main class that manages database and connections
class SchoolDataControl:
    def __init__(self):
        # connecting to mysql
        try:
            self.db_link = mysql.connector.connect(
                host=os.getenv('MYSQL_HOST', 'localhost'),
                port=int(os.getenv('MYSQL_PORT', '3306')),
                user=os.getenv('MYSQL_USER', 'root'),
                password=os.getenv('MYSQL_PASSWORD', ''),
                database=os.getenv('MYSQL_DATABASE', 'SchoolManagementSystem')
            )
            self.cursor = self.db_link.cursor()
            print("Successfully linked to database.")
        except Error as e:
            #if the database connection fails, print error message
            print("Connection error", e)
    #modifies student attributes in database
    def update_student(self, s_id, new_name, new_surname, new_email):
        try:
            self.cursor.callproc('sp_UpdateStudent', [int(s_id), new_name.strip().capitalize(), new_surname.strip().capitalize(), new_email.strip()])
            self.db_link.commit() #save changes to database permanently
            print(f"Student {s_id} was updated.")
        except Error as e:
            print("Update error:", e)

    #adds a student record using stored procedures
    def add_student(self, s_id, s_name, s_surname, s_email):
        try:
            new_student = StudentInfo(int(s_id), s_name, s_surname, s_email)
            # run SQL if the Python validation returns True
            if new_student.is_valid():
                #using callproc instead of SQL strings for safety and abstraction
                self.cursor.callproc('sp_AddStudent', [new_student.user_id, new_student.s_name,new_student.s_surname, new_student.s_email])
                self.db_link.commit()
                print(f"Student {new_student.s_name} {new_student.s_surname} was saved.")
        except ValueError:
            print("Input error: Student ID must be an integer numeric value.")
        except Error as e:
            print("Database error:", e)
            raise e

    #deletes a student by id
    def delete_student(self, s_id):
        try:
            self.cursor.callproc('sp_DeleteStudent', [int(s_id)])
            self.db_link.commit()
            print(f"Student {s_id} was deleted.")
        except ValueError:
            print("Input error: Student ID must be an integer numeric value.")
        except Error as e:
            print("Database error:", e)

    #finds student by id
    def find_student(self, s_id):
        try:
            self.cursor.callproc('sp_FindStudent', [(s_id)])
            for result in self.cursor.stored_results():
                row = result.fetchone()
                if row:
                    print("\nStudent Details")
                    print(f"ID:      {row[0]}")
                    print(f"Name:    {row[1]}")
                    print(f"Surname: {row[2]}")
                    print(f"Email:   {row[3]}")
                else:
                    print(f"Student with ID {s_id} not found.")
        except Error as e:
            print("Search failed:", e)

    #adds a teacher record
    def add_teacher(self, t_id, t_name, t_surname, t_email, dept):
        try:
            new_teacher = TeacherInfo(int(t_id), t_name, t_surname, t_email, dept)
            if new_teacher.is_valid():
                self.cursor.callproc('sp_AddTeacher', [new_teacher.user_id, new_teacher.t_name, new_teacher.t_surname, new_teacher.t_email, new_teacher.dept])
                self.db_link.commit()
                print(f"Teacher {new_teacher.t_name} {new_teacher.t_surname} was added.")
        except ValueError:
            print("Input error: Teacher ID must be an integer numeric value.")

        except Error as e:
            print("Error:", e)
            raise e

    #updates teacher properties
    def update_teacher(self, t_id, new_t_name, new_t_surname, new_t_email, new_dept):
        try:
            self.cursor.callproc('sp_UpdateTeacher', [int(t_id), new_t_name.strip().capitalize(), new_t_surname.strip().capitalize(), new_t_email.strip(), new_dept.strip().capitalize()])
            self.db_link.commit()
            print(f"Teacher {t_id} was updated.")
        except Error as e:
            print("Update error:", e)

    #deletes teacher record
    def delete_teacher(self, t_id):
        try:
            self.cursor.callproc('sp_DeleteTeacher', [int(t_id)])
            self.db_link.commit()
            print(f"Teacher {t_id} was deleted.")
        except Error as e:
            print("Error:", e)

    #searchs teacher by id
    def find_teacher(self, t_id):
        try:
            self.cursor.callproc('sp_FindTeacher', [int(t_id)])
            for result in self.cursor.stored_results():
                row = result.fetchone()
                if row:
                    print("\nTeacher Details")
                    print(f"ID:      {row[0]}")
                    print(f"Name:    {row[1]}")
                    print(f"Surname: {row[2]}")
                    print(f"Email:   {row[3]}")
                    print(f"Dept:    {row[4]}")
                else:
                    print(f"Teacher with ID {t_id} not found.")
        except Error as e:
            print("Search failed:", e)

    #adds a course
    def add_course(self,c_id, c_title, c_credits, c_day, c_time, c_room):
        try:
            self.cursor.callproc('sp_AddCourse', [int(c_id), c_title.strip(), int(c_credits), c_day.strip(), c_time.strip(), c_room.strip()])
            self.db_link.commit()
            print(f"Course {c_id} was successfully added.")
        except ValueError:
            print("Input error: Course ID and Credits must be valid integers.")
        except Error as e:
            print("Error while adding record:", e)

    #updates course details
    def update_course(self, c_id, n_title, n_credits, n_day, n_time, n_room):
        try:
            self.cursor.callproc('sp_UpdateCourse', [int(c_id), n_title.strip(), int(n_credits), n_day.strip(), n_time.strip(), n_room.strip()])
            self.db_link.commit()
            print(f"Course {c_id} was updated.")
        except ValueError:
            print("Input error: Course ID and Credits must be valid integers.")
        except Error as e:
            print("Update error:", e)

    #deletes course by id
    def delete_course(self, c_id):
        try:
            self.cursor.callproc('sp_DeleteCourse', [int(c_id)])
            self.db_link.commit()
            print(f"Course {c_id} was deleted.")
        except Error as e:
            print("Error:", e)

    #searchs course by id
    def find_course(self, c_id):
        try:
            self.cursor.callproc('sp_FindCourse', [int(c_id)])
            for result in self.cursor.stored_results():
                row = result.fetchone()
                if row:
                    print("\n--- Course Details ---")
                    print(f"ID:       {row[0]}")
                    print(f"Title:    {row[1]}")
                    print(f"Credits:  {row[2]}")
                    print(f"Day:      {row[3]}")
                    print(f"Time:     {row[4]}")
                    print(f"Classroom: {row[5]}")
                else:
                    print(f"Course with ID {c_id} not found.")
        except Error as e:
            print("Search failed:", e)

    #creates operation to mark attendance
    def mark_attendance(self, reg_id, a_date, a_status):
        try:
            self.cursor.callproc('sp_MarkAttendance', [int(reg_id), a_date.strip(), a_status.strip()])
            self.db_link.commit()
            print(f"Attendance for Registration ID {reg_id} marked as {a_status}.")
        except ValueError:
            print("Input error: Registration ID must be an integer.")
        except Error as e:
            print("Error while marking attendance:", e)

    #creates operation to register student
    def register_student(self, s_id, c_id, t_id, reg_date):
        try:
            #if date is empty string, pass None so mysql procedure uses CURDATE()
            formatted_date = None if reg_date.strip() == "" else reg_date.strip()
            self.cursor.callproc('sp_RegisterStudent', [int(s_id), int(c_id), int(t_id), formatted_date])
            self.db_link.commit()
            print(f"Student {s_id} successfully registered for course {c_id}.")
        except ValueError:
            print("Input error: IDs must be integer values.")
        except Error as e:
            print("Registration error:", e)

    #creates operation to show registration information
    def show_report(self):
        # get all data from the procedure results
        try:
            self.cursor.callproc('sp_GetAllRegistrations')
            for r in self.cursor.stored_results():
                data = list(r.fetchall()) #turning into list to sort
                #bubble sort
                n = len(data) #gets the total number of records in the list
                for i in range(n):
                    for j in range(0, n-i-1):
                        #data[j][0] is the RegID. checks if the current is bigger than next
                        if data [j][0] > data[j+1][0]:
                            #if yes, swaps
                            data[j], data[j+1] = data[j+1], data[j]

                print("\n Registration Report")
                print(f"{'RegID':<6} | {'Student':<20} | {'Course':<20} | {'Teacher':<15} | {'Date':<12} | {'Grade'}")
                print("-" * 90)
                #loop to print each sorted row
                for d in data:
                    print(f"{d[0]:<6} | {d[1]:<20} | {d[2]:<20} | {d[3]:<15} | {str(d[4]):<12} | {d[5]}")
        except Error as e:
            print("Could not load report:", e)

    #creates operation to show attendance information
    def attendance_report(self):
        try:
            self.cursor.callproc('sp_GetAllAttendanceReport')
            for r in self.cursor.stored_results():
                data = r.fetchall()
                print("\n Student Attendance Report")
                print(f"{'Student Name':<25} | {'Course':<15} | {'Status':<10}")
                print("-" * 55)
                if not data:
                    print("No attendance records found.")
                else:
                    for d in data:
                        print(f"{d[0]:<25} | {d[1]:<15} | {d[2]:<10}")
        except Error as e:
            print("Could not load report:", e)

    # creates operation to set grade
    def set_grade(self, reg_id, grade):
        #grade validation to comply with CHECK Constraint in SQL
        valid_grades = ["A", "B", "C", "D", "F", "N/A"]
        clean_grade = grade.strip().upper()
        if clean_grade not in valid_grades:
            print(f"Validation error: Grade '{clean_grade}' is invalid. Choose from : {', '.join(valid_grades)}")
            return

        try:
            self.cursor.callproc('sp_SetGrade', [int(reg_id), clean_grade])
            self.db_link.commit()
            print(f"Grade '{grade}' was successfully set for Registration ID {reg_id}.")
        except ValueError:
            print("Registration ID must be an integer.")
        except Error as e:
            print("Error while setting grade:", e)
