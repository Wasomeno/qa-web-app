import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

const REPOS = {
  frontend: [
    { id: "acme/web-storefront", label: "acme/web-storefront", defaultBranch: "main", lang: "TypeScript" },
    { id: "acme/checkout-web", label: "acme/checkout-web", defaultBranch: "main", lang: "TypeScript" },
    { id: "acme/admin-portal", label: "acme/admin-portal", defaultBranch: "main", lang: "TypeScript" },
    { id: "acme/marketing-site", label: "acme/marketing-site", defaultBranch: "main", lang: "TypeScript" },
    { id: "acme/mobile-web-shell", label: "acme/mobile-web-shell", defaultBranch: "develop", lang: "TypeScript" },
    { id: "acme/docs-portal", label: "acme/docs-portal", defaultBranch: "main", lang: "TypeScript" },
  ],
  backend: [
    { id: "acme/api-gateway", label: "acme/api-gateway", defaultBranch: "main", lang: "Go" },
    { id: "acme/billing-service", label: "acme/billing-service", defaultBranch: "main", lang: "Go" },
    { id: "acme/orders-service", label: "acme/orders-service", defaultBranch: "main", lang: "Go" },
    { id: "acme/auth-service", label: "acme/auth-service", defaultBranch: "main", lang: "Go" },
    { id: "acme/notifications", label: "acme/notifications", defaultBranch: "main", lang: "Ruby" },
    { id: "acme/webhooks-router", label: "acme/webhooks-router", defaultBranch: "main", lang: "Go" },
  ],
  specs: [
    { id: "acme/specs-storefront", label: "acme/specs-storefront", defaultBranch: "main", lang: "Gherkin" },
    { id: "acme/specs-billing", label: "acme/specs-billing", defaultBranch: "main", lang: "Gherkin" },
    { id: "acme/specs-ops", label: "acme/specs-ops", defaultBranch: "main", lang: "Gherkin" },
    { id: "acme/specs-docs", label: "acme/specs-docs", defaultBranch: "main", lang: "Gherkin" },
    { id: "acme/specs-shared", label: "acme/specs-shared", defaultBranch: "main", lang: "Gherkin" },
  ],
};

type RepoKey = keyof typeof REPOS;

