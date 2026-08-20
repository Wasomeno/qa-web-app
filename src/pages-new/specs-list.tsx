import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { fmtRel, getProject, PROJECTS, SPECS } from "@/lib/mock-data-new";
import type { Spec } from "@/lib/mock-data-new";

const SORTS = {
  created: { label: "Created · newest", cmp: (a: Spec, b: Spec) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() },
  "created-asc": { label: "Created · oldest", cmp: (a: Spec, b: Spec) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() },
  name: { label: "Name · A → Z", cmp: (a: Spec, b: Spec) => a.name.localeCompare(b.name) },
  "name-desc": { label: "Name · Z → A", cmp: (a: Spec, b: Spec) => b.name.localeCompare(a.name) },
};

type SortKey = keyof typeof SORTS;

const SpecIcon = () => (
  <svg
    className="spec-glyph"
    viewBox="0 0 16 16"
    width={13}
    height={13}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 2h6l2 2v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
    <path d="M9 2v3h3" />
  </svg>
);

function FilterMenu({
  anchor,
  items,
  onPick,
  onClose,
}: {
  anchor: HTMLElement;
  items: { id: string; label: string }[];
  onPick: (item: { id: string; label: string }) => void;
  onClose: () => void;
}) {
  const rect = anchor.getBoundingClientRect();
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={onClose} />
      <div
        style={{
          position: "fixed",
          left: rect.left,
          top: rect.bottom + 4,
          minWidth: rect.width,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: 4,
          zIndex: 100,
          fontSize: 13,
        }}
      >
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => {
              onPick(it);
              onClose();
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "6px 10px",
              background: "transparent",
              border: "none",
              borderRadius: 4,
              color: "var(--fg)",
              cursor: "pointer",
              font: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(96% 0.005 250)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </>
  );
}

export interface SpecsListPageProps {
  /**
   * When set, the page is the project-scoped Specs list at
   * `/projects/$id/specs`. The project filter is pre-applied and the
   * toolbar's project dropdown is hidden — the surrounding context
   * already provides the project identity.
   */
  defaultProject?: string;
}

