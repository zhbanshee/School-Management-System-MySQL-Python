# parent class for general user info
class User:
    def __init__(self, user_id, name):
        self.user_id = user_id #encapsulated unique identifier
        self.name = name #combined full name

#StudentInfo class inheriting from the main User class
class StudentInfo(User):
    def __init__(self, user_id, s_name, s_surname, s_email): #to set properties to StudentInfo
        self.s_name = s_name.strip()#strip() to clear accidental spaces from inputs
        self.s_surname = s_surname.strip()
        self.s_email = s_email
        #pass the id and combined full name up to the User class
        super().__init__(user_id, f"{self.s_name} {self.s_surname}")

    def is_valid(self):
        #name and surname format validation
        #checking that names contain only letters and be longer than 1 character
        if not (self.s_name.isalpha() and len(self.s_name) > 1):
            print(f"Validation error: Student name '{self.s_name}' is invalid")
            return False
        if not (self.s_surname.isalpha() and len(self.s_surname) > 1):
            print(f"Validation error: Student surname '{self.s_surname}' is invalid")
            return False

        #validating student email format
        if not ("@" in self.s_email and "." in self.s_email):
            print(f"Validation error: Email '{self.s_email}' is invalid")
            return False

        #if all check pass,capitalization before sending data to database
        self.s_name = self.s_name.capitalize()
        self.s_surname = self.s_surname.capitalize()
        return True

#TeacherInfo class inheriting from the main User class
class TeacherInfo(User):
    def __init__(self, user_id, t_name, t_surname, t_email, dept):
        self.t_name = t_name.strip()
        self.t_surname = t_surname.strip()
        self.t_email = t_email.strip()
        self.dept = dept.strip()
        super().__init__(user_id, f"{self.t_name} {self.t_surname}")

    # name and surname format validation
    #checking that names contain only letters and be longer than 1 character
    def is_valid(self):
        if not (self.t_name.isalpha() and len(self.t_name) > 1):
            print(f"Validation error: Teacher name '{self.t_name}' is invalid")
            return False
        if not (self.t_surname.isalpha() and len(self.t_surname) > 1):
            print(f"Validation error: Teacher surname '{self.t_surname}' is invalid")
            return False

        # validating teacher email format
        if not("@" in self.t_email and "." in self.t_email):
            print(f"Validation error: Email '{self.t_email}' is invalid")
            return False

        # capitalization
        self.t_name = self.t_name.capitalize()
        self.t_surname = self.t_surname.capitalize()
        self.dept = self.dept.capitalize()
        return True
