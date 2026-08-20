# AGENTS.md — QA Webapp

This file is the single source of truth for AI agents and humans working
on this codebase. It documents the project layout, the design system that
governs every UI surface, and the rules that must be followed when
adding or changing code.

If a rule here and a comment in code disagree, this file wins. If a
PR violates any "MUST" or "MUST NOT" rule, it is rejected.

---

## 1. Project overview

QA Webapp is a workspace for QA engineers running automated end-to-end
tests. It tracks issues, specs, scenarios, recordings, and fix sessions
across GitLab-backed projects.

**Stack**

- React 19 + TypeScript + Vite
- TanStack Router (file-based routes in `src/routes/`)
- TanStack Query for server state
- Tailwind CSS (theme extended to expose the design tokens)
- shadcn/ui primitives in `src/components/ui/`
- A new minimal CSS design system in `public/qa-webapp.css` and
  `src/styles/qa-design-system.css`

**Top-level layout**

```
src/
  routes/         # TanStack Router file routes
  pages/          # Legacy Tailwind/flowG pages (do not extend)
  pages-new/      # New-design pages (use these)
  components/     # Legacy shadcn-based components
  components-new/ # New-design shell + sidebar
  styles/         # qa-design-system.css + design-tokens.ts
  hooks/          # React Query hooks + side-effect hooks
  api/            # REST client
  contexts/       # Session + navigation providers
  lib/            # Utilities + mock data
public/
  qa-webapp.css   # The wireframe CSS — DO NOT EDIT
```

---

## 2. The two design systems, and which to use

There are **two design systems** in this repo. The codebase is mid-migration.
You MUST pick the right one for the page you are touching.

| System | CSS file | React | Pages | When to use |
|---|---|---|---|---|
| **Legacy / FlowG** | `src/index.css` + shadcn theme | `src/components/ui/*`, `src/components/layout/main-layout.tsx` | `src/pages/*` | Anything in the legacy shell until it is removed. Do not extend. |
| **New (current)** | `public/qa-webapp.css` (wireframe) + `src/styles/qa-design-system.css` (aliases) | `src/components-new/*`, `src/pages-new/*` | `src/pages-new/*` | All new work. The default for new pages. |

**Rule of thumb**

> If you are adding a new page, route, or component, use the new design
> system. The wireframe CSS at `public/qa-webapp.css` is the visual
> source of truth. Never edit it.

When the legacy pages are fully removed (out of scope for this doc), the
`src/pages/`, `src/components/layout/main-layout.tsx`, and the legacy
shadcn pieces will be deleted. Until then, they coexist.

---

## 3. Design system rules

These are the rules that every component, page, and Tailwind class must
follow. They are derived directly from the new design's CSS.

### 3.1 Color

All colors come from CSS custom properties on `:root` in
`public/qa-webapp.css`. Never hardcode an `oklch()` value in a
component.

| Token | Value | Use for |
|---|---|---|
| `--bg` | `oklch(99% 0.002 240)` | Page background |
| `--surface` | `oklch(100% 0 0)` | Card, panel, sidebar, popover background |
| `--fg` | `oklch(18% 0.012 250)` | Primary text + dark CTAs (use `--fg` for solid buttons, not `--accent`) |
| `--muted` | `oklch(54% 0.012 250)` | Secondary text, placeholders, labels |
| `--border` | `oklch(92% 0.005 250)` | All 1px borders, dividers, hairlines |
| `--accent` | `oklch(58% 0.18 255)` | Interactive Blue. Links, focus rings, hover text in tables, the rare blue CTA. |
| `--success` | `oklch(62% 0.15 150)` | Pass green — passed tests, connected, OK |
| `--danger` | `oklch(60% 0.18 25)` | Stop red — failed tests, destructive actions, errors |
| `--warn` | `oklch(72% 0.14 75)` | Caution amber — flaky, pending, degraded |

**Tints (used only for `.pill-*` backgrounds and form banners)**

- `.pill-success` → bg `oklch(97% 0.03 150)`, border `oklch(88% 0.06 150)`
- `.pill-danger`  → bg `oklch(97% 0.03 25)`,  border `oklch(88% 0.06 25)`
- `.pill-warn`    → bg `oklch(97% 0.03 75)`,  border `oklch(88% 0.06 75)`

**Tailwind aliases** (`tailwind.config.js` extends `colors.qa`):

