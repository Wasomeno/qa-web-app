import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  fmtDate,
  fmtRel,
  getProject,
  RECENT_TEST_RUNS,
  STEPS_TEMPLATE,
  TESTS,
} from "@/lib/mock-data-new";
import type { Step } from "@/lib/mock-data-new";

// Inline icon defs (matches symbols from automation-test.html)
const StepIcon = ({ action }: { action: Step["action"] }) => {
  const props = {
    viewBox: "0 0 16 16",
    width: 14,
    height: 14,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (action) {
    case "navigate":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="6" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <ellipse cx="8" cy="8" rx="3" ry="6" />
        </svg>
      );
    case "type":
      return (
        <svg {...props}>
          <rect x="2.5" y="3.5" width="11" height="9" rx="1.2" />
          <path d="M5 6h6" />
          <path d="M5 9h3" />
          <path d="M11.5 7.5v3.5M10 9.5h3" />
        </svg>
      );
    case "click":
      return (
        <svg {...props}>
          <path d="M5.5 3v9l2.6-2.5L10 13l1.4-0.8L9 8.7 12.2 8.5z" />
        </svg>
      );
    case "select":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="6" />
          <circle cx="8" cy="8" r="2.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "assert":
      return (
        <svg {...props}>
          <path d="M3 8.3l3.4 3.4L13 5" />
        </svg>
      );
    case "webhook":
      return (
        <svg {...props}>
          <path d="M9.5 2L4 9h3l-1 5 5.5-7H8.5z" />
        </svg>
      );
    case "api":
      return (
        <svg {...props}>
          <path d="M6 3c-2 0-2 2-2 3.2c0 1-1 1.8-2 1.8c1 0 2 0.8 2 1.8c0 1.2 0 3.2 2 3.2" />
          <path d="M10 3c2 0 2 2 2 3.2c0 1 1 1.8 2 1.8c-1 0-2 0.8-2 1.8c0 1.2 0 3.2-2 3.2" />
        </svg>
      );
    default:
      return null;
  }
};

const ActionIcon = StepIcon;

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" width={12} height={12} fill="currentColor" aria-hidden="true">
    <path d="M4 2.5v11l8-5.5z" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M6 4l4 4-4 4" />
  </svg>
);

