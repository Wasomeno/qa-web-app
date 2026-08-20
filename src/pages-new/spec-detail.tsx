import { Link } from "@tanstack/react-router";
import { fmtDate, fmtRel, getProject, SPECS, TESTS } from "@/lib/mock-data-new";

export function SpecDetailPage({ specId }: { specId: string }) {
  const spec = SPECS.find((s) => s.id === specId) || SPECS[0];
  const project = getProject(spec.project);
  const linkedTests = TESTS.filter(
    (t) => t.project === spec.project && spec.name.toLowerCase().includes("invoice")
  ).slice(0, 3);

  return (
    <div className="app-pane" id="pane-spec-detail" data-od-id="pane-spec-detail">
      <div className="page-head">
        <div className="page-head-text" style={{ width: "100%" }}>
          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/specs">Specs</Link>
            <span className="sep">›</span>
            <Link to={`/specs?project=${project.id}`}>{project.label}</Link>
            <span className="sep">›</span>
            <span className="current">{spec.name}</span>
          </nav>
          <div className="detail-title-row">
            <span className="detail-title pill-edit-host">{spec.name}</span>
            <div className="detail-actions">
              <div className="detail-actions-view" style={{ display: "inline-flex" }}>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => alert("Edit: not implemented in UI migration")}
                >
                  <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.5 2.5l2 2L5 13l-3 1 1-3z" />
                  </svg>
                  Edit
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => alert("Generate test: not implemented in UI migration")}
                >
                  <svg viewBox="0 0 16 16" width={12} height={12} fill="currentColor">
                    <path d="M4 2.5v11l8-5.5z" />
                  </svg>
                  Generate test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="detail-stats" data-od-id="spec-stats">
          <div className="stat">
            <div className="stat-label">Project</div>
            <div
              className="stat-value"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15 }}
            >
              <span className="td-project">
                <span className="project-dot" style={{ background: project.color }} />
                {project.label}
              </span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Author</div>
            <div
              className="stat-value"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15 }}
            >
              {spec.author.name}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Created</div>
            <div
              className="stat-value"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15 }}
            >
              {fmtDate(spec.createdAt)}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Linked tests</div>
            <div className="stat-value">{linkedTests.length || 1}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-col-main">
            <section className="panel" data-od-id="spec-body">
              <div className="panel-head">
                <span className="panel-title">Description</span>
              </div>
              <div className="panel-body">
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--fg)" }}>
                  {spec.description}
                </p>
              </div>
            </section>

            <section
              className="panel"
              style={{ marginTop: 20 }}
              data-od-id="spec-tests"
            >
              <div className="panel-head">
                <span className="panel-title">Linked tests</span>
                <span className="panel-meta">{linkedTests.length || 1} test{linkedTests.length === 1 ? "" : "s"}</span>
              </div>
              <div className="recent-list">
                <div
                  className="recent-row"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    paddingTop: 4,
                    paddingBottom: 8,
                  }}
                >
                  <div>Name</div>
                  <div style={{ textAlign: "right" }}>Project</div>
                  <div style={{ textAlign: "right" }}>When</div>
                  <div style={{ textAlign: "right" }}>Status</div>
                </div>
                {(linkedTests.length > 0 ? linkedTests : [TESTS[0]]).map((t) => {
                  const proj = getProject(t.project);
                  const pillClass =
                    t.status === "passed"
                      ? "pill pill-success"
                      : t.status === "failed"
                        ? "pill pill-danger"
                        : "pill pill-warn";
                  return (
                    <Link
                      key={t.id}
                      className="recent-row"
                      to={`/tests/${t.id}`}
                      style={{ cursor: "pointer", textDecoration: "none" }}
                    >
                      <div className="recent-name">{t.name}</div>
                      <div className="recent-project">{proj.label}</div>
                      <div className="recent-when">{fmtRel(t.ranAt)}</div>
                      <div style={{ textAlign: "right" }}>
                        <span className={pillClass} style={{ height: 20 }}>
                          <span className="swatch" />
                          {t.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="detail-col-side">
            <section className="panel" data-od-id="spec-properties">
              <div className="panel-head">
                <span className="panel-title">Properties</span>
              </div>
              <div className="kv-list">
                <div className="kv-row">
                  <div className="kv-key">Project</div>
                  <div className="kv-val">
                    <span className="td-project">
                      <span className="project-dot" style={{ background: project.color }} />
                      {project.label}
                    </span>
                  </div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Author</div>
                  <div className="kv-val">
                    <span className="kv-owner">
                      <span className="avatar">{spec.author.initials}</span>
                      {spec.author.name}
                    </span>
                  </div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Created</div>
                  <div className="kv-val">{fmtDate(spec.createdAt)}</div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Last updated</div>
                  <div className="kv-val">{fmtRel(spec.createdAt)}</div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Tags</div>
                  <div className="kv-val">
                    <div className="kv-tags">
                      <span className="kv-tag">spec</span>
                      <span className="kv-tag">{project.label.split("-")[0]}</span>
                    </div>
                  </div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Source</div>
                  <div className="kv-val">manual</div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Reviewed by</div>
                  <div className="kv-val">
                    <span className="kv-owner">
                      <span className="avatar">DR</span>
                      Daniel Rao
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
