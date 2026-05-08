---
name: QA Webapp
description: A sleek, efficient quality assurance management tool
colors:
  primary: "#fc6d26"
  accent: "#3bb2f6"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#dc2626"
  background-light: "#ffffff"
  background-dark: "#0f1115"
  surface-light: "#ffffff"
  surface-dark: "#16181d"
  text-light: "#0b1220"
  text-dark: "#e5e7eb"
  text-muted-light: "rgba(11, 18, 32, 0.65)"
  text-muted-dark: "rgba(229, 231, 235, 0.65)"
  border-light: "rgba(11, 18, 32, 0.12)"
  border-dark: "rgba(229, 231, 235, 0.12)"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "600"
    lineHeight: "2rem"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: "600"
    lineHeight: "1.75rem"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: "500"
    lineHeight: "1.75rem"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: "400"
    lineHeight: "1.25rem"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: "500"
    lineHeight: "1rem"
  mono:
    fontFamily: "JetBrains Mono, Monaco, monospace"
    fontSize: "0.875rem"
    fontWeight: "400"
    lineHeight: "1.25rem"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

## Overview

The QA Webapp visual language is designed to be sleek, efficient, and modern. It prioritizes clarity and speed for QA engineers managing test coverage and triage. The interface uses a crisp, high-contrast structural system that gets out of the way of the complex data it holds. Interaction relies on modern, subtle animations with cubic-bezier easing for a snappy feel.

## Colors

The application relies heavily on neutral structural colors with distinct, purpose-driven semantic accents:

- **Primary (`#fc6d26`)**: A vibrant, GitLab-inspired orange used for primary actions, active states, and key highlights.
- **Accent (`#3bb2f6`)**: A clear blue used for secondary interactive elements or informational highlights.
- **Semantic Colors**: Green (`#10b981`) for success/passing tests, yellow (`#f59e0b`) for warnings, and red (`#dc2626`) for failures/errors.
- **Theme Adapters**: Backgrounds shift from pure white (`#ffffff`) in light mode to deep blue-gray (`#0f1115`) in dark mode, maintaining high contrast for text.

## Typography

Typography focuses on high legibility for dense technical interfaces:

- **Sans-serif (Inter)**: Used for all UI text, headings, and labels. It provides excellent readability at small sizes.
- **Monospace (JetBrains Mono)**: Reserved for code snippets, IDs, technical paths, and specific test outputs where character alignment is critical.
- **Hierarchy**: Relies on a tight scale (base `0.875rem` / 14px) with emphasis created through weight (medium/semibold) and color (muted vs. high-contrast text) rather than dramatic size differences.

## Elevation

Elevation is used sparingly, primarily for floating elements (dropdowns, tooltips, dialogs) and interactive cards:

- **Interactive Cards**: Subtle 1px borders with very soft shadows (`rgb(0 0 0 / 0.05)`). Hover states increase border opacity and apply a slight primary-tinted ring rather than lifting the card.
- **Floating Surfaces**: Use stronger shadows to ensure separation from the dense background content.
- **Dark Mode**: Elevation relies on surface lightness (tonal elevation) and borders rather than shadows, which disappear on dark backgrounds.

## Components

Components follow a clean, geometric style:

- **Loaders**: Subtle, pill-shaped badges with spinning icons and muted text, avoiding aggressive overlays or full-page takeovers when possible. 
- **Buttons**: Modest padding, medium border radii (`8px`), with clear interactive states (hover/active opacity shifts).
- **Cards**: Generous padding (`16px`+), clean borders (`border-gray-200`), and rounded corners (`12px` to `16px`).
- **Animations**: Purposeful motion using modern easing (`cubic-bezier(0.16, 1, 0.3, 1)`). Elements scale in or fade smoothly without elastic bouncing.

## Do's and Don'ts

- **Do** use the primary orange (`#fc6d26`) intentionally for the most important action on a screen.
- **Do** rely on the `text-muted-foreground` color for secondary information to establish hierarchy without changing font size.
- **Do** replace empty spaces with subtle, sleek loaders (like the pill badge) rather than full-card skeleton pulses when refreshing single items.
- **Don't** use heavy shadows or glassmorphism on structural containers. Keep it flat and crisp.
- **Don't** use identical card grids endlessly; vary the layout to reflect the importance of the data.
- **Don't** use generic loading spinners without context text; always pair a spinner with a concise status label.