```ts
bg-qa-bg          // var(--bg)
text-qa-fg         // var(--fg)
border-qa-border   // var(--border)
text-qa-success    // var(--success)
bg-qa-success-tint // pill background
```

**MUST NOT**

- Hardcode a hex, rgb, or raw `oklch()` value in a component.
- Use `--accent` for a primary button background — primary buttons use
  `--fg` (the dark slate). `--accent` is for links, focus rings, and
  table-row hover text.
- Mix a `--success` foreground with a `--bg` background to fake a
  status — use a pill with the proper tint instead.

### 3.2 Typography

**Stacks**

- Display / UI: `--font-display` (Inter / SF Pro Display fallback)
- Body: `--font-body` (Inter / SF Pro Text fallback)
- Mono: `--font-mono` (SF Mono / Menlo fallback)

The Tailwind names are `font-display`, `font-body`, `font-mono`. The
`qa-design-system.css` aliases the same names with `ds-text-*` classes.

**Hierarchy**

| Step | Size / line-height / weight | Used for | Tailwind |
|---|---|---|---|
| Display | 1.5rem / 2rem / 600, -0.02em | Page titles, modal titles, section headings | `text-qa-display` |
| Title | 1.125rem / 1.75rem / 600 | Card titles, panel headers | `text-qa-title` |
| Body | 1rem / 1.5rem / 400 | Paragraphs, list items, default text | `text-qa-body` |
| Label | 0.875rem / 1.25rem / 500 | Form labels, nav items, button text, table headers | `text-qa-label` |
| Caption | 0.75rem / 1rem / 400 | Badges, helper text, timestamps | `text-qa-caption` |
| Mono | 0.875rem / 1.25rem / 400 | IDs, keybindings, console output, kv-key | `text-qa-mono` |
| Eyebrow | 0.6875rem / 1rem / 500, 0.08em, uppercase | Section labels in sidebar, panel-meta | `text-qa-eyebrow` |

**MUST**

- Use `text-qa-eyebrow` (or the wireframe `font-family: var(--font-mono);
  text-transform: uppercase; letter-spacing: 0.08em;`) for sidebar section
  labels like "Workspace" and "Projects".
- Use `text-qa-mono` (or `font-mono tabular-nums`) for IDs, durations,
  counters, commit SHAs, and any numeric column that needs to line up.
- Keep body containers to ≤ 75 characters per line. Dense tables and code
  blocks are exempt.

**MUST NOT**

- Use the title step for body text or the body step for titles.
- Add a new font-size that isn't in the hierarchy. If you need one,
  add it to the hierarchy here AND in `tailwind.config.js` AND in
  `src/styles/design-tokens.ts` at the same time.
- Use bold + italic together. Pick one.

### 3.3 Radius

| Step | Value | Used for | Tailwind |
|---|---|---|---|
| `sm` | 6px | Buttons, fields, nav items, dropdown triggers, inputs, toolbar chips | `rounded-qa-sm` |
| `md` | 8px | Dropdown menus, project cards, smaller popovers | `rounded-qa-md` |
| `lg` | 10px | Panels, stat blocks, recent-list, by-project-list | `rounded-qa-lg` |
| `xl` | 12px | Landing card, modal, run-modal | `rounded-qa-xl` |
| `pill` | 9999px | Pills, badges, run-modal-state chips, status dots, avatars | `rounded-qa-pill` |

**MUST NOT**

- Use `rounded-none` or `rounded-sm` (Tailwind default 2px) on any
  interactive surface. The design has no squared edges.
- Mix `rounded-md` and `rounded-lg` on the same component — pick one.

### 3.4 Spacing

The wireframe is built on a 4px grid. Use Tailwind defaults — they are
aligned to this grid.

| Context | Value | Notes |
|---|---|---|
| Sidebar padding | 16px 12px | Hardcoded in `.sidebar` |
| Page head padding | 28px 40px 20px | top x bottom |
| Page body padding | 28px 40px 64px | |
| Panel head padding | 14px 18px | |
| Panel body padding | 16px 18px | |
| Pill padding | 0 8px (height 20px) | Mono 11px |
| Button height | 32px (default), 40px (`btn-lg`) | padding 0 14px |
| Field height | 32px | padding 0 10px |
| Step row | 12px 18px | |
| Run row | 10px 18px | |
| Toolbar gap | 10px | between field/chip elements |
| Stat strip gap | 12px | |
| Dash grid gap | 20px | |
| Modal | 460px wide | |

