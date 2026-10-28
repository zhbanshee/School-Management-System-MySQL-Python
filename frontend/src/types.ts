export type Entity =
  "students" | "teachers" | "courses" | "registrations" | "attendance";
export type Page = "overview" | Entity;
export type Row = Record<string, string | number>;
export type SchoolData = Record<Entity, Row[]> & { demo: boolean };
export const emptyData: SchoolData = {
  students: [],
  teachers: [],
  courses: [],
  registrations: [],
  attendance: [],
  demo: true,
};
export const primaryKeys: Record<Entity, string> = {
  students: "StudentID",
  teachers: "TeacherID",
  courses: "CourseID",
  registrations: "RegistrationID",
  attendance: "AttendanceID",
};
export const labels: Record<Page, string> = {
  overview: "Overview",
  students: "Students",
  teachers: "Teachers",
  courses: "Courses",
  registrations: "Enrollments",
  attendance: "Attendance",
};
export const singular: Record<Entity, string> = {
  students: "student",
  teachers: "teacher",
  courses: "course",
  registrations: "enrollment",
  attendance: "attendance entry",
};
export const fullName = (row: Row, kind: "Student" | "Teacher" = "Student") =>
  `${row[`${kind}Name`]} ${row[`${kind}Surname`]}`;
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function readableDate(value: string | number) {
  return new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );
}
