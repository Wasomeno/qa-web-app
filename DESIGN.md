---
name: QA Webapp
description: A QA testing and issue-tracking webapp for QA engineers
colors:
  primary: "#334155"
  accent: "#60a5fa"
  bg: "#ffffff"
  bg-dark: "#0f1115"
  fg: "#0b1220"
  fg-dark: "#e5e7eb"
  surface: "#ffffff"
  surface-dark: "#16181d"
  border: "#d1d5db"
  border-dark: "#262a33"
  muted-fg: "#6b7280"
  muted-fg-dark: "#9ca3af"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#dc2626"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  mono:
    fontFamily: "JetBrains Mono, Monaco, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  "2xl": "1rem"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.lg}"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
---

# Design System: QA Webapp

## 1. Overview

**Creative North Star: "The Switchboard"**

The QA Webapp is designed as a signal-over-noise instrument panel. Every pixel earns its place by answering a question or enabling an action. The visual language prioritizes legibility, deliberate interaction, and status awareness -- the hallmarks of a tool for engineers who work in rapid, iterative cycles.

The system is layered but not heavy: cards and panels carry subtle shadow to establish a shallow z-axis hierarchy, while the dark theme uses tonal contrast (near-black backgrounds against slightly lighter surface panels) rather than deep shadow fields. The primary color is a dark slate -- Deep Slate -- grounded and professional. It pairs with the blues of the Interface Blue accent and the dark neutrals of the theme to create a tool that feels solid, not flashy.

**Key Characteristics:**
- Clean shadcn/ui foundation with snappy, responsive transitions
- Layered depth through subtle shadows and tonal contrast, not material-style elevation
- Deep Slate primary that recedes into the interface, letting content and semantic colors lead
- Dark mode that reads as a native dark theme, not an inverted light theme
- High information density with generous breathing room inside components

## 2. Colors

The palette centers on a dark slate primary paired with cool blue accents, grounded by near-black and near-white neutrals tinted with subtle warmth. Color is carried by the accent and semantic roles, not the primary.