**MUST NOT**

- Use odd values like 7px, 13px, 17px. Stick to 4/8/12/16/20/24/28/32/40/48/64.
- Stack panels without a 20px gap. Use `space-y-5` or `margin-top: 20px`.

### 3.5 Elevation

Three elevation levels. Use them deliberately.

| Level | Class | Use for |
|---|---|---|
| Surface | `shadow-sm` (`var(--ds-shadow-sm)`) | Cards, panels, list rows at rest |
| Raised | `shadow-md` (`var(--ds-shadow-md)`) | Dropdown menus, popovers, modals-on-hover |
| Modal | `shadow-modal` (`var(--ds-shadow-modal)`) | Dialogs, sheets, full-screen overlays |

**MUST NOT**

- Stack elevation with a background tint on the same surface. Pick one.
  Either the surface is a card with `--border` and `shadow-sm`, or it
  is a grouped element using `bg-qa-surface-hover`. Not both.
- Add a custom shadow. Use one of the three above.
- Add gradients to backgrounds. No `bg-gradient-*` on UI surfaces.

### 3.6 Motion

**The single canonical easing is `cubic-bezier(0.16, 1, 0.3, 1)`.**
Tailwind name: `ease-qa-out`. CSS variable: `--ds-easing`.
Use for **all** color, transform, and scale transitions.

**Durations**

| Speed | Value | Use for |
|---|---|---|
| Fast | 120ms | Hover state colors, border color, fill colors |
| Base | 150ms | Color transitions, sidebar collapse |
| Slow | 200ms | Modal scale-in, sheet slide |
| Modal | 250ms | Dialog enter/leave |

**MUST**

- All hover transitions must complete in 120–200ms.
- Animations enter with `--ds-easing` (out) and exit with `--ds-easing-in`.

**MUST NOT**

- Use `ease-in`, `ease-out`, `ease-bounce`, `ease-elastic`, or any
  spring/elastic curve. The design explicitly forbids it.
- Use durations outside the 120–250ms band for UI micro-interactions.
  Larger durations (e.g. 400ms) are reserved for route transitions.
- Use `transition-all`. Always list the properties: `transition: background 120ms, border-color 120ms;`.

### 3.7 Borders

- Default border: 1px solid `var(--border)`.
- Sidebar: `border-right: 1px solid var(--border)`.
- Page head: `border-bottom: 1px solid var(--border)`.
- Panel head: `border-bottom: 1px solid var(--border)`.
- Recent-row / run-row: `border-bottom: 1px solid var(--border)`; the
  last row in a list drops its border (`:last-child { border-bottom: 0 }`).

**MUST NOT**

- Use a border thicker than 1px on a list row or panel edge.
- Use a side-stripe accent (left/right border thicker than 1px) on
  cards, list items, or alerts. Use full borders, background tints, or
  nothing.
- Use a non-`--border` color for an edge. The wireframe forbids
  colored borders.

### 3.8 Status semantics

Three statuses, each with a fixed color and a fixed surface tint.

| Status | Color | Tint | When |
|---|---|---|---|
| passed | `--success` | `oklch(97% 0.03 150)` | Test passed, run completed, status OK |
| failed | `--danger` | `oklch(97% 0.03 25)` | Test failed, error, destructive, blocked |
| flaky / pending | `--warn` | `oklch(97% 0.03 75)` | Flaky test, pending state, in-progress (NOT errors) |

A pill is the only way to render a status. Use the matching
`.pill-success` / `.pill-danger` / `.pill-warn` class.

```tsx
// ✅ right
<span className="pill pill-success"><span className="swatch" />passed</span>

// ❌ wrong
<Badge color="green" />
<div className="text-green-500">passed</div>
```

A 6×6 swatch dot precedes the label inside every status pill.

### 3.9 Icons

- Use stroke-based icons only. Filled icons are reserved for active/selected states.
- Default stroke width: 1.4 (UI glyphs in sidebar) and 1.5 (form/section icons).
- Glyph size in lists: 14×14. In hero/empty states: 18–24.
- Color follows text — `currentColor`. Never hardcode icon color.

### 3.10 Buttons

