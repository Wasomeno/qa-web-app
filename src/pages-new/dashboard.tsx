import { Link } from "@tanstack/react-router";
import { BY_PROJECT, DASHBOARD_STATS, PROJECTS, RECENT_RUNS, fmtRel, getProject } from "@/lib/mock-data-new";

function Pill({ status }: { status: "passed" | "failed" | "flaky" }) {
  const className =
    status === "passed"
      ? "pill pill-success"
      : status === "failed"
        ? "pill pill-danger"
        : "pill pill-warn";
  const label = status === "passed" ? "passed" : status === "failed" ? "failed" : "flaky";
  return (
    <span className={className}>
      <span className="swatch" />
      {label}
    </span>
  );
}

export function DashboardPage() {
  return (
    <div className="app-pane" id="pane-dashboard" data-od-id="pane-dashboard">
      <div className="page-head">
        <div className="page-head-text">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            A live read of how your automated tests are doing across every project.
          </p>
        </div>
        <div className="page-head-actions">
          <div
            className="field"
            style={{ height: 28, cursor: "default" }}
          >
            <span className="field-label">Range</span>
            <span>Last 24h</span>
            <span className="field-caret" />
          </div>
          <button
            className="btn btn-secondary"
            style={{ height: 28 }}
            onClick={() => alert("Filter: not implemented in UI migration")}
          >
            Filter
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Stat strip */}
        <div className="stat-strip" data-od-id="dash-stats">
          <div className="stat">
            <div className="stat-label">Runs last 24h</div>
            <div className="stat-value">
              {DASHBOARD_STATS.runsLast24h.value}
              <span className="stat-delta up">{DASHBOARD_STATS.runsLast24h.delta}</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Pass rate</div>
            <div className="stat-value">
              {DASHBOARD_STATS.passRate.value}
              <span className="stat-delta up">{DASHBOARD_STATS.passRate.delta}</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Failures</div>
            <div className="stat-value">
              {DASHBOARD_STATS.failures.value}
              <span className="stat-delta down">{DASHBOARD_STATS.failures.delta}</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Avg duration</div>
            <div className="stat-value">
              {DASHBOARD_STATS.avgDuration.value}
              <span className="stat-delta down">{DASHBOARD_STATS.avgDuration.delta}</span>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          {/* Recent test runs */}
          <section className="panel" data-od-id="dash-recent">
            <div className="panel-head">
              <span className="panel-title">Recent test runs</span>
              <span className="panel-meta">live · auto-refresh 30s</span>
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

              {RECENT_RUNS.map((t) => {
                const proj = getProject(t.project);
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
                      <Pill status={t.status as "passed" | "failed" | "flaky"} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Success vs failure chart */}
          <section className="panel" data-od-id="dash-graph">
            <div className="panel-head">
              <span className="panel-title">Success vs failure · last 14 days</span>
              <span className="panel-meta">per-project</span>
            </div>
            <div className="panel-body">
              <div className="chart" aria-label="success and failure rate graph">
                <svg viewBox="0 0 360 220" preserveAspectRatio="none">
                  <g stroke="var(--border)" strokeWidth="1">
                    <line x1="0" y1="40" x2="360" y2="40" />
                    <line x1="0" y1="90" x2="360" y2="90" />
                    <line x1="0" y1="140" x2="360" y2="140" />
                    <line x1="0" y1="190" x2="360" y2="190" />
                  </g>
                  <g fontFamily="ui-monospace, monospace" fontSize="9" fill="var(--muted)">
                    <text x="2" y="38">100%</text>
                    <text x="2" y="88">75%</text>
                    <text x="2" y="138">50%</text>
                    <text x="2" y="188">25%</text>
                  </g>
                  <path
                    d="M0,52 L30,48 L60,55 L90,42 L120,38 L150,46 L180,40 L210,44 L240,32 L270,38 L300,30 L330,34 L360,28"
                    fill="none"
                    stroke="oklch(62% 0.15 150)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,52 L30,48 L60,55 L90,42 L120,38 L150,46 L180,40 L210,44 L240,32 L270,38 L300,30 L330,34 L360,28 L360,200 L0,200 Z"
                    fill="oklch(62% 0.15 150)"
                    fillOpacity="0.08"
                  />
                  <path
                    d="M0,168 L30,172 L60,165 L90,178 L120,180 L150,174 L180,180 L210,176 L240,184 L270,178 L300,186 L330,180 L360,186"
                    fill="none"
                    stroke="oklch(60% 0.18 25)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray="3 3"
                  />
                  <circle cx="360" cy="28" r="3" fill="oklch(62% 0.15 150)" />
                  <circle cx="360" cy="186" r="3" fill="oklch(60% 0.18 25)" />
                  <text
                    x="354"
                    y="20"
                    textAnchor="end"
                    fontFamily="ui-monospace, monospace"
                    fontSize="10"
                    fontWeight="600"
                    fill="oklch(62% 0.15 150)"
                    fontVariantNumeric="tabular-nums"
                  >
                    97%
                  </text>
                  <text
                    x="354"
                    y="180"
                    textAnchor="end"
                    fontFamily="ui-monospace, monospace"
                    fontSize="10"
                    fill="oklch(60% 0.18 25)"
                    fontVariantNumeric="tabular-nums"
                  >
                    3%
                  </text>
                  <g fontFamily="ui-monospace, monospace" fontSize="9" fill="var(--muted)">
                    <text x="2" y="212">Aug 18</text>
                    <text x="110" y="212">Aug 22</text>
                    <text x="220" y="212">Aug 26</text>
                    <text x="320" y="212">Sep 01</text>
                  </g>
                </svg>
              </div>
              <div className="chart-legend">
                <span className="key">
                  <span
                    className="swatch"
                    style={{ background: "oklch(62% 0.15 150)" }}
                  />
                  Successful runs
                </span>
                <span className="key">
                  <span
                    className="swatch"
                    style={{ background: "oklch(60% 0.18 25)" }}
                  />
                  Failed runs
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* By project */}
        <section className="panel" style={{ marginTop: 20 }} data-od-id="dash-projects">
          <div className="panel-head">
            <span className="panel-title">By project</span>
            <span className="panel-meta">runs · 7d</span>
          </div>
          <div className="by-project-list">
            {BY_PROJECT.map((row) => {
              const proj = PROJECTS.find((p) => p.id === row.id)!;
              const rate = ((row.passed / row.runs) * 100).toFixed(1);
              return (
                <div key={row.id} className="by-project-row">
                  <span className="by-project-name">
                    <span
                      className="project-dot"
                      style={{ background: proj.color }}
                    />
                    {proj.label}
                  </span>
                  <span className="by-project-counts">
                    {row.runs} runs · {row.passed} passed · {row.failed} failed · {row.flaky} flaky
                  </span>
                  <span className="by-project-rate">{rate}%</span>
                  <span className="by-project-bar">
                    <span
                      className="bar-fill"
                      style={{ width: `${rate}%`, background: proj.color }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