### Primary
- **Deep Slate** (#334155 / oklch(0.35 0.02 260)): Primary actions, focus rings, active states. A blue-tinged neutral that recedes into the interface -- its job is to anchor, not to draw attention.

### Accent
- **Interface Blue** (#60a5fa / oklch(0.68 0.14 250)): Secondary interactive elements, links, informational highlights, selection states. Complements the slate primary with a clear, cool note.

### Semantic
- **Pass Green** (#10b981): Success states, connected indicators, passed test outcomes
- **Caution Amber** (#f59e0b): Warning states, pending indicators, degraded status
- **Stop Red** (#dc2626): Destructive actions, error states, failed test outcomes, disconnection indicators

### Neutral (Light)
- **Whiteboard** (#ffffff): Primary background, card surface, popover surface
- **Near-White** (hsl(210 40% 96%)): Muted background, secondary surface, tab list track
- **Iron Border** (hsl(214.3 31.8% 91.4%)): Input borders, dividers, card borders
- **Steel Text** (hsl(215.4 16.3% 46.9%)): Muted text, placeholder text, secondary labels
- **Ink** (#0b1220): Primary text, headings, high-emphasis content

### Neutral (Dark)
- **Cave Floor** (#0f1115): Primary background, sidebar background
- **Ash Surface** (#16181d): Card surface, popover surface, elevated panels
- **Dim Border** (#262a33): Input borders, dividers, card borders
- **Mist Text** (#9ca3af): Muted text, placeholder text, secondary labels
- **Snow Text** (#e5e7eb): Primary text, headings, high-emphasis content

### The Slate Anchor Rule.
Deep Slate anchors interactive primaries and focus indicators. It shares the neutral family with the background and text colors, so its role is structural, not decorative. When you see slate used for an interactive element, it means the action is primary; when you see blue, it supplements.

## 3. Typography

**Display/UI Font:** Inter (system-ui fallback)
**Mono Font:** JetBrains Mono (Monaco / Consolas fallback)

**Character:** A technical sans pairing that balances warmth with precision. Inter provides excellent legibility at small sizes for dense data displays, while its generous x-height and open apertures keep the interface approachable rather than cold.

### Hierarchy
- **Display** (Semibold 600, 1.5rem/24px, 2rem line-height): Page titles, modal titles, section headings. Used sparingly.
- **Title** (Semibold 600, 1.125rem/18px, 1.75rem line-height): Card titles, dialog titles, panel headers. Tracks with the display step at a 1.33x ratio.
- **Body** (Regular 400, 1rem/16px, 1.5rem line-height): Paragraphs, list items, cell content. The default reading size.
- **Label** (Medium 500, 0.875rem/14px, 1.25rem line-height): Form labels, navigation items, button text, tab labels. One step below body for metadata.
- **Caption** (Regular 400, 0.75rem/12px, 1rem line-height): Badge text, helper text, timestamps, secondary metadata.
- **Mono** (Regular 400, 0.875rem/14px): Code blocks, inline code, keybindings, IDs, technical identifiers.

### The Line-Length Rule.
Body text containers must not exceed 75 characters per line. Dense data tables and code blocks are exempt.

## 4. Elevation

The system uses a hybrid approach: subtle drop shadows for structural hierarchy (cards, modals, dropdowns) and tonal contrast (background color shifts) for surface-level grouping. Depth is measured in half-stops, not floors.

### Shadow Vocabulary
- **Surface** (`shadow-sm`): Cards, list items, panels at rest. A light touch that separates content from background.
- **Raised** (`shadow-md`): Hovered cards, dropdown menus, popovers. One step above resting surfaces.
- **Modal** (`shadow-2xl`): Dialogs, sheets, full-screen overlays. The highest elevation, reserved for focused interactions.

### The Layered Rule.
A surface that is structurally distinct from its background uses a shadow; a surface that is semantically grouped with its neighbors uses a background color shift. Never stack both on the same relationship.

## 5. Components

### Buttons
- **Shape:** Gently rounded corners (0.5rem / 8px)
- **Primary:** Deep Slate background, white text, 0.5rem 1rem padding. Hover: 90% opacity via Tailwind `hover:bg-primary/90`. Focus: ring-2 with Deep Slate ring.
- **Destructive:** Stop Red background, white text. Hover: 90% opacity. Same shape and padding as primary.
- **Outline:** Transparent background, Ink text, 1px Iron Border. Hover: Interface Blue background with blue text.
- **Secondary:** Near-White background, Ink text. Hover: 80% opacity.
- **Ghost:** Transparent background, Ink text. Hover: Interface Blue background with blue text.
- **Link:** Interface Blue text, no border or background. Hover: underline.
- **Sizes:** sm (h-9, 0.75rem padding), default (h-10, 1rem padding), lg (h-11, 2rem padding), icon (h-10 w-10).
- **Transitions:** 150ms color transitions with `cubic-bezier(0.16, 1, 0.3, 1)` -- snappy in, smooth settle.

### Cards
- **Shape:** Rounded corners (0.5rem / 8px), 1px border (Iron Border / Dim Border), subtle Surface shadow.
- **Background:** Whiteboard (light) / Ash Surface (dark). Text color inherits from foreground.
- **Internal Padding:** 1.5rem (header + content sides), 0 at bottom of content (`p-6 pt-0` pattern). Footer uses `p-6 pt-0`.
- **Title:** Semibold 600, 1.5rem. Description: 0.875rem muted text below title.
- **States:** Hover raises shadow to `shadow-md` when interactive.

### Inputs & Fields
- **Shape:** Rounded corners (0.375rem / 6px), 1px Iron Border.
- **Background:** Whiteboard (light), transparent with whiteboard on focus.
- **Padding:** 0.75rem horizontal, 0.5rem vertical.
- **Focus:** 2px Deep Slate ring with 2px offset. Border remains.
- **Placeholder:** Steel Text / Mist Text.
- **Disabled:** 50% opacity, not-allowed cursor.
- **Select triggers** match input shape but include a 50%-opacity chevron icon, cursor pointer.

### Badges / Chips
- **Shape:** Fully rounded (9999px / pill shape), 1px border.
- **Padding:** 0.625rem horizontal, 0.375rem vertical.
- **Type Sizes:** 0.75rem / 0.875rem (two tiers -- compact and standard).
- **Variants:** Default (Deep Slate background), Secondary (neutral background), Destructive (Stop Red background), Outline (no background, border only).
- **States:** Hover at 80% opacity.

### Dialogs / Modals
- **Overlay:** 60% black, `backdrop-blur-sm` for subtle background blur.
- **Content Panel:** Rounded corners (0.75rem / 12px -- the xl radius), Whiteboard/Ash Surface background, `shadow-2xl`.
- **Animation:** Scale in (0.95 -> 1) + fade in, 250ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Close animates scale out + fade out at 200ms.
- **Close Button:** Top-right, 0.25rem rounded, 70% opacity resting, 100% on hover. X icon at 1rem.

### Navigation (Sidebar)
- **Style:** Full-height panel, 16rem default width, collapsible to 3rem icon-only mode. 18rem on mobile via sheet overlay.
- **Background:** Cave Floor (dark) / Near-White (light).
- **Items:** 0.875rem label text, hover state uses muted background.
- **Active State:** Deep Slate accent indicator.
- **Mobile:** Translates in as a sheet with standard dialog animation.

### Tabs
- **Style (default):** Muted background track (rounded-md), white active tab with subtle shadow. 0.75rem horizontal padding per tab.
- **Style (line):** No background track, bottom-border active indicator (zinc-900/Ink). Used for page-level navigation.
- **Style (line-sliding):** Line variant with an animated sliding indicator (300ms cubic-bezier transition). Indicator is a 2px bar that tracks the active tab's width and position.

### Data Table (Filter Bar + Pagination)
- **Filter Bar:** Inline filter chips with labels and values. Compact design using badge patterns.
- **Sort Header:** Clickable column headers with sort direction indicator. Uses 0.875rem label weight text.
- **Pagination:** Compact controls with page numbers and prev/next buttons. Uses button-ghost styling.

## 6. Do's and Don'ts

### Do:
- **Do** use Deep Slate for primary actions, active focus rings, and interactive indicators. It anchors the interaction layer without competing with content.
- **Do** prefer tonal contrast (background color shift) for grouping related elements. Shadows are for structural hierarchy.
- **Do** use the 0.5rem (8px) corner radius as the default for most components. Reserve 0.75rem for dialogs and 9999px for badges.
- **Do** write labels and descriptions that are direct and technical-first. The voice of a reliable tool.

### Don't:
- **Don't** use Deep Slate for decorative fills or background washes. Its role is structural, not ornamental.
- **Don't** use side-stripe borders (border-left or border-right greater than 1px as a colored accent on cards, list items, or alerts). Use full borders, background tints, or nothing.
- **Don't** use gradient text or glassmorphism effects. No `background-clip: text` gradients, no decorative backdrop blurs.
- **Don't** use the hero-metric template (big number, small label, gradient accent). Show metrics in context, not as standalone decorations.
- **Don't** use nested cards. If a surface contains structured content, it should not be wrapped in a card that contains another card.
- **Don't** imitate Bugzilla or TestRail — no cluttered layouts, no heavy borders, no form-heavy navigation patterns.
- **Don't** use em dashes. Use commas, colons, or parentheses instead.
- **Don't** use bounce or elastic easing curves. All transitions use exponential deceleration (`cubic-bezier(0.16, 1, 0.3, 1)`).