function Dropdown({
  name,
  placeholder,
  items,
  value,
  onChange,
}: {
  name: RepoKey;
  placeholder: string;
  items: typeof REPOS.frontend;
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const selected = items.find((r) => r.id === value);

  return (
    <div
      className={`dropdown${open ? " is-open" : ""}`}
      data-dropdown
      data-name={name}
    >
      <button
        type="button"
        className="dropdown-trigger"
        data-dropdown-trigger
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) setHighlight(0);
        }}
      >
        <span className={`dropdown-value${selected ? "" : " is-placeholder"}`}>
          {selected
            ? `${selected.label} · ${selected.defaultBranch}`
            : placeholder}
        </span>
        <svg
          className="dropdown-chev"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      <ul
        className="dropdown-menu"
        role="listbox"
        aria-label={placeholder}
        style={!open ? { display: "none" } : {}}
      >
        {items.map((repo, i) => (
          <li
            key={repo.id}
            className={`dropdown-option${i === highlight ? " is-highlighted" : ""}${
              repo.id === value ? " is-selected" : ""
            }`}
            role="option"
            data-index={i}
            data-id={repo.id}
            onMouseEnter={() => setHighlight(i)}
            onClick={() => {
              onChange(repo.id);
              setOpen(false);
            }}
          >
            <span className="dropdown-option-label">{repo.label}</span>
            <span className="dropdown-option-meta">
              {repo.defaultBranch} · {repo.lang}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AddProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [frontend, setFrontend] = useState("");
  const [backend, setBackend] = useState("");
  const [specs, setSpecs] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    visible: boolean;
  }>({ type: "success", visible: false });
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!frontend) newErrors.frontend = true;
    if (!backend) newErrors.backend = true;
    if (!specs) newErrors.specs = true;
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setBanner({ type: "error", visible: true });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setBanner({ type: "success", visible: true });
      setTimeout(() => navigate({ to: "/" }), 1500);
    }, 800);
  };

  const previewSuccess = () => {
    setName("checkout-web");
    setFrontend("acme/web-storefront");
    setBackend("acme/billing-service");
    setSpecs("acme/specs-storefront");
    setNotes("Production storefront. Default branch main. CI: GitLab CI on push to main. Deploys via Argo.");
    setErrors({});
    setBanner({ type: "success", visible: true });
  };

  const previewError = () => {
    setName("");
    setFrontend("");
    setBackend("");
    setSpecs("");
    setNotes("");
    setErrors({ name: true, frontend: true, backend: true, specs: true });
    setBanner({ type: "error", visible: true });
  };

  return (
    <div className="app-pane" id="pane-add-project" data-od-id="pane-add-project">
      <div className="page-head">
        <div className="page-head-text">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            <Link to="/" style={{ color: "var(--muted)" }}>
              Projects
            </Link>
            <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>
            <span style={{ color: "var(--fg)" }}>New project</span>
          </div>
          <h1 className="page-title">Add project</h1>
          <p className="page-subtitle">
            Connect a new project by pointing at its frontend, backend, and specs repositories.
          </p>
        </div>
      </div>

      <div className="page-body">
        <div className="form-wrap">
          <div
            className={`form-banner is-${banner.type}${banner.visible ? " is-visible" : ""}`}
            role="status"
            aria-live="polite"
            data-od-id="add-project-banner"
          >
            <svg
              className="banner-icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {banner.type === "success" ? (
                <path d="M3 8l3.5 3.5L13 5" />
              ) : (
                <>
                  <path d="M4 4l8 8" />
                  <path d="M12 4l-8 8" />
                </>
              )}
            </svg>
            <div>
              <span className="banner-title">
                {banner.type === "success" ? "Project created" : "Some fields need attention"}
              </span>
              <span className="banner-msg">
                {banner.type === "success"
                  ? "The project has been added and is ready to receive specs and runs."
                  : "Fill in the required fields below and try again."}
              </span>
            </div>
          </div>

          <section className="panel" data-od-id="add-project-form-panel">
            <div className="panel-head">
              <div className="panel-head-right">
                <span className="demo-toggle" role="group" aria-label="Preview form states">
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={previewSuccess}
                    title="Preview success state"
                  >
                    Demo: success
                  </button>
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={previewError}
                    title="Preview error state"
                  >
                    Demo: error
                  </button>
                </span>
              </div>
            </div>
            <div className="panel-body">
              <form
                id="add-project-form"
                className="form"
                noValidate
                onSubmit={submit}
                data-od-id="add-project-form"
                autoComplete="off"
              >
                <div className="form-row" data-od-id="row-name">
                  <label className="form-label" htmlFor="ap-name">
                    Project name <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="ap-name"
                    className="input"
                    type="text"
                    name="name"
                    placeholder="e.g. checkout-web"
                    maxLength={64}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: false });
                    }}
                    required
                    style={errors.name ? { borderColor: "var(--danger)" } : {}}
                  />
                  {errors.name && (
                    <div className="form-error" style={{ display: "block" }}>
                      Project name is required and must be 64 characters or fewer.
                    </div>
                  )}
                </div>

                <div className="form-row" data-od-id="row-frontend">
                  <label className="form-label" htmlFor="ap-frontend-trigger">
                    Frontend repository <span className="req" aria-hidden="true">*</span>
                  </label>
                  <Dropdown
                    name="frontend"
                    placeholder="Select a frontend repository…"
                    items={REPOS.frontend}
                    value={frontend}
                    onChange={(v) => {
                      setFrontend(v);
                      if (errors.frontend) setErrors({ ...errors, frontend: false });
                    }}
                  />
                  <div className="form-help">Pulled from the GitLab repos you have access to.</div>
                  {errors.frontend && (
                    <div className="form-error" style={{ display: "block" }}>
                      Pick a frontend repository.
                    </div>
                  )}
                </div>

                <div className="form-row" data-od-id="row-backend">
                  <label className="form-label" htmlFor="ap-backend-trigger">
                    Backend repository <span className="req" aria-hidden="true">*</span>
                  </label>
                  <Dropdown
                    name="backend"
                    placeholder="Select a backend repository…"
                    items={REPOS.backend}
                    value={backend}
                    onChange={(v) => {
                      setBackend(v);
                      if (errors.backend) setErrors({ ...errors, backend: false });
                    }}
                  />
                  <div className="form-help">The service this project's frontend talks to.</div>
                  {errors.backend && (
                    <div className="form-error" style={{ display: "block" }}>
                      Pick a backend repository.
                    </div>
                  )}
                </div>

                <div className="form-row" data-od-id="row-specs">
                  <label className="form-label" htmlFor="ap-specs-trigger">
                    Specs repository <span className="req" aria-hidden="true">*</span>
                  </label>
                  <Dropdown
                    name="specs"
                    placeholder="Select a specs repository…"
                    items={REPOS.specs}
                    value={specs}
                    onChange={(v) => {
                      setSpecs(v);
                      if (errors.specs) setErrors({ ...errors, specs: false });
                    }}
                  />
                  <div className="form-help">Where your Gherkin / spec files live.</div>
                  {errors.specs && (
                    <div className="form-error" style={{ display: "block" }}>
                      Pick a specs repository.
                    </div>
                  )}
                </div>

                <div className="form-row" data-od-id="row-notes">
                  <label className="form-label" htmlFor="ap-notes">
                    Additional information
                  </label>
                  <textarea
                    id="ap-notes"
                    className="textarea"
                    name="notes"
                    rows={5}
                    placeholder="Anything else we should know — default branches, environments, CI caveats, owners…"
                    maxLength={1000}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="form-help">
                    Optional. Visible to anyone with access to this project.
                  </div>
                </div>

                <div
                  className="form-row is-inline"
                  style={{ justifyContent: "flex-end", gap: 10, marginTop: 4 }}
                >
                  <Link className="btn btn-secondary" to="/" data-od-id="add-project-cancel-2">
                    Cancel
                  </Link>
                  <button
                    id="ap-submit"
                    className="btn btn-primary"
                    type="submit"
                    data-od-id="add-project-submit"
                    disabled={submitting}
                  >
                    <span className="btn-spinner" aria-hidden="true" />
                    <span data-submit-label>
                      {submitting ? "Creating…" : "Create project"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
