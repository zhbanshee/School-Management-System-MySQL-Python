from db_controller import SchoolDataControl

# interactive menu
def start_app():
    system = SchoolDataControl()

    while True:
        print("\n--- System Menu ---")
        print("1. Add Student/Teacher/Course "
              "\n2. Delete Student/Teacher/Course "
              "\n3. Update data"
              "\n4. Register Student"
              "\n5. Set grade"
              "\n6. Show registration report "
              "\n7. Mark Attendance"
              "\n8. Attendance Report "
              "\n9. Find Student/Teacher/Course"
              "\n10. Exit")


        choice = input("Select: ")

        if choice == '1':
            sub = input("Add (s)tudent, (t)eacher, or (c)ourse? ").lower()
            if sub == "s" :
                system.add_student(input("ID: "), input("Name: "), input("Surname: "), input("Email: "))
            elif sub == "t" :
                system.add_teacher(input("ID: "), input("Name: "), input("Surname: "), input("Email: "), input("Department: "))
            elif sub == "c" :
                system.add_course(input("ID: "), input("Title: "), input("Credits: "), input("Day: "), input("Time: "), input("Room: "))

        elif choice == '2':
            sub = input("Delete (s)tudent, (t)eacher, (c)ourse? ").lower()
            val = input("Enter ID to delete: ")
            if sub == "s" :
                system.delete_student(val)
            elif sub == "t" :
                system.delete_teacher(val)
            elif sub == "c" :
                system.delete_course(val)

        elif choice == '3':
            sub = input("Update (s)tudent, (t)eacher, (c)ourse? ").lower()
            val = input("Enter ID to update: ")
            if sub == "s" :
                system.update_student(val, input("New name: "), input("New surname: "), input("New email: "))
            if sub == "t" :
                system.update_teacher(val, input("New name: "), input("New surname: "), input("New email: "), input("New department: "))
            if sub == "c" :
                system.update_course(val, input("New title: "), input("New credits: "), input("New day: "), input("New time: "), input("New room: "))

        elif choice == '4':
            s_id = input("Student ID: ")
            c_id = input("Course ID: ")
            t_id = input("Teacher ID: ")
            r_date = input("Registration Date (YYYY-MM-DD): ")
            system.register_student(s_id, c_id, t_id, r_date)

        elif choice == '5':
            system.set_grade(input("Registration ID: "), input("Grade: "))

        elif choice == '6':
            system.show_report()

        elif choice == '7':
            r_id = input("Registration ID: ")
            a_date = input("Date (YYYY-MM-DD): ")
            a_status = input("Status (Present/Absent/Late):")
            system.mark_attendance(r_id, a_date, a_status)

        elif choice == '8':
            system.attendance_report()

        elif choice == '9':
            sub = input("Find (s)tudent, (t)eacher, or (c)ourse? ").lower()
            if sub not in ["s", "t", "c"]:
                print("Invalid choice.")
                continue
            #exception validation block to prevent crash
            try:
                val = int(input("Enter ID to search: "))
                if sub == "s":
                    system.find_student(val)
                elif sub == "t":
                    system.find_teacher(val)
                elif sub == "c":
                    system.find_course(val)
                else:
                    print("Invalid choice.")
            except ValueError:
                print("Search error: ID input parameter must be an integer numeric value.")

        elif choice == '10':
            print("Exiting system. Goodbye!")
            break
        else:
            print("Invalid input, please try again.")
    #safe disconnect to prevent leakages
    try:
        system.cursor.close()
        system.db_link.close()
        print("Database connection closed safely.")
    except Exception as e:
        print(f"Error during closing connection: {e}")

if __name__ == "__main__":
    start_app()





