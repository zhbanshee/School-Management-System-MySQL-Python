import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import App from "./App";
import {
  apiFetch,
  setCSRFToken,
  type SessionResponse,
  type SessionUser,
} from "./api";

function AuthBrand() {
  return (
    <a className="auth-brand" href="#" aria-label="Schoolhouse">
      <svg
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M2 2h8v8H2zM14 2h8v8h-8zM2 14h8v8H2zM14 14h8v3h-5v5h-3z" />
      </svg>
      Schoolhouse.
    </a>
  );
}

export default function AuthGate() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function checkSession() {
      try {
        const response = await apiFetch("/api/auth/session", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not connect to Schoolhouse.");
        const session: SessionResponse = await response.json();
        if (!controller.signal.aborted) {
          setCSRFToken(session.csrf_token);
          setUser(session.user);
        }
      } catch {
        if (!controller.signal.aborted)
          setError(
            "Could not connect to Schoolhouse. Check the connection and try again.",
          );
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }
    void checkSession();
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const expired = () => {
      setUser(null);
      setCSRFToken(null);
      setMode("login");
      setError("Your session expired. Sign in again to continue.");
    };
    window.addEventListener("schoolhouse:session-expired", expired);
    return () =>
      window.removeEventListener("schoolhouse:session-expired", expired);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (mode === "register" && password !== form.get("confirm_password")) {
      setError(
        "Passwords do not match. Enter the same password in both fields.",
      );
      return;
    }
    setBusy(true);
    try {
      const response = await apiFetch(
        `/api/auth/${mode === "register" ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.get("email"),
            password,
            ...(mode === "register"
              ? {
                  name: form.get("name"),
                  sample_data: form.get("sample_data") === "on",
                }
              : {}),
          }),
        },
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Could not sign in. Please try again.");
      setCSRFToken(body.csrf_token);
      setUser(body.user);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Connection lost. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    const response = await apiFetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("Could not sign out. Please try again.");
    setCSRFToken(null);
    setUser(null);
    setMode("login");
    setError("");
    setVisible(false);
  }
  if (user) return <App key={user.id} user={user} onSignOut={signOut} />;
  return (
    <div className="auth-shell">
      <aside className="auth-identity">
        <AuthBrand />
        <div className="auth-identity-body">
          <h2>
            School
            <br />
            workspace.
          </h2>
          <p>Students, courses and the everyday work of a school.</p>
          <div className="auth-index">
            {[
              "Students & teachers",
              "Courses & enrollments",
              "Grades & attendance",
            ].map((label) => (
              <div key={label}>
                <span>{label}</span>
                <ArrowRight size={19} />
              </div>
            ))}
          </div>
        </div>
        <span className="auth-identity-footer">
          Schoolhouse / Administration
        </span>
      </aside>
      <main className="auth-main">
        <div className="auth-mobile-brand">
          <AuthBrand />
        </div>
        <div className="auth-form-container">
          {checking ? (
            <div className="auth-checking" role="status">
              <LoaderCircle size={25} className="spin" />
              <h1>Opening Schoolhouse…</h1>
              <p>Checking your session.</p>
            </div>
          ) : (
            <>
              <div
                className="auth-switch"
                role="group"
                aria-label="Account access"
              >
                <button
                  type="button"
                  aria-pressed={mode === "login"}
                  disabled={busy}
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setVisible(false);
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "register"}
                  disabled={busy}
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setVisible(false);
                  }}
                >
                  Create account
                </button>
              </div>
              <h1>
                {mode === "login" ? "Welcome back." : "Create your workspace."}
              </h1>
              <p className="auth-description">
                {mode === "login"
                  ? "Sign in to your school records."
                  : "Your account comes with its own school records."}
              </p>
              <form key={mode} className="auth-form" onSubmit={submit}>
                {mode === "register" && (
                  <label htmlFor="auth-name">
                    Your name
                    <input
                      id="auth-name"
                      name="name"
                      autoComplete="name"
                      minLength={2}
                      maxLength={100}
                      required
                      disabled={busy}
                    />
                  </label>
                )}
                <label htmlFor="auth-email">
                  Email address
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    required
                    disabled={busy}
                  />
                </label>
                <label htmlFor="auth-password">
                  Password
                  <div className="password-field">
                    <input
                      id="auth-password"
                      name="password"
                      type={visible ? "text" : "password"}
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
                      minLength={mode === "register" ? 12 : undefined}
                      maxLength={128}
                      required
                      disabled={busy}
                      aria-describedby={
                        mode === "register" ? "password-hint" : undefined
                      }
                    />
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => setVisible(!visible)}
                      aria-label={visible ? "Hide password" : "Show password"}
                      aria-pressed={visible}
                      disabled={busy}
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
                {mode === "register" && (
                  <>
                    <p className="auth-password-hint" id="password-hint">
                      Use 12–128 characters. A longer passphrase works well.
                    </p>
                    <label htmlFor="auth-confirm">
                      Confirm password
                      <input
                        id="auth-confirm"
                        name="confirm_password"
                        type={visible ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={128}
                        required
                        disabled={busy}
                      />
                    </label>
                    <label className="sample-choice">
                      <input
                        name="sample_data"
                        type="checkbox"
                        defaultChecked
                        disabled={busy}
                      />
                      <span>
                        <strong>Include sample school records</strong>
                        <small>
                          Start with fictional students and courses. Uncheck for
                          an empty workspace.
                        </small>
                      </span>
                    </label>
                  </>
                )}
                {error && (
                  <div className="auth-error" role="alert">
                    {error}
                  </div>
                )}
                <button className="primary-button auth-submit" disabled={busy}>
                  {busy ? <LoaderCircle size={18} className="spin" /> : null}
                  {busy
                    ? mode === "login"
                      ? "Signing in…"
                      : "Creating workspace…"
                    : mode === "login"
                      ? "Sign in"
                      : "Create account"}
                  {!busy && <ArrowRight size={17} />}
                </button>
              </form>
              <p className="auth-alternate">
                {mode === "login"
                  ? "New to Schoolhouse?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                    setVisible(false);
                  }}
                >
                  {mode === "login" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
        <footer className="auth-footer">
          Your account. Your school workspace.
        </footer>
      </main>
    </div>
  );
}
