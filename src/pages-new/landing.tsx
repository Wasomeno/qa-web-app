import { Link } from "@tanstack/react-router";

export function LandingPage() {
  return (
    <section id="landing" data-od-id="landing">
      <nav className="nav" data-od-id="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">Q</span>
          <span>QA Webapp</span>
        </Link>
        <div className="nav-links">
          <span className="nav-link">About</span>
        </div>
        <div className="nav-spacer" />
        <Link
          to="/login"
          className="btn btn-secondary"
          style={{ border: "none", boxShadow: "none" }}
        >
          Log in
        </Link>
      </nav>

      <main className="landing-main">
        <div className="landing-card" data-od-id="landing-hero">
          <h1 className="display">
            Run, watch and audit every webapp test from one place.
          </h1>
          <p className="lede">
            QA Webapp is a workspace for teams shipping automated end-to-end
            tests on the web — schedule runs, watch them live, and trace every
            failure back to the commit that caused it.
          </p>
        </div>

        <div className="landing-preview" data-od-id="landing-preview">
          <div className="preview-chrome">
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-url">qa-webapp / dashboard</span>
            <span className="preview-pane-meta">
              <span className="live-dot" />
              live
            </span>
          </div>
          <div className="preview-body preview-body--video">
            <video
              className="dashboard-motion"
              src="/qa-dashboard-preview.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="QA Webapp dashboard product motion"
            />
          </div>
        </div>
      </main>
    </section>
  );
}