export function SpecsListPage({ defaultProject }: SpecsListPageProps = {}) {
  // Pull the project filter from whatever route we are on. The list page
  // can be mounted at /specs (global) or /projects/$id/specs (project-scoped);
  // both routes register `project` in their validateSearch shape.
  let projectParam: string | undefined;
  try {
    projectParam = (useSearch({ strict: false }) as { project?: string }).project;
  } catch {
    projectParam = undefined;
  }
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>(
    defaultProject ?? projectParam ?? "all",
  );
  const [sort, setSort] = useState<SortKey>("created");
  const [openMenu, setOpenMenu] = useState<"filter" | "sort" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = SPECS;
    if (filter !== "all") list = list.filter((s) => s.project === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [filter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort(SORTS[sort].cmp);
  }, [filtered, sort]);

  const applyFilter = (id: string) => {
    if (defaultProject) {
      // In project context, switching project means navigating to a
      // different project-scoped page. We don't allow switching from
      // inside a project view; the user uses the sidebar.
      return;
    }
    setFilter(id);
    if (id === "all") navigate({ to: "/specs", search: {} });
    else navigate({ to: "/specs", search: { project: id } });
  };

  const filterLabel = filter === "all" ? "All projects" : getProject(filter).label;
  const sortLabel = SORTS[sort].label;
  const scopeLabel = defaultProject ? getProject(defaultProject).label : null;

  return (
    <div className="app-pane" id="pane-specs" data-od-id="pane-specs">
      <div className="page-head">
        <div className="page-head-text">
          {scopeLabel && (
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
              <Link to={`/tests?project=${defaultProject}`}>{scopeLabel}</Link>
              <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>
              <span style={{ color: "var(--fg)" }}>Specs</span>
            </div>
          )}
          <h1 className="page-title">Specs</h1>
          <p className="page-subtitle">
            Every product behavior your team has committed to, organized by project.
          </p>
        </div>
        <div className="page-head-actions">
          <button
            className="btn btn-secondary"
            onClick={() => alert("Import: not implemented in UI migration")}
          >
            Import
          </button>
          <button
            className="btn btn-primary"
            onClick={() => alert("New spec: not implemented in UI migration")}
          >
            New spec
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="toolbar" data-od-id="specs-toolbar">
          {!defaultProject && (
            <div
              className="field"
              id="specs-filter"
              data-od-id="specs-filter"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === "filter" ? null : "filter");
              }}
              style={{ cursor: "pointer" }}
            >
              <span className="field-label">Project</span>
              <span>{filterLabel}</span>
              <span className="field-caret" />
            </div>
          )}

          <div className="field search">
            <svg
              viewBox="0 0 16 16"
              width={13}
              height={13}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              style={{ color: "var(--muted)" }}
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L13.5 13.5" />
            </svg>
            <input
              type="text"
              placeholder="Search specs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            className="field"
            id="specs-sort"
            data-od-id="specs-sort"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === "sort" ? null : "sort");
            }}
            style={{ cursor: "pointer" }}
          >
            <span className="field-label">Sort</span>
            <span>{sortLabel}</span>
            <span className="field-caret" />
          </div>

          <div className="spacer" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {SPECS.length} specs · {PROJECTS.length} projects
          </span>
        </div>

        <section className="panel" data-od-id="specs-panel">
          <table className="specs-table">
            <thead>
              <tr>
                <th className="col-spec-name" data-sort="name">
                  Name <span className="caret">↕</span>
                </th>
                <th className="col-spec-project">Project</th>
                <th className="col-spec-created" data-sort="created">
                  Created <span className="caret">↕</span>
                </th>
                <th className="col-spec-author">Author</th>
                <th className="col-spec-desc">Description</th>
              </tr>
            </thead>
            <tbody id="specs-tbody">
              {sorted.map((s) => {
                const proj = getProject(s.project);
                return (
                  <tr
                    key={s.id}
                    data-od-id={`spec-row-${s.id}`}
                    onClick={() => navigate({ to: `/specs/${s.id}` })}
                  >
                    <td className="td-spec-name">
                      <Link
                        className="td-spec-name-link"
                        to={`/specs/${s.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SpecIcon />
                        {s.name}
                      </Link>
                    </td>
                    <td>
                      <span className="td-project">
                        <span className="project-dot" style={{ background: proj.color }} />
                        {proj.label}
                      </span>
                    </td>
                    <td className="col-spec-created">
                      <span title={new Date(s.createdAt).toLocaleString()}>
                        {fmtRel(s.createdAt)}
                      </span>
                    </td>
                    <td className="col-spec-author">
                      <span
                        className="author-chip"
                        title={`${s.author.name} · ${s.author.handle}`}
                      >
                        <span className="avatar avatar-sm">{s.author.initials}</span>
                        <span className="author-name">{s.author.name}</span>
                      </span>
                    </td>
                    <td className="col-spec-desc">{s.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="table-foot">
            <span>
              {sorted.length} spec{sorted.length === 1 ? "" : "s"}
              {!defaultProject && filter !== "all" ? " · filtered" : ""}
            </span>
            <div className="spacer" />
            <div className="pager">
              <span className="page-btn">‹</span>
              <span className="page-btn is-active">1</span>
              <span className="page-btn">2</span>
              <span className="page-btn">›</span>
            </div>
          </div>
        </section>
      </div>

      {openMenu === "filter" && (
        <FilterMenu
          anchor={document.getElementById("specs-filter")!}
          items={[
            { id: "all", label: "All projects" },
            ...PROJECTS.map((p) => ({ id: p.id, label: p.label })),
          ]}
          onPick={(it) => applyFilter(it.id)}
          onClose={() => setOpenMenu(null)}
        />
      )}
      {openMenu === "sort" && (
        <FilterMenu
          anchor={document.getElementById("specs-sort")!}
          items={Object.entries(SORTS).map(([k, v]) => ({ id: k, label: v.label }))}
          onPick={(it) => setSort(it.id as SortKey)}
          onClose={() => setOpenMenu(null)}
        />
      )}
    </div>
  );
}