Three variants. Sizes: `sm` (28px), `default` (32px), `lg` (40px).

| Variant | Background | Border | Text | Hover |
|---|---|---|---|---|
| Primary | `--fg` | `--fg` | white | `--fg` at 90% opacity |
| Secondary | `--surface` | `--border` | `--fg` | border becomes `--fg` |
| Ghost | transparent | transparent | `--fg` | `bg: --surface-hover` |
| Destructive | `--danger` | `--danger` | white | `--danger` at 90% |

Disabled state: 40% opacity, `cursor: not-allowed`. No hover state.

**MUST**

- Use `<button>` for actions, `<Link>` for navigation. Never use a
  `<div>` or `<a>` with `onClick` for a button.
- Use `btn-primary` for one — and only one — primary CTA per surface.
  Secondary actions use `btn-secondary` or `btn-ghost`.

**MUST NOT**

- Use accent blue (`--accent`) for a primary button. The design uses
  dark slate (`--fg`) for primary CTAs.
- Stack two `btn-primary` next to each other.
- Add a custom button class. If you need a new variant, propose it
  here first.

### 3.11 Form fields

- Height: 32px. Padding: 0 10px (input), 12px 14px (textarea).
- Border: 1px `--border`. Hover: `--fg`. Focus: 2px ring using
  `--accent` with a 2px offset.
- Placeholder color: `--muted`.
- Label is 0.875rem / 500, always above the field.
- Help text below the field: 0.75rem, `--muted`.
- Error text: 0.75rem, `--danger`. The field border also turns `--danger`.
- Required indicator: `*` in `--danger` color.

For the dropdown: a custom `dropdown` component with `.dropdown-trigger`,
`.dropdown-value`, `.dropdown-menu`, and `.dropdown-option` (see the
add-project page for the canonical pattern). Do not use the native
`<select>` for project/repo pickers.

### 3.12 Page anatomy

Every page in the new design follows the same skeleton:

```tsx
<div className="app-pane">
  <div className="page-head">
    <div className="page-head-text">
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
    </div>
    <div className="page-head-actions">{/* buttons */}</div>
  </div>

  <div className="page-body">
    {/* content */}
  </div>
</div>
```

For detail pages, replace the title with:

```tsx
<nav className="detail-breadcrumb">…</nav>
<div className="detail-title-row">
  <span className="detail-title">{name}</span>
  {statusPill}
  {meta}
  {actionButtons}
</div>
```

### 3.13 Panels

```tsx
<section className="panel">
  <div className="panel-head">
    <span className="panel-title">…</span>
    <span className="panel-meta">…</span>  {/* right-aligned mono caps */}
  </div>
  <div className="panel-body">{/* content */}</div>
</section>
```

A panel has `border-radius: 10px`, 1px border, no shadow at rest. Never
nest a panel inside another panel. If you need a section, use a panel.

### 3.14 Tables

- Header: 0.625rem mono, uppercase, 0.08em tracking, `--muted`. Bottom border.
- Cell padding: 12px 14px. Row hover: `bg: --surface-hover`.
- Always include a `data-href` on the row when navigation is possible.
  Click the row (not just the link) navigates.
- Cell text uses body or mono. Numeric cells use mono with `tabular-nums`.
- The `Status` column uses a `pill` (see 3.8).
- The `Project` column uses `<span class="project-dot" style="background: var(--project-color)"></span>` followed by the project name.

### 3.15 Sidebar

- Width: 240px expanded, 56px collapsed. Hardcoded `--sidebar-w` and
  `--sidebar-collapsed-w`.
- Background: `--surface`. Right border: 1px `--border`.
- Items: 0.8125rem label, `--muted` text, hover `bg: --surface-hover`.
- Active item: same background, text becomes `--fg`, font-weight 500.
- Section labels: `text-qa-eyebrow` (mono 11px uppercase tracked 0.08em).
- The collapse state is toggled by adding `is-sidebar-collapsed` to
  `body`. Persist that flag in `localStorage` under
  `qa-sidebar-collapsed` (see `src/components-new/sidebar.tsx`).

### 3.16 Forbidden patterns

- ❌ **No gradients** on any surface (cards, panels, buttons, headers).
  The design forbids gradient text and gradient fills.
- ❌ **No glassmorphism** / `backdrop-blur` on cards. (Modal overlays
  are allowed to use `backdrop-blur` for a one-step dimming effect.)