function StatusMenu({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = [
    { id: "passing", label: "passing", color: "var(--success)" },
    { id: "flaky", label: "flaky", color: "var(--warn)" },
    { id: "failing", label: "failing", color: "var(--danger)" },
  ];
  const current = options.find((o) => o.id === value) || options[0];
  const pillClass =
    current.id === "passing"
      ? "pill pill-success"
      : current.id === "failing"
        ? "pill pill-danger"
        : "pill pill-warn";
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className={`${pillClass} pill-edit`}
        style={{ height: 22, padding: "0 10px", fontSize: 11, border: 0, cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        <span className="swatch" />
        <span>{current.label}</span>
        <svg
          className="pill-edit-caret"
          viewBox="0 0 16 16"
          width={10}
          height={10}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          style={{ display: "inline-block", marginLeft: 2, opacity: 0.7 }}
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="status-menu"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              minWidth: 140,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                <span
                  className="status-dot"
                  style={{ background: opt.color }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StepBody({ step }: { step: Step }) {
  const [tab, setTab] = useState<"css" | "xpath" | "testid" | "text">("css");
  const tabs: { id: typeof tab; label: string; value: string }[] = step.selector
    ? [
        { id: "css", label: "css", value: step.selector.css },
        { id: "xpath", label: "xpath", value: step.selector.xpath },
        { id: "testid", label: "testid", value: step.selector.testid },
        { id: "text", label: "text", value: step.selector.text },
      ]
    : [];

  const [copied, setCopied] = useState(false);

  return (
    <div className="step-body">
      <p className="step-desc">{step.description}</p>
      {step.selector && (
        <div className="step-section">
          <div className="step-section-head">
            <span className="step-section-title">Selector</span>
            <span className="panel-meta">4 strategies · last validated today</span>
          </div>
          <div className="selector-tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`selector-tab${tab === t.id ? " is-active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="strategy-dot" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="selector-code">
            <pre>{tabs.find((t) => t.id === tab)?.value}</pre>
            <button
              type="button"
              className={`selector-copy${copied ? " is-copied" : ""}`}
              onClick={() => {
                navigator.clipboard.writeText(
                  tabs.find((t) => t.id === tab)?.value || "",
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
      {step.apiTarget && (
        <div className="step-section" style={{ marginTop: 10 }}>
          <div className="step-section-head">
            <span className="step-section-title">API request</span>
            <span className="panel-meta">replayed from session</span>
          </div>
          <div className="step-target-row">
            <span className="step-target-method api">
              {step.apiTarget.method}
            </span>
            <span className="step-target-path">{step.apiTarget.path}</span>
          </div>
        </div>
      )}
      {step.value && (
        <div className="step-section" style={{ marginTop: 10 }}>
          <div className="step-section-head">
            <span className="step-section-title">Value</span>
          </div>
          <div className="step-value">
            <span className="step-value-label">Typed</span>
            <span className="step-value-mono">{step.value}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TestDetailPage({ testId }: { testId: string }) {
  const test = TESTS.find((t) => t.id === testId) || TESTS[0];
  const project = getProject(test.project);
  const [openStep, setOpenStep] = useState<number | null>(1);
  const [status, setStatus] = useState("passing");
  const [title, setTitle] = useState(test.name);
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(test.name);

  return (
    <div className="app-pane" id="pane-test-detail" data-od-id="pane-test-detail">
      <div className="page-head">
        <div className="page-head-text" style={{ width: "100%" }}>
          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/tests">Tests</Link>
            <span className="sep">›</span>
            <Link to={`/tests?project=${project.id}`}>{project.label}</Link>
            <span className="sep">›</span>
            <span className="current">{test.name}</span>
          </nav>
          <div className="detail-title-row">
            {editing ? (
              <input
                className="edit-input detail-title pill-edit-host"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                autoFocus
                style={{ flex: 1 }}
              />
            ) : (
              <span className="detail-title pill-edit-host">{title}</span>
            )}
            <StatusMenu value={status} onChange={setStatus} />
            <div className="detail-actions">
              {editing ? (
                <div className="detail-actions-edit" style={{ display: "inline-flex" }}>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditedTitle(title);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                      setTitle(editedTitle);
                      setEditing(false);
                    }}
                  >
                    Save changes
                  </button>
                </div>
              ) : (
                <div className="detail-actions-view" style={{ display: "inline-flex" }}>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setEditing(true)}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width={12}
                      height={12}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11.5 2.5l2 2L5 13l-3 1 1-3z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => alert("Run now: not implemented in UI migration")}
                  >
                    <PlayIcon />
                    Run now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="detail-stats" data-od-id="detail-stats">
          <div className="stat">
            <div className="stat-label">Pass rate · 30d</div>
            <div className="stat-value">96.7%</div>
          </div>
          <div className="stat">
            <div className="stat-label">Last run</div>
            <div
              className="stat-value"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: 15,
              }}
            >
              {fmtRel(test.ranAt)}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Avg duration</div>
            <div className="stat-value">9.9s</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total runs</div>
            <div className="stat-value">1,842</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-col-main">
            {/* Steps panel */}
            <section className="panel" data-od-id="detail-steps">
              <div className="panel-head">
                <span className="panel-title">Steps</span>
                <span className="panel-meta">{test.steps} total</span>
                <div className="panel-head-right">
                  <button className="btn btn-secondary btn-add-step" type="button">
                    + Add step
                  </button>
                </div>
              </div>
              <div className="steps-list">
                {STEPS_TEMPLATE.slice(0, test.steps).map((step) => {
                  const isOpen = openStep === step.num;
                  return (
                    <div key={step.num}>
                      <div
                        className={`step-row${isOpen ? " is-open" : ""}`}
                        onClick={() =>
                          setOpenStep(isOpen ? null : step.num)
                        }
                      >
                        <span className="step-chevron">
                          <ChevronIcon />
                        </span>
                        <span className="step-icon">
                          <ActionIcon action={step.action} />
                        </span>
                        <span className="step-action">{step.action}</span>
                        <span className="step-name">{step.name}</span>
                        <span className="step-time">{step.time}</span>
                        <span
                          className={`step-marker ${step.status === "passed" ? "passed" : "failed"}`}
                        >
                          <svg
                            viewBox="0 0 16 16"
                            width={10}
                            height={10}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {step.status === "passed" ? (
                              <path d="M3 8.5l3 3 7-8" />
                            ) : (
                              <>
                                <path d="M4 4l8 8" />
                                <path d="M12 4l-8 8" />
                              </>
                            )}
                          </svg>
                        </span>
                      </div>
                      {isOpen && <StepBody step={step} />}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recent runs panel */}
            <section className="panel" data-od-id="detail-runs">
              <div className="panel-head">
                <span className="panel-title">Recent runs</span>
                <span className="panel-meta">last 24h</span>
              </div>
              {RECENT_TEST_RUNS.map((run) => {
                const pillClass =
                  run.status === "passed"
                    ? "pill pill-success"
                    : run.status === "failed"
                      ? "pill pill-danger"
                      : "pill pill-warn";
                const label =
                  run.status === "passed"
                    ? "passed"
                    : run.status === "failed"
                      ? "failed"
                      : "flaky";
                return (
                  <Link
                    key={run.id}
                    className="run-row"
                    to={`/runs/${run.id}`}
                    style={{ cursor: "pointer", textDecoration: "none" }}
                  >
                    <span className="run-id">
                      <span className="commit-dot" />#{run.id} · {run.sha}
                    </span>
                    <span className="run-trigger">{run.trigger}</span>
                    <span className="run-when">{fmtRel(run.when)}</span>
                    <span style={{ textAlign: "right" }}>
                      <span className={pillClass} style={{ height: 20 }}>
                        <span className="swatch" />
                        {label}
                      </span>{" "}
                      <span
                        className="run-duration"
                        style={{ marginLeft: 8 }}
                      >
                        {run.duration}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </section>
          </div>

          {/* Right column: properties */}
          <div className="detail-col-side">
            <section className="panel" data-od-id="detail-properties">
              <div className="panel-head">
                <span className="panel-title">Properties</span>
              </div>
              <div className="kv-list">
                <div className="kv-row">
                  <div className="kv-key">Project</div>
                  <div className="kv-val">
                    <span className="td-project">
                      <span
                        className="project-dot"
                        style={{ background: project.color }}
                      />
                      {project.label}
                    </span>
                  </div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Owner</div>
                  <div className="kv-val">
                    <span className="kv-owner">
                      <span className="avatar">
                        {test.owner?.initials || "EM"}
                      </span>
                      {test.owner?.name || "Eli Marsh"}
                    </span>
                  </div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Created</div>
                  <div className="kv-val">{fmtDate(test.createdAt)}</div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Last run</div>
                  <div className="kv-val">{fmtRel(test.ranAt)}</div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Tags</div>
                  <div className="kv-val">
                    <div className="kv-tags">
                      <span className="kv-tag">checkout</span>
                      <span className="kv-tag">stripe</span>
                      <span className="kv-tag">p0</span>
                    </div>
                  </div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Schedule</div>
                  <div className="kv-val">Every 30m · 24/7</div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Spec</div>
                  <div className="kv-val">
                    <Link to="/specs/create-invoice">
                      checkout-web › checkout
                    </Link>
                  </div>
                </div>
                <div className="kv-row">
                  <div className="kv-key">Environment</div>
                  <div className="kv-val">staging · eu-west-1</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
