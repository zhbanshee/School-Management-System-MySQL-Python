import { useEffect, useRef, useState } from "react";
import { X, Save, LoaderCircle, Trash2 } from "lucide-react";
import {
  type Entity,
  type Row,
  type SchoolData,
  primaryKeys,
  singular,
  fullName,
  localDate,
} from "./types";

type Field = {
  key: string;
  label: string;
  type?: string;
  options?: { value: string | number; label: string }[];
  max?: number;
};
export default function RecordForm({
  entity,
  record,
  data,
  onClose,
  onSaved,
}: {
  entity: Entity;
  record: Row | null;
  data: SchoolData;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirmDelete, setConfirmDelete] = useState(false);
  const pk = primaryKeys[entity];
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  const personFields = (kind: "Student" | "Teacher"): Field[] => [
    { key: `${kind}Name`, label: "First name", max: 100 },
    { key: `${kind}Surname`, label: "Last name", max: 100 },
    { key: `${kind}Email`, label: "Email address", type: "email", max: 255 },
  ];
  const fields: Record<Entity, Field[]> = {
    students: personFields("Student"),
    teachers: [
      ...personFields("Teacher"),
      { key: "Department", label: "Department", max: 100 },
    ],
    courses: [
      { key: "CourseTitle", label: "Course title", max: 255 },
      { key: "Credits", label: "Credits", type: "number" },
      {
        key: "ClassDay",
        label: "Day of the week",
        options: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((x) => ({ value: x, label: x })),
      },
      { key: "ClassTime", label: "Class time", type: "time" },
      { key: "Classroom", label: "Classroom", max: 50 },
    ],
    registrations: [
      {
        key: "StudentID",
        label: "Student",
        options: data.students.map((r) => ({
          value: r.StudentID,
          label: fullName(r),
        })),
      },
      {
        key: "CourseID",
        label: "Course",
        options: data.courses.map((r) => ({
          value: r.CourseID,
          label: String(r.CourseTitle),
        })),
      },
      {
        key: "TeacherID",
        label: "Teacher",
        options: data.teachers.map((r) => ({
          value: r.TeacherID,
          label: fullName(r, "Teacher"),
        })),
      },
      { key: "RegistrationDate", label: "Enrollment date", type: "date" },
      {
        key: "Grade",
        label: "Grade",
        options: ["N/A", "A", "B", "C", "D", "F"].map((x) => ({
          value: x,
          label: x === "N/A" ? "Not graded" : x,
        })),
      },
    ],
    attendance: [
      {
        key: "RegistrationID",
        label: "Enrollment",
        options: data.registrations.map((r) => ({
          value: r.RegistrationID,
          label: `${fullName(data.students.find((s) => s.StudentID === r.StudentID) || { StudentName: "Unknown", StudentSurname: "student" })} · ${data.courses.find((c) => c.CourseID === r.CourseID)?.CourseTitle || "Unknown course"}`,
        })),
      },
      { key: "AttendanceDate", label: "Attendance date", type: "date" },
      {
        key: "AttendanceStatus",
        label: "Status",
        options: ["Present", "Late", "Absent"].map((x) => ({
          value: x,
          label: x,
        })),
      },
    ],
  };
  const visibleFields: Field[] = [
    ...(!record && ["students", "teachers", "courses"].includes(entity)
      ? [
          {
            key: pk,
            label: `${singular[entity][0].toUpperCase() + singular[entity].slice(1)} ID`,
            type: "number",
          },
        ]
      : []),
    ...fields[entity],
  ];
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const payload = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    try {
      const result = await fetch(
        `/api/${entity}${record ? `/${record[pk]}` : ""}`,
        {
          method: record ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const response = await result.json();
      if (!result.ok)
        throw new Error(response.error || "Could not save. Please try again.");
      await onSaved(
        `${singular[entity][0].toUpperCase() + singular[entity].slice(1)} ${record ? "updated" : "added"}.`,
      );
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Connection lost. Check that the API is running.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError("");
    try {
      const result = await fetch(`/api/${entity}/${record![pk]}`, {
        method: "DELETE",
      });
      const response = await result.json();
      if (!result.ok) throw new Error(response.error);
      await onSaved(`${singular[entity]} deleted.`);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="record-dialog"
      aria-labelledby="form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className="dialog-heading">
        <div>
          <h2 id="form-title">
            {record ? "Edit" : "Add"} {singular[entity]}
          </h2>
          <p>
            {record
              ? `Record #${record[pk]} · Keep your school records up to date.`
              : "A little detail now. A more connected school day."}
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close form"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={submit}>
        <div className="form-fields">
          {visibleFields.map((field) => (
            <label
              key={field.key}
              className={
                field.key.endsWith("Email") ||
                field.key === "CourseTitle" ||
                field.key === "RegistrationID"
                  ? "wide"
                  : ""
              }
            >
              <span id={`label-${field.key}`}>{field.label}</span>
              {field.options ? (
                <select
                  aria-labelledby={`label-${field.key}`}
                  name={field.key}
                  defaultValue={
                    record?.[field.key] ??
                    (field.key === "Grade"
                      ? "N/A"
                      : field.key === "AttendanceStatus"
                        ? "Present"
                        : "")
                  }
                  required
                  disabled={busy}
                >
                  <option value="" disabled>
                    Choose {field.label.toLowerCase()}
                  </option>
                  {field.options.map((o) => (
                    <option value={o.value} key={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-labelledby={`label-${field.key}`}
                  autoFocus={field === visibleFields[0]}
                  name={field.key}
                  type={field.type || "text"}
                  min={field.type === "number" ? 1 : undefined}
                  max={field.type === "number" ? 2147483647 : undefined}
                  maxLength={field.max}
                  required
                  disabled={busy}
                  defaultValue={
                    record?.[field.key] ??
                    (field.type === "date"
                      ? localDate()
                      : field.key === pk
                        ? Math.max(
                            0,
                            ...data[entity].map((r) => Number(r[pk])),
                          ) + 1
                        : "")
                  }
                />
              )}
            </label>
          ))}
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {confirmDelete && (
          <div className="delete-confirm">
            <strong>Delete this {singular[entity]}?</strong>
            <p>
              {["students", "teachers", "courses", "registrations"].includes(
                entity,
              )
                ? "Related enrollments and attendance will also be permanently removed."
                : "This attendance entry will be permanently removed."}
            </p>
            <div>
              <button
                type="button"
                className="danger-button"
                disabled={busy}
                onClick={remove}
              >
                Yes, delete
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={busy}
                onClick={() => setConfirmDelete(false)}
              >
                Keep record
              </button>
            </div>
          </div>
        )}
        <div className="dialog-footer">
          {record && (
            <button
              type="button"
              className="text-danger"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="primary-button" disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Save size={16} />
              )}{" "}
              {busy ? "Saving…" : "Save " + singular[entity]}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
