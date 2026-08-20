import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export function NewLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate SSO redirect — in real app would hit /api/auth/gitlab
    setTimeout(() => {
      setLoading(false);
      // For the migration preview, navigate to the post-login dashboard
      navigate({ to: "/dashboard" });
    }, 600);
  };

  return (
    <section id="login" data-od-id="login">
      <nav className="nav">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); navigate({ to: "/" }); }}>
          <span className="brand-mark">Q</span>
          <span>QA Webapp</span>
        </a>
        <div className="nav-spacer" />
        <button
          className="btn btn-ghost"
          style={{ border: "none", background: "transparent", cursor: "pointer" }}
          onClick={() => navigate({ to: "/" })}
        >
          Cancel
        </button>
      </nav>

      <main className="login-main">
        <div className="login-card" data-od-id="login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to your QA Webapp workspace.</p>

          <form onSubmit={handleLogin}>
            <button
              type="submit"
              className="btn btn-gitlab btn-block btn-lg"
              data-od-id="login-gitlab"
              disabled={loading}
              style={{ width: "100%" }}
            >
              <svg
                className="gitlab-mark"
                viewBox="0 0 586 559"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M461.17 301.83l-18.91-58.12-37.42-114.99a6.43 6.43 0 0 0-12.26 0L355.4 243.81H230.6L193.59 128.72a6.43 6.43 0 0 0-12.26 0L143.81 243.81l-18.91 58.12a12.82 12.82 0 0 0 4.69 14.34L293 435l163.48-118.73a12.82 12.82 0 0 0 4.69-14.34" />
                <path d="M293 435.07l62.41-191.95H230.59L293 435.07z" />
                <path d="M293 435.07L230.59 243.12H143.81L293 435.07z" />
                <path d="M143.81 243.12l-18.91 58.12a12.82 12.82 0 0 0 4.69 14.34L293 435.07 143.81 243.12z" />
                <path d="M143.81 243.12h86.78L193.59 128.72a6.43 6.43 0 0 0-12.26 0l-37.52 114.4z" />
              </svg>
              {loading ? "Signing in…" : "Continue with GitLab"}
            </button>
          </form>

          <div className="divider" />
          <p className="login-sub" style={{ margin: 0, textAlign: "center" }}>
            SSO only · Access is provisioned by your GitLab group owner.
          </p>
        </div>
      </main>
    </section>
  );
}
