import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  UserRound,
  WifiOff,
  X,
  Pencil,
  Leaf,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  type Entity,
  type Page,
  type Row,
  type SchoolData,
  emptyData,
  labels,
  singular,
  primaryKeys,
  fullName,
  localDate,
  readableDate,
} from "./types";
import RecordForm from "./RecordForm";

const navigation: { page: Page; icon: LucideIcon }[] = [
  { page: "overview", icon: LayoutDashboard },
  { page: "students", icon: Users },
  { page: "teachers", icon: UserRound },
  { page: "courses", icon: BookOpen },
  { page: "registrations", icon: GraduationCap },
  { page: "attendance", icon: ClipboardCheck },
];
const descriptions: Record<Page, string> = {
  overview: "A little clarity for the day ahead.",
  students: "Every student, and the details that matter.",
  teachers: "The people who make learning happen.",
  courses: "Make room for the next great idea.",
  registrations: "Connect students, teachers and possibilities.",
  attendance: "Small check-ins. A clearer picture.",
};
const pageFromHash = (): Page =>
  navigation.some((x) => x.page === location.hash.slice(1))
    ? (location.hash.slice(1) as Page)
    : "overview";
const perPage = 8;
function Avatar({
  name,
  index = 0,
  small = false,
}: {
  name: string;
  index?: number;
  small?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`avatar tone-${index % 5} ${small ? "small" : ""}`}
    >
      {name
        .split(" ")
        .filter(Boolean)
        .map((x) => x[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export default function App() {
  const [data, setData] = useState<SchoolData>(emptyData),
    [page, setPage] = useState<Page>(pageFromHash),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [current, setCurrent] = useState(1),
    [sortAsc, setSortAsc] = useState(true),
    [mobileNav, setMobileNav] = useState(false),
    [toast, setToast] = useState(""),
    [editor, setEditor] = useState<{
      entity: Entity;
      record: Row | null;
    } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    const response = await fetch("/api/data");
    if (!response.ok)
      throw new Error("The school records could not be loaded.");
    const result: SchoolData = await response.json();
    setData(result);
    setLoadError("");
  }, []);
  useEffect(() => {
    load()
      .catch(() =>
        setLoadError(
          "We couldn’t connect to your school records. Check that the Python API is running, then try again.",
        ),
      )
      .finally(() => setLoading(false));
  }, [load]);
  useEffect(() => {
    const handler = () => {
      setPage(pageFromHash());
      setQuery("");
      setFilter("all");
      setCurrent(1);
      setMobileNav(false);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (!mobileNav) return;
    document
      .querySelector<HTMLAnchorElement>('.sidebar a[aria-current="page"]')
      ?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNav(false);
        requestAnimationFrame(() =>
          document.querySelector<HTMLButtonElement>(".mobile-menu")?.focus(),
        );
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileNav]);
  function navigate(next: Page) {
    location.hash = next;
    if (next === page) setMobileNav(false);
  }
  function edit(entity: Entity, record: Row | null = null) {
    setEditor({ entity, record });
  }
  async function saved(message: string) {
    await load();
    setToast(message);
  }
  const student = (id: string | number) =>
    data.students.find((r) => r.StudentID === id);
  const teacher = (id: string | number) =>
    data.teachers.find((r) => r.TeacherID === id);
  const course = (id: string | number) =>
    data.courses.find((r) => r.CourseID === id);
  const registration = (id: string | number) =>
    data.registrations.find((r) => r.RegistrationID === id);
  const enrolled = (id: string | number) =>
    data.registrations.filter((r) => r.StudentID === id);
  const title =
    page === "overview" ? "Your school, at a glance." : labels[page];
  const today = new Date(),
    todayISO = localDate(today);
  const todayAttendance = data.attendance.filter(
    (r) => r.AttendanceDate === todayISO,
  );
  const presentRate = todayAttendance.length
    ? Math.round(
        (todayAttendance.filter((r) => r.AttendanceStatus === "Present")
          .length /
          todayAttendance.length) *
          100,
      )
    : null;
  const decorated = (entity: Entity, row: Row): string =>
    Object.values(row).join(" ") +
    " " +
    (entity === "registrations"
      ? `${student(row.StudentID) ? fullName(student(row.StudentID)!) : ""} ${course(row.CourseID)?.CourseTitle} ${teacher(row.TeacherID) ? fullName(teacher(row.TeacherID)!, "Teacher") : ""}`
      : entity === "attendance"
        ? `${student(registration(row.RegistrationID)?.StudentID ?? "") ? fullName(student(registration(row.RegistrationID)!.StudentID)!) : ""} ${course(registration(row.RegistrationID)?.CourseID ?? "")?.CourseTitle}`
        : "");
  const rows =
    page === "overview"
      ? []
      : data[page]
          .filter((r) =>
            decorated(page, r).toLowerCase().includes(query.toLowerCase()),
          )
          .filter((r) => {
            if (filter === "all") return true;
            if (page === "students")
              return filter === "enrolled"
                ? enrolled(r.StudentID).length > 0
                : enrolled(r.StudentID).length === 0;
            if (page === "registrations")
              return filter === "ungraded"
                ? r.Grade === "N/A"
                : r.Grade !== "N/A";
            if (page === "attendance") return r.AttendanceStatus === filter;
            if (page === "teachers") return r.Department === filter;
            if (page === "courses") return r.ClassDay === filter;
            return true;
          })
          .sort((a, b) => {
            const field =
              page === "students"
                ? "StudentName"
                : page === "teachers"
                  ? "TeacherName"
                  : page === "courses"
                    ? "CourseTitle"
                    : primaryKeys[page as Entity];
            return (
              String(a[field]).localeCompare(String(b[field]), undefined, {
                numeric: true,
              }) * (sortAsc ? 1 : -1)
            );
          });
  const pages = Math.max(1, Math.ceil(rows.length / perPage)),
    safeCurrent = Math.min(current, pages);
  const visibleRows = rows.slice(
    (safeCurrent - 1) * perPage,
    safeCurrent * perPage,
  );
  const filterOptions =
    page === "students"
      ? [
          ["enrolled", "Enrolled"],
          ["not-enrolled", "Not enrolled"],
        ]
      : page === "registrations"
        ? [
            ["ungraded", "Not graded"],
            ["graded", "Graded"],
          ]
        : page === "attendance"
          ? ["Present", "Late", "Absent"].map((x) => [x, x])
          : page === "teachers"
            ? [...new Set(data.teachers.map((x) => String(x.Department)))].map(
                (x) => [x, x],
              )
            : page === "courses"
              ? [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((x) => [x, x])
              : [];
  function exportCSV(entity: Entity) {
    const link = document.createElement("a");
    link.href = `/api/export/${entity}`;
    link.download = `school-${entity}.csv`;
    link.click();
  }
  function tableHeader() {
    switch (page) {
      case "students":
        return ["Student", "Student ID", "Courses", "Status", ""];
      case "teachers":
        return ["Teacher", "Teacher ID", "Department", "Enrollments", ""];
      case "courses":
        return ["Course", "Credits", "Schedule", "Classroom", ""];
      case "registrations":
        return ["Student", "Course", "Teacher", "Enrolled", "Grade", ""];
      case "attendance":
        return ["Student", "Course", "Date", "Status", ""];
      default:
        return [];
    }
  }
  function personCell(row: Row, kind: "Student" | "Teacher", index: number) {
    return (
      <div className="person">
        <Avatar name={fullName(row, kind)} index={index} />
        <span>
          <strong>{fullName(row, kind)}</strong>
          <span className="secondary-line">{String(row[`${kind}Email`])}</span>
        </span>
      </div>
    );
  }
  function recordCells(row: Row, index: number) {
    switch (page) {
      case "students":
        return (
          <>
            <td>{personCell(row, "Student", index)}</td>
            <td className="numeric">ST-{row.StudentID}</td>
            <td>
              {enrolled(row.StudentID).length}{" "}
              <span className="muted">courses</span>
            </td>
            <td>
              <Badge
                tone={enrolled(row.StudentID).length ? "green" : "neutral"}
              >
                {enrolled(row.StudentID).length ? "Enrolled" : "Not enrolled"}
              </Badge>
            </td>
          </>
        );
      case "teachers":
        return (
          <>
            <td>{personCell(row, "Teacher", index)}</td>
            <td className="numeric">TC-{row.TeacherID}</td>
            <td>{row.Department}</td>
            <td>
              {
                data.registrations.filter((r) => r.TeacherID === row.TeacherID)
                  .length
              }
            </td>
          </>
        );
      case "courses":
        return (
          <>
            <td>
              <div className="person">
                <span className={`course-icon tone-${index % 5}`}>
                  <BookOpen size={19} />
                </span>
                <span>
                  <strong>{row.CourseTitle}</strong>
                  <span className="secondary-line">CR-{row.CourseID}</span>
                </span>
              </div>
            </td>
            <td>{row.Credits} credits</td>
            <td>
              {row.ClassDay}
              <span className="secondary-line">
                {String(row.ClassTime).slice(0, 5)}
              </span>
            </td>
            <td>{row.Classroom}</td>
          </>
        );
      case "registrations": {
        const s = student(row.StudentID),
          t = teacher(row.TeacherID);
        return (
          <>
            <td>{s ? personCell(s, "Student", index) : "Unknown student"}</td>
            <td>{course(row.CourseID)?.CourseTitle ?? "Unknown course"}</td>
            <td>{t ? fullName(t, "Teacher") : "Unknown teacher"}</td>
            <td className="nowrap">{readableDate(row.RegistrationDate)}</td>
            <td>
              <Badge
                tone={
                  row.Grade === "A"
                    ? "green"
                    : row.Grade === "N/A"
                      ? "neutral"
                      : "amber"
                }
              >
                {row.Grade === "N/A" ? "Not graded" : row.Grade}
              </Badge>
            </td>
          </>
        );
      }
      case "attendance": {
        const r = registration(row.RegistrationID),
          s = r ? student(r.StudentID) : undefined;
        return (
          <>
            <td>{s ? personCell(s, "Student", index) : "Unknown student"}</td>
            <td>{r ? course(r.CourseID)?.CourseTitle : "Unknown course"}</td>
            <td className="nowrap">{readableDate(row.AttendanceDate)}</td>
            <td>
              <Badge
                tone={
                  row.AttendanceStatus === "Present"
                    ? "green"
                    : row.AttendanceStatus === "Late"
                      ? "amber"
                      : "red"
                }
              >
                {row.AttendanceStatus}
              </Badge>
            </td>
          </>
        );
      }
    }
  }
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      {mobileNav && (
        <div className="nav-scrim" onClick={() => setMobileNav(false)} />
      )}
      <aside
        className={`sidebar ${mobileNav ? "is-open" : ""}`}
        aria-label="Main navigation"
      >
        <a href="#overview" className="brand" aria-label="Schoolhouse home">
          <span className="brand-symbol">
            <BookOpen size={25} strokeWidth={1.6} />
          </span>
          schoolhouse<span className="brand-period">.</span>
        </a>
        <div className="workspace-label">
          <span className="school-seal">
            <GraduationCap size={18} />
          </span>
          <span>
            School workspace<small>Administration</small>
          </span>
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav>
          {navigation.map(({ page: target, icon: Icon }) => (
            <a
              key={target}
              href={`#${target}`}
              aria-current={page === target ? "page" : undefined}
              className={`nav-item ${page === target ? "active" : ""}`}
            >
              <Icon size={19} strokeWidth={1.65} />
              <span>{labels[target]}</span>
              {target === "students" && (
                <span className="nav-count">{data.students.length}</span>
              )}
              {page === target && <span className="nav-active-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <Leaf size={22} strokeWidth={1.4} />
          <p>
            A good school day
            <br />
            starts with a little order.
          </p>
          <span>Room for what matters.</span>
        </div>
        <div className="sidebar-bottom">
          <span className="admin-avatar">AD</span>
          <span>
            <strong>School administrator</strong>
            <small>Local workspace</small>
          </span>
          <span className="online-dot" aria-label="Local workspace" />
        </div>
      </aside>
      <div className="main-shell" inert={mobileNav}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobileNav}
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{labels[page]}</strong>
          </div>
          <div className="topbar-right">
            <span className="today-date">
              <CalendarDays size={15} />
              {today.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="topbar-divider" />
            <span className="top-avatar" title="Administrator">
              AD
            </span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <h1>{title}</h1>
              <p>{descriptions[page]}</p>
            </div>
            <div className="heading-actions">
              {page === "overview" ? (
                <button
                  className="primary-button"
                  disabled={loading || !!loadError}
                  onClick={() => edit("registrations")}
                >
                  <Plus size={17} />
                  New enrollment
                </button>
              ) : (
                <>
                  <button
                    className="secondary-button export-button"
                    disabled={loading || !!loadError}
                    onClick={() => exportCSV(page)}
                  >
                    <ArrowDownToLine size={16} />
                    Export CSV
                  </button>
                  <button
                    className="primary-button"
                    disabled={loading || !!loadError}
                    onClick={() => edit(page)}
                  >
                    <Plus size={17} />
                    {page === "attendance"
                      ? "Mark attendance"
                      : `Add ${singular[page]}`}
                  </button>
                </>
              )}
            </div>
          </div>
          {!loading && !loadError && data.demo && (
            <div className="demo-notice">
              <span className="demo-dot" />
              <span>
                Demo workspace{" "}
                <span className="demo-detail">
                  · Fictional school data, ready to explore.
                </span>
              </span>
              <span className="demo-persistence">
                Changes are saved locally
              </span>
            </div>
          )}
          {loading ? (
            <div className="loading-state" role="status">
              <LoaderCircle size={26} className="spin" />
              <h2>Opening your workspace…</h2>
              <p>Getting the school day in order.</p>
            </div>
          ) : loadError ? (
            <div className="empty-state" role="alert">
              <WifiOff size={32} />
              <h2>Your records are out of reach.</h2>
              <p>{loadError}</p>
              <button
                className="primary-button"
                onClick={() => {
                  setLoading(true);
                  load()
                    .catch(() =>
                      setLoadError(
                        "Still unable to connect. Start the Python API and try again.",
                      ),
                    )
                    .finally(() => setLoading(false));
                }}
              >
                Try again
              </button>
            </div>
          ) : page === "overview" ? (
            <>
              <section
                className="welcome-panel"
                aria-labelledby="welcome-title"
              >
                <div className="welcome-copy">
                  <h2 id="welcome-title">
                    Big futures.
                    <br />
                    <em>Everyday beginnings.</em>
                  </h2>
                  <p>
                    All the people, classes and little details
                    <br className="desktop-break" /> that keep your school
                    moving.
                  </p>
                  <button
                    className="welcome-link"
                    onClick={() => navigate("students")}
                  >
                    Meet your students <ArrowRight size={17} />
                  </button>
                </div>
                <div className="welcome-mark" aria-hidden="true">
                  <BookOpen strokeWidth={0.65} />
                  <span>Learning, together.</span>
                </div>
                <div className="school-totals">
                  <button onClick={() => navigate("students")}>
                    <span>
                      Students
                      <Users size={16} />
                    </span>
                    <strong>{data.students.length.toLocaleString()}</strong>
                    <small>People with potential</small>
                  </button>
                  <button onClick={() => navigate("teachers")}>
                    <span>
                      Teachers
                      <UserRound size={16} />
                    </span>
                    <strong>{data.teachers.length}</strong>
                    <small>Here to inspire</small>
                  </button>
                  <button onClick={() => navigate("courses")}>
                    <span>
                      Courses
                      <BookOpen size={16} />
                    </span>
                    <strong>{data.courses.length}</strong>
                    <small>Paths to explore</small>
                  </button>
                </div>
              </section>
              <div className="overview-grid">
                <AttendanceChart
                  data={data}
                  onOpen={() => navigate("attendance")}
                />
                <Schedule data={data} onOpen={() => navigate("courses")} />
              </div>
              <section className="panel enrollment-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent enrollments</h2>
                    <p>The next chapter starts here.</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate("registrations")}
                  >
                    View all <ArrowRight size={16} />
                  </button>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Enrolled on</th>
                        <th>Grade</th>
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...data.registrations]
                        .reverse()
                        .slice(0, 4)
                        .map((row, index) => (
                          <tr key={row.RegistrationID}>
                            <td>
                              {student(row.StudentID)
                                ? personCell(
                                    student(row.StudentID)!,
                                    "Student",
                                    index,
                                  )
                                : "Unknown student"}
                            </td>
                            <td>{course(row.CourseID)?.CourseTitle}</td>
                            <td className="nowrap">
                              {readableDate(row.RegistrationDate)}
                            </td>
                            <td>
                              <Badge
                                tone={row.Grade === "A" ? "green" : "neutral"}
                              >
                                {row.Grade === "N/A" ? "Not graded" : row.Grade}
                              </Badge>
                            </td>
                            <td>
                              <button
                                className="icon-button"
                                aria-label={`Edit enrollment ${row.RegistrationID}`}
                                onClick={() => edit("registrations", row)}
                              >
                                <ArrowRight size={17} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {!data.registrations.length && (
                    <div className="empty-state compact">
                      <GraduationCap />
                      <h3>No enrollments yet</h3>
                      <p>Give your first student a place to start.</p>
                      <button
                        className="primary-button"
                        onClick={() => edit("registrations")}
                      >
                        New enrollment
                      </button>
                    </div>
                  )}
                </div>
              </section>
              <div className="day-note">
                <span>
                  <CheckCheck size={17} />
                  {todayAttendance.length
                    ? `${todayAttendance.length} attendance entries today · ${presentRate}% present`
                    : "A fresh day. Attendance is ready when you are."}
                </span>
                <button onClick={() => edit("attendance")}>
                  Mark attendance <ArrowRight size={15} />
                </button>
              </div>
            </>
          ) : (
            <section
              className="panel directory-panel"
              aria-label={`${labels[page]} directory`}
            >
              <div className="directory-tabs">
                <div>
                  <h2>All {labels[page].toLowerCase()}</h2>
                  <span className="count-tag">{data[page].length}</span>
                </div>
                <span className="directory-note">
                  A place for every detail.
                </span>
              </div>
              <div className="table-toolbar">
                <div className="search-field">
                  <Search size={18} />
                  <input
                    ref={searchRef}
                    aria-label={`Search ${labels[page].toLowerCase()}`}
                    placeholder={`Search ${labels[page].toLowerCase()}…`}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setCurrent(1);
                    }}
                  />
                  {query ? (
                    <button
                      className="icon-button"
                      onClick={() => {
                        setQuery("");
                        setCurrent(1);
                        searchRef.current?.focus();
                      }}
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  ) : (
                    <kbd>⌘ K</kbd>
                  )}
                </div>
                <div className="filter-field">
                  <SlidersHorizontal size={16} />
                  <select
                    aria-label={`Filter ${labels[page].toLowerCase()}`}
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setCurrent(1);
                    }}
                  >
                    <option value="all">
                      {page === "courses"
                        ? "All days"
                        : page === "teachers"
                          ? "All departments"
                          : "All statuses"}
                    </option>
                    {filterOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="table-scroll">
                <table className="directory-table">
                  <thead>
                    <tr>
                      {tableHeader().map((header, index) => (
                        <th key={index}>
                          {index === 0 ? (
                            <button
                              className="sort-button"
                              onClick={() => setSortAsc(!sortAsc)}
                            >
                              {header}
                              {sortAsc ? (
                                <ArrowDown size={13} />
                              ) : (
                                <ArrowUpDown size={13} />
                              )}
                            </button>
                          ) : (
                            header || <span className="sr-only">Actions</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, index) => (
                      <tr key={row[primaryKeys[page]]}>
                        {recordCells(row, index + (safeCurrent - 1) * perPage)}
                        <td>
                          <button
                            className="icon-button edit-button"
                            aria-label={`Edit ${singular[page]} ${row[primaryKeys[page]]}`}
                            onClick={() => edit(page, row)}
                          >
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!rows.length && (
                <div className="empty-state">
                  <Search size={30} />
                  <h2>
                    {data[page].length
                      ? "No matches this time."
                      : `Your first ${singular[page]} belongs here.`}
                  </h2>
                  <p>
                    {data[page].length
                      ? "Try a different search or clear your filters."
                      : `Add ${singular[page] === "attendance entry" ? "an" : "a"} ${singular[page]} to get started.`}
                  </p>
                  {data[page].length ? (
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setQuery("");
                        setFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  ) : (
                    <button
                      className="primary-button"
                      onClick={() => edit(page)}
                    >
                      Add {singular[page]}
                    </button>
                  )}
                </div>
              )}
              <div className="pagination">
                <span>
                  {rows.length
                    ? `Showing ${(safeCurrent - 1) * perPage + 1}–${Math.min(safeCurrent * perPage, rows.length)} of ${rows.length}`
                    : "0 results"}
                  <span className="pagination-type">
                    {" "}
                    {labels[page].toLowerCase()}
                  </span>
                </span>
                <div>
                  <button
                    className="icon-button"
                    aria-label="Previous page"
                    disabled={safeCurrent === 1}
                    onClick={() => setCurrent(safeCurrent - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <span>
                    Page {safeCurrent} of {pages}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="Next page"
                    disabled={safeCurrent === pages}
                    onClick={() => setCurrent(safeCurrent + 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>Made for the everyday work of a school.</span>
            <span>
              <span className="footer-dot" />
              {data.demo ? "Local demo" : "MySQL workspace"}
              <span className="footer-separator">/</span>Schoolhouse
            </span>
          </footer>
        </main>
      </div>
      {editor && (
        <RecordForm
          key={`${editor.entity}-${editor.record?.[primaryKeys[editor.entity]] ?? "new"}`}
          entity={editor.entity}
          record={editor.record}
          data={data}
          onClose={() => setEditor(null)}
          onSaved={saved}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={17} />
          </span>
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function AttendanceChart({
  data,
  onOpen,
}: {
  data: SchoolData;
  onOpen: () => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - 6 + i);
    const rows = data.attendance.filter(
      (r) => r.AttendanceDate === localDate(day),
    );
    const present = rows.filter((r) => r.AttendanceStatus === "Present").length;
    return {
      day,
      rows,
      present,
      rate: rows.length ? Math.round((present / rows.length) * 100) : null,
    };
  });
  const [selected, setSelected] = useState(6),
    active = days[selected];
  const total = days.reduce((sum, day) => sum + day.rows.length, 0),
    totalPresent = days.reduce((sum, day) => sum + day.present, 0);
  return (
    <section className="panel attendance-panel">
      <div className="panel-heading">
        <div>
          <h2>Showing up, together.</h2>
          <p>Attendance over the last seven days</p>
        </div>
        <button
          className="icon-button"
          aria-label="Open attendance records"
          onClick={onOpen}
        >
          <ExternalLink size={17} />
        </button>
      </div>
      <div className="chart-summary">
        <strong>
          {total ? Math.round((totalPresent / total) * 100) + "%" : "—"}
        </strong>
        <span>
          Present, on average
          <span className="secondary-line">{total} recorded check-ins</span>
        </span>
        <Badge tone="green">
          <span className="status-dot" />
          Present
        </Badge>
      </div>
      <div
        className="attendance-chart"
        role="group"
        aria-label="Daily present attendance percentages"
      >
        {days.map((day, index) => (
          <button
            key={localDate(day.day)}
            className={`chart-column ${selected === index ? "selected" : ""}`}
            onClick={() => setSelected(index)}
            aria-label={`${day.day.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${day.rate === null ? "no records" : day.rate + "% present"}`}
            aria-pressed={selected === index}
          >
            <span className="bar-value">
              {day.rate === null ? "—" : `${day.rate}%`}
            </span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ height: `${day.rate ?? 0}%` }}
              />
            </span>
            <span className="bar-label">
              {day.day.toLocaleDateString("en-GB", { weekday: "short" })}
            </span>
          </button>
        ))}
      </div>
      <div className="chart-detail">
        <span>
          {active.day.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          })}
        </span>
        <span>
          {active.rows.length
            ? `${active.present} present · ${active.rows.filter((r) => r.AttendanceStatus === "Late").length} late · ${active.rows.filter((r) => r.AttendanceStatus === "Absent").length} absent`
            : "No attendance recorded"}
        </span>
      </div>
    </section>
  );
}
function Schedule({ data, onOpen }: { data: SchoolData; onOpen: () => void }) {
  const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [selected, setSelected] = useState(todayDay);
  const scheduled = data.courses
    .filter((r) => r.ClassDay === selected)
    .sort((a, b) => String(a.ClassTime).localeCompare(String(b.ClassTime)));
  return (
    <section className="panel schedule-panel">
      <div className="panel-heading">
        <div>
          <h2>The week in motion</h2>
          <p>A little structure. A lot of possibility.</p>
        </div>
        <CalendarDays size={19} className="muted" />
      </div>
      <div className="week-tabs" role="tablist" aria-label="Schedule day">
        {weekdays.map((day) => (
          <button
            role="tab"
            aria-label={day}
            tabIndex={selected === day ? 0 : -1}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                const next =
                  weekdays[
                    (weekdays.indexOf(day) +
                      (event.key === "ArrowRight" ? 1 : 6)) %
                      7
                  ];
                setSelected(next);
                document.getElementById(`day-${next}`)?.focus();
              }
            }}
            id={`day-${day}`}
            aria-controls="day-schedule"
            aria-selected={selected === day}
            key={day}
            onClick={() => setSelected(day)}
          >
            {day.slice(0, 1)}
            <span className="sr-only">{day.slice(1)}</span>
            <span className={day === todayDay ? "today-marker" : ""} />
          </button>
        ))}
      </div>
      <div
        className="schedule-list"
        id="day-schedule"
        role="tabpanel"
        aria-labelledby={`day-${selected}`}
      >
        {scheduled.slice(0, 3).map((row, index) => (
          <div className="schedule-entry" key={row.CourseID}>
            <div className="schedule-time">
              {String(row.ClassTime).slice(0, 5)}
              <span>{selected.slice(0, 3)}</span>
            </div>
            <span className={`schedule-rule tone-${index % 5}`} />
            <div>
              <strong>{row.CourseTitle}</strong>
              <span className="secondary-line">
                <MapPin size={12} />
                {row.Classroom}
                <span className="bullet-divider">·</span>
                {row.Credits} credits
              </span>
            </div>
          </div>
        ))}
        {!scheduled.length && (
          <div className="schedule-empty">
            <BookOpen size={26} strokeWidth={1.3} />
            <strong>A little breathing room.</strong>
            <span>No classes scheduled for {selected}.</span>
          </div>
        )}
        {scheduled.length > 3 && (
          <span className="muted">+{scheduled.length - 3} more classes</span>
        )}
      </div>
      <button className="schedule-footer" onClick={onOpen}>
        Explore all courses <ArrowRight size={16} />
      </button>
    </section>
  );
}
