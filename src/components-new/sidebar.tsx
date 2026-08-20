import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/contexts/session-context";
import { useLogout } from "@/hooks/use-logout";
import { Loader2 } from "lucide-react";

// Mock projects that match the design wireframe
const PROJECTS = [
  { id: "acme-storefront", label: "acme-storefront", color: "oklch(70% 0.14 255)" },
  { id: "billing-portal", label: "billing-portal", color: "oklch(70% 0.14 150)" },
  { id: "ops-console", label: "ops-console", color: "oklch(70% 0.14 25)" },
  { id: "docs-site", label: "docs-site", color: "oklch(70% 0.14 75)" },
];

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
}

function NavLink({ to, isActive, children, title, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`nav-item${isActive ? " is-active" : ""}`}
      title={title}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

const DashboardGlyph = () => (
  <svg
    className="glyph"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
  >
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="3" rx="1" />
    <rect x="9" y="7" width="5" height="7" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
  </svg>
);

const TestsGlyph = () => (
  <svg
    className="glyph"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
  >
    <path d="M3 3h10M3 8h10M3 13h6" />
  </svg>
);

const SpecsGlyph = () => (
  <svg
    className="glyph"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 2h6l2 2v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
    <path d="M9 2v3h3" />
    <path d="M5 9h6M5 12h4" />
  </svg>
);

function getUserInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function NewSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const user = session?.user;
  const logoutMutation = useLogout();

  const handleSignOut = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // ignore for preview
    }
    // For the migration preview, send the user to the landing page
    navigate({ to: "/" });
  };
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("qa-sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add("is-sidebar-collapsed");
    } else {
      document.body.classList.remove("is-sidebar-collapsed");
    }
    try {
      localStorage.setItem("qa-sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [collapsed]);

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isTests = location.pathname.startsWith("/tests") || location.pathname.startsWith("/runs");
  const isSpecs = location.pathname.startsWith("/specs");
  const isAddProject = location.pathname === "/add-project";
  const isProfile = location.pathname === "/profile";

  return (
    <aside className="sidebar" data-od-id="app-sidebar">
      <div className="sidebar-head">
        <Link className="brand" to="/" title="QA Webapp">
          <span className="brand-mark">Q</span>
          <span className="sidebar-brand-text">QA Webapp</span>
        </Link>
        <button
          className="sidebar-toggle"
          type="button"
          data-action="toggle-sidebar"
          aria-label="Toggle sidebar"
          title="Collapse sidebar"
          onClick={() => setCollapsed(!collapsed)}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 4l-4 4 4 4" />
          </svg>
        </button>
      </div>

      <div className="nav-section-label">Workspace</div>
      <NavLink to="/dashboard" isActive={isDashboard} title="Dashboard">
        <DashboardGlyph />
        <span className="nav-item-label">Dashboard</span>
      </NavLink>
      <NavLink to="/tests" isActive={isTests} title="Automation Tests">
        <TestsGlyph />
        <span className="nav-item-label">Automation Tests</span>
      </NavLink>
      <NavLink to="/specs" isActive={isSpecs} title="Specs">
        <SpecsGlyph />
        <span className="nav-item-label">Specs</span>
      </NavLink>

      <div className="nav-section-label">Projects</div>
      {PROJECTS.map((project) => (
        <Link
          key={project.id}
          to="/projects/$id/test-scenarios"
          params={{ id: project.id }}
          className="nav-item"
          title={project.label}
        >
          <span
            className="project-dot"
            style={{ background: project.color }}
          />
          <span className="nav-item-label">{project.label}</span>
        </Link>
      ))}

      <Link
        to="/add-project"
        className={`nav-add-project${isAddProject ? " is-active" : ""}`}
        title="Add project"
      >
        <span className="add-glyph" aria-hidden="true">+</span>
        <span className="nav-item-label">Add project</span>
      </Link>

      <div className="sidebar-foot">
        <Link
          to="/profile"
          className={`user-chip${isProfile ? " is-current" : ""}`}
          title={user ? `${user.name || user.username} · @${user.username}` : "Profile"}
        >
          <div className="avatar">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || user.username}
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            ) : (
              getUserInitials(user?.name || user?.username)
            )}
          </div>
          <div className="user-meta">
            <div className="user-name">{user?.name || user?.username || "Guest"}</div>
            <div className="user-handle">@{user?.username || "guest"}</div>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          disabled={logoutMutation.isPending}
          className="sidebar-logout-btn"
          title="Sign out"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginTop: 8,
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--muted)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {logoutMutation.isPending ? (
            <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
          ) : (
            "Sign out"
          )}
        </button>
      </div>
    </aside>
  );
}
