import csv
import mysql.connector
from mysql.connector import errorcode
from db_controller_2 import SchoolDataControl


def import_from_csv(csv_filename):
    #initialize connection using existing controller
    db_system = SchoolDataControl()

    print(f"Starting import from {csv_filename}...")

    try:
        with open(csv_filename, mode='r', encoding= 'latin-1') as file:
            #map columns automatically by their header names
            reader = csv.DictReader(file)

            teachers_count = 0
            students_count = 0
            duplicates_count = 0

            for row in reader:

                if not row.get('ID') or row['ID'].strip() == '' or row['ID'].lower() == 'null':
                    continue
                #extract clean data from the current row
                user_id = row['ID']
                prefix = row['prefix'].strip()
                first_name = row['firstName'].strip()
                last_name = row['lastName'].strip()
                email = row['email'].strip()
                job_title = row['jobTitle'].strip()
                try:
                    #Dr and Mrs become teachers, others become students
                    if prefix in ['Dr', 'Mrs']:
                        # use job titles as their department names
                        db_system.add_teacher(user_id, first_name, last_name, email, job_title)
                        teachers_count += 1
                    else:
                        db_system.add_student(user_id, first_name, last_name, email)
                        students_count += 1
                except mysql.connector.Error as db_error:
                    # Catch ONLY specific database errors
                    if db_error.errno == errorcode.ER_DUP_ENTRY:
                        duplicates_count += 1
                    else:
                        raise db_error


            print("\n--- Import Summary ---")
            print(f"Successfully processed.")
            print(f"Teachers added: {teachers_count}")
            print(f"Students added: {students_count}")
            print(f"Skipped duplicates: {duplicates_count}")

    except FileNotFoundError:
        print(f"Error: File '{csv_filename}' not found. Make sure it is in the same directory.")
    except Exception as e:
        print(f"An error occurred during import: {e}")
    finally:
        #always wrap up and disconnect from the database cleanly
        try:
            db_system.cursor.close()
            db_system.db_link.close()
            print("Database connection closed safely.")
        except:
            pass


if __name__ == "__main__":
    #run the import with file
    import_from_csv('Fictional People Database (JMD).csv')