- ❌ **No nested cards.** A panel must not contain another panel.
- ❌ **No bounce / elastic easings.** The canonical easing is the only
  one.
- ❌ **No em dashes** in user-facing copy. Use commas, colons, or
  parentheses.
- ❌ **No side-stripe borders** as a status accent on cards/rows.
- ❌ **No big-number hero metrics** (the "huge number + small label
  + gradient accent" anti-pattern). Show metrics in context.
- ❌ **No emoji** in UI labels (except for decorative illustrations).
- ❌ **No purple, magenta, or pure-cyan accents.** The accent palette is
  the four colors above plus project tints (which live in `mock-data-new.ts`).

---

## 4. Routing

Routes live in `src/routes/` and are file-based (TanStack Router). The
generator produces `src/routeTree.gen.ts` automatically.

**Current route map (new design)**

| Path | File | Component | Scope |
|---|---|---|---|
| `/` | `src/routes/index.tsx` | `LandingPage` from `pages-new/landing.tsx` | **Public** — landing page (hero + product motion preview). No app shell. |
| `/login` | `src/routes/login.tsx` | `NewLoginPage` from `pages-new/login.tsx` | **Public** — GitLab SSO login. No app shell. |
| `/dashboard` | `src/routes/dashboard.tsx` | `DashboardPage` from `pages-new/dashboard.tsx` | **Authenticated** — global dashboard |
| `/tests` | `src/routes/tests.index.tsx` | `TestsListPage` from `pages-new/tests-list.tsx` | **Authenticated** — "Automation Tests" across every project |
| `/tests/$id` | `src/routes/tests.$id.tsx` | `TestDetailPage` from `pages-new/test-detail.tsx` | Test detail |
| `/runs/$id` | `src/routes/runs.$id.tsx` | `RunDetailPage` from `pages-new/run-detail.tsx` | Run detail |
| `/specs` | `src/routes/specs.index.tsx` | `SpecsListPage` from `pages-new/specs-list.tsx` | **Authenticated** — Specs across every project |
| `/specs/$id` | `src/routes/specs.$id.tsx` | `SpecDetailPage` from `pages-new/spec-detail.tsx` | Spec detail |
| `/projects/$id/specs` | `src/routes/projects.$id.specs.index.tsx` | `SpecsListPage` (with `defaultProject=$id`) | **Project-scoped** Specs — pre-applied project filter, no project dropdown |
| `/projects/$id/specs/$id` | `src/routes/projects.$id.specs.$id.tsx` | `SpecDetailPage` | Project-scoped Spec detail |
| `/projects/$id/test-scenarios` | `src/routes/projects.$id.test-scenarios.index.tsx` | `TestsListPage` (with `defaultProject=$id`, title "Test Scenarios") | **Project-scoped** Test Scenarios — the new "Automation Tests" design, scoped to one project, retitled to match the legacy project sub-nav |
| `/projects/$id/test-scenarios/$id` | `src/routes/projects.$id.test-scenarios.$id.tsx` | `TestDetailPage` | Project-scoped Test detail |
| `/profile` | `src/routes/profile.tsx` | `ProfilePage` from `pages-new/profile.tsx` | Profile |
| `/add-project` | `src/routes/add-project.tsx` | `AddProjectPage` from `pages-new/add-project.tsx` | Add project form |

`/tests`, `/specs`, `/projects/$id/specs`, and `/projects/$id/test-scenarios`
are layout routes (parent) with an `index.tsx` child route. The parent
renders `<Outlet />`. Do not add page content to `tests.tsx`,
`specs.tsx`, etc. — that breaks child route rendering.

The project-scoped list pages reuse the same component as the global
list, but pass `defaultProject={id}` so the project filter is locked
and the toolbar's project dropdown is hidden. Clicking a project in
the sidebar takes you to the project-scoped Test Scenarios page for
that project.

The root layout in `__root.tsx` checks `location.pathname` against a
`publicPaths` set (`/`, `/login`) and skips the app shell for those
routes. Everything else renders inside `<NewAppShell>` (sidebar +
content). The sidebar's "Sign out" button navigates to `/` (landing)
after calling `useLogout`, mirroring the post-auth flow.

When you add a new route file, also add the route registration to
`src/routeTree.gen.ts` if the dev server is not running, or just save
the file and let the Vite plugin regenerate it.

**MUST**

- Use TanStack Router's `Link` component for navigation, not `<a>`.
- Validate search params with `validateSearch` so types are correct.

**MUST NOT**

- Add routes under `src/routes/` that mount legacy pages from
  `src/pages/` (FlowG). They have been intentionally removed.

---

## 5. Working with mock data

During the UI migration, all data is hardcoded in
`src/lib/mock-data-new.ts`. When you wire up the real API, replace the
imports in `src/pages-new/*` with `useQuery` calls from
`src/hooks/use-*-api.ts` (see `src/hooks/` for the existing pattern).

**MUST NOT**

- Hardcode test/spec/run data inside a page component. Always import
  from `mock-data-new.ts` so the dev preview stays in sync.
- Add new mock data to a page file. If a piece of data is missing,
  add it to `mock-data-new.ts` with the same shape as the surrounding
  data.

---

## 6. Coding conventions

- **TypeScript strict mode is on.** No `any`, no `// @ts-ignore`. Use
  proper types or `unknown` + narrowing.
- **Hooks:** obey the rules of hooks. No conditional hooks.
- **Imports:** use the `@/...` alias (configured in `tsconfig.app.json`
  and `vite.config.ts`).
- **Naming:**
  - Pages: `XxxPage` (e.g. `DashboardPage`).
  - Components: `Xxx` (e.g. `NewSidebar`).
  - Hooks: `useXxx`.
  - Types: `Xxx` (e.g. `TestStatus`).
- **Comments:** explain WHY, not WHAT. The wireframe CSS is the WHAT.
- **File length:** keep components under ~400 lines. Split if longer.
- **No dead code.** If you delete a route, delete the page that backed
  it. The legacy Tailwind/flowG files are still in the tree but are
  not used; leave them in place until the cleanup pass removes them.

---

## 7. Running and verifying

```bash
# Dev server (Vite + HMR)
npx vite          # → http://localhost:5173

# Type check
npx tsc -b --noEmit

# Lint
npx eslint .
```

A new page is "done" when:

1. It renders at its route in the dev server.
2. It uses only design-system classes (no legacy Tailwind chrome).
3. All links in the page navigate to a valid new-design route.
4. Interactive elements (buttons, dropdowns, modals) work and have a
   sensible empty/loading state even when wired to mock data.
5. The page title appears in the sidebar in the right active state
   (extend `isDashboard`/`isTests`/etc. in
   `src/components-new/sidebar.tsx` if a new section is added).

---

## 8. Decision log (open questions)

These are intentionally not yet decided. Add to this section when
you reach a conclusion.

- **Theme:** the new wireframe is light-mode only. Dark mode is not
  in scope. If/when we add it, the wireframe CSS would gain a
  `prefers-color-scheme: dark` block and `data-theme="dark"` toggles.
- **Sticky table headers:** the wireframe scrolls inside the panel,
  not the page. Decide whether long spec/test lists should also have
  sticky `<thead>` rows when scrolling the panel.
- **Empty states:** the wireframe has no empty states. The current
  pages fall back to a `0 specs · 0 tests` count. Add a documented
  empty-state pattern when we know the canonical copy.

---

## 9. Quick reference

```tsx
// Surface + 1px border + subtle shadow (the canonical card)
<section className="panel">
  <div className="panel-head">
    <span className="panel-title">Title</span>
    <span className="panel-meta">meta</span>
  </div>
  <div className="panel-body">…</div>
</section>

// Status pill
<span className="pill pill-success">
  <span className="swatch" />
  passed
</span>

// Page head
<div className="page-head">
  <div className="page-head-text">
    <h1 className="page-title">Title</h1>
    <p className="page-subtitle">Subtitle.</p>
  </div>
  <div className="page-head-actions">
    <button className="btn btn-secondary">Cancel</button>
    <button className="btn btn-primary">Create</button>
  </div>
</div>

// Sidebar nav item
<Link to="/tests" className={`nav-item${isActive ? " is-active" : ""}`}>
  <Icon className="glyph" />
  <span className="nav-item-label">Automation Tests</span>
</Link>

// Stat tile
<div className="stat">
  <div className="stat-label">Runs last 24h</div>
  <div className="stat-value">128<span className="stat-delta up">+12%</span></div>
</div>
```
