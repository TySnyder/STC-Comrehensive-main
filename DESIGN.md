---
name: STC Operations Portal
description: A behavioral health clinical operations platform built for admin staff running a treatment facility.
colors:
  primary: "#4f46e5"
  primary-tint: "#eef2ff"
  primary-deep: "#4338ca"
  surface: "#ffffff"
  surface-secondary: "#f8fafc"
  surface-tertiary: "#f1f5f9"
  border-default: "#e2e8f0"
  border-light: "#f1f5f9"
  ink-primary: "#0f172a"
  ink-secondary: "#334155"
  ink-muted: "#64748b"
  ink-subtle: "#94a3b8"
  success: "#059669"
  success-bg: "#ecfdf5"
  warning: "#d97706"
  warning-bg: "#fffbeb"
  critical: "#dc2626"
  critical-bg: "#fef2f2"
  critical-dot: "#ef4444"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink-primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink-secondary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-action:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-action-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  input-default:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  input-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  badge-critical:
    backgroundColor: "{colors.critical-bg}"
    textColor: "{colors.critical}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: STC Operations Portal

## 1. Overview

**Creative North Star: "The Clinical Control Room"**

The STC Operations Portal is a precision instrument for behavioral health administration. It exists in the same visual register as air traffic control software and medical device dashboards — surfaces where staff are making decisions in real time, where information must be found instantly, and where an unclear interface has real operational consequences. The design doesn't pursue beauty for its own sake; it earns trust through clarity, density, and absolute consistency.

The system uses a tight restrained palette: an indigo accent fires against a cool slate neutral body. White surfaces carry content. Slate gradations handle hierarchy. Indigo activates exactly where action or selection lives and nowhere else. The semantic vocabulary — emerald for success, amber for warning, red for critical — exists to surface alerts instantly, not to decorate. Everything else stays neutral so alerts carry their full weight.

This system explicitly rejects: the consumer SaaS warmth of Notion or Linear, the gamified optimism of health apps, the overweighted analytics chrome of Tableau, and the hostile density of legacy EHR systems like Epic. The goal is a tool that a clinical lead or admin could sit down at mid-shift and trust immediately — not something they need to explore.

**Key Characteristics:**
- Dense but scannable: compact spacing, precise type hierarchy, maximum information per pixel
- Neutral baseline with surgical accent use — indigo fires only where selection or primary action lives
- Semantic color vocabulary for status: recognizable by convention, never decorative
- Flat-to-layered elevation: borders carry resting hierarchy; subtle shadows emerge on state and overlay
- Three-register typography: Space Grotesk for scanning, Inter for reading, JetBrains Mono for structured data

## 2. Colors: The Clinical Palette

A tightly restrained palette anchored in cool slate neutrals with a single indigo action accent. Semantic colors exist exclusively for status — they are never used decoratively.

### Primary
- **Action Indigo** (#4f46e5): The sole accent color. Used exclusively for active navigation states, focus rings, primary action buttons, and selected/highlighted rows. Its rarity is the point — when indigo appears, it means something is active or requires action.
- **Indigo Tint** (#eef2ff): Background fill for active/selected states. Never a decorative surface background.
- **Indigo Deep** (#4338ca): Hover and pressed state for indigo-colored elements only.

### Neutral
- **Pure Surface** (#ffffff): Cards, sidebar, header, modals — all primary content surfaces. White is not background; it's where content lives.
- **Portal Body** (#f8fafc): The overall page background and secondary panel fills. Slightly cooler than white; creates the effect of white cards lifted from a subtle field.
- **Inner Surface** (#f1f5f9): Section dividers, inner panel backgrounds, tertiary container fills within cards.
- **Border Default** (#e2e8f0): Primary border for all cards, panels, and structural separators.
- **Border Light** (#f1f5f9): Inner-section dividers within panels — lighter than default borders.
- **Ink Primary** (#0f172a): All primary text, data values, and page headings. Near-black.
- **Ink Secondary** (#334155): Labels, sub-headings, and field names.
- **Ink Muted** (#64748b): Supporting text and secondary metadata. Maintains ≥4.5:1 against white.
- **Ink Subtle** (#94a3b8): Placeholders and passive icons. Use on white surfaces only.

### Semantic
- **Success** (#059669 on #ecfdf5): Present attendance, completed discharge, cleared risk flags.
- **Warning** (#d97706 on #fffbeb): Expiring authorizations, missing signatures, approaching deadlines.
- **Critical** (#dc2626 on #fef2f2): Overdue items, failed authorizations, active risk flags requiring immediate attention.

### Named Rules
**The One Accent Rule.** Action Indigo (#4f46e5) occupies ≤15% of any given screen surface. It marks selection and primary action — nothing else. A screen where indigo is used broadly is a screen where nothing important stands out.

**The Semantic Lock Rule.** Emerald, amber, and red are status colors, not palette colors. They do not appear on decorative elements, non-status tinted backgrounds, or UI chrome. Seeing red must mean something is wrong. That signal must never be diluted.

## 3. Typography

**Display Font:** Space Grotesk (Space Grotesk, sans-serif)
**Body Font:** Inter (Inter, ui-sans-serif, system-ui, sans-serif)
**Data/Label Font:** JetBrains Mono (JetBrains Mono, ui-monospace, SFMono-Regular, monospace)

**Character:** Space Grotesk's geometric confidence handles scanning roles — page titles and metric values where authority and quick recognition matter. Inter carries all operational text: form labels, body copy, button text, list content. JetBrains Mono is reserved strictly for structured data that staff read differently from prose: timestamps, client IDs, status codes, breadcrumb paths.

### Hierarchy
- **Display** (Space Grotesk, 700, 18px, lh 1.2, tracking -0.02em): Page titles in the header. One per view.
- **Headline** (Space Grotesk, 700, 24px, lh 1.25, tracking -0.02em): Metric card values, primary data figures, section headings where a number leads.
- **Title** (Inter, 600, 14px, lh 1.4): Card headings, modal titles, table column headers.
- **Body** (Inter, 400, 12px, lh 1.5): All prose, list content, form copy, supporting text.
- **Label** (JetBrains Mono, 600, 10–11px, tracking 0.06em, uppercase): Timestamps, status codes, breadcrumb paths, badge text. Always mono — never Inter for this role.

### Named Rules
**The Three-Register Rule.** Inter for reading, Space Grotesk for scanning, JetBrains Mono for structured data. Never mix these registers for the same content type. A timestamp in Inter or a metric number in JetBrains Mono breaks the system.

**The Density Rule.** Body text runs at 12px (0.75rem). This is a clinical operations tool where staff read dense information under time pressure. Compact type is not a compromise; it is a feature of the register.

## 4. Elevation

The system uses **subtle tonal layering** as its primary depth language, with light shadow reinforcement on interactive state. White surfaces float on a slate-50 body field. Interior panels use slate-100 as a third layer. Borders carry most of the structural work at rest; shadows emerge on hover and overlay states.

### Shadow Vocabulary
- **Flush** (no shadow; border: 1px solid #e2e8f0): Default resting state for metric cards, list rows, and content panels. The border establishes presence.
- **Lifted** (`box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`): Interactive cards on hover, focused panels. Barely perceptible — signals affordance without decoration.
- **Overlay** (`box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)`): Notification dropdowns, command overlays, floating panels. Clearly above the page plane.
- **Modal** (`box-shadow: 0 20px 60px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.10)`): Full dialog modals. Maximum elevation in the system.

### Named Rules
**The Flat-First Rule.** Surfaces are flat at rest. Shadow appears only on interactive state (hover) or when the surface is genuinely above the page plane (overlay, modal). A card with a shadow at rest uses decoration as depth — that erodes the signal value of elevation throughout the system.

## 5. Components

### Buttons

Confident and direct. No ambiguity about what can be clicked.

- **Shape:** Gently rounded (8px). Not pill-shaped, not square.
- **Primary (Dark CTA):** slate-900 bg (#0f172a), white text, Inter 500 12px, px-4 py-2.5. Global top-priority actions ("Add Clinical Note"). Hover: slate-800 (#1e293b).
- **Primary (Action/Indigo):** indigo-600 bg (#4f46e5), white text. Save, submit, and confirm actions within modals and forms. Hover: indigo-700 (#4338ca).
- **Ghost/Secondary:** white bg, slate-700 text, 1px border slate-200. Cancel and secondary actions.
- **Hover / Focus:** 150ms bg-color transition. Focus ring: 2px indigo-500 offset-2.
- **Disabled:** opacity-50, cursor-not-allowed.

### Status Badges

The semantic color system's primary surface. Compact, pill-shaped, always paired with legible text. Never decorative.

- **Style:** rounded-full, px-2 py-0.5, text-[10px] uppercase JetBrains Mono bold.
- **Present / Success:** emerald-50 bg, emerald-700 text.
- **Warning / Expiring:** amber-50 bg, amber-700 text.
- **Critical / Absent:** red-50 bg, red-700 text.
- **Neutral / Upcoming:** slate-100 bg, slate-600 text.
- **Active / Selected:** indigo-50 bg, indigo-700 text.

### Cards / Containers

- **Corner Style:** 12px radius (rounded-xl) for primary metric and content cards. 8px for compact inline panels.
- **Background:** White (#ffffff). Never slate-50 — that is the body field.
- **Shadow Strategy:** Flush at rest (border only). Lifted on hover for clickable cards. See Elevation.
- **Border:** 1px solid #e2e8f0 (slate-200). Always present on white cards.
- **Internal Padding:** p-4 (16px) for metric cards and compact panels. p-6 (24px) for larger content containers.

### Inputs / Fields

- **Style:** slate-50 bg, slate-200 border, 8px radius, py-2 px-3, Inter 12px.
- **Focus:** bg shifts to white (#ffffff). 1px indigo-500 ring, border shifts to indigo-500. 150ms transition.
- **Placeholder:** slate-400 (#94a3b8) — verified ≥4.5:1 against slate-50 body.
- **Error:** red-500 border, red-50 bg tint, red-600 helper text below input.
- **Disabled:** opacity-50, cursor-not-allowed.

### Navigation (Sidebar)

The persistent left rail controlling all top-level workspace routing.

- **Default state:** text-slate-500, icon text-slate-400. Hover: bg-slate-50 fill, text-slate-800.
- **Active state:** bg-indigo-50 full fill, text-indigo-600, font-semibold, icon text-indigo-600. Full background fill — never a left-stripe border accent.
- **Shape:** 8px radius nav item button, full-width.
- **Branding:** indigo-600 square logo mark (8px radius), Space Grotesk bold wordmark, JetBrains Mono department label below at 10px uppercase.
- **Bottom zone:** dark slate CTA button + user credential badge with indigo avatar tint.

### Clinical Note Modal

The primary content-creation surface in the portal.

- **Backdrop:** fixed inset, slate-900 at 60% opacity.
- **Surface:** white, rounded-xl, max-w-2xl centered, modal-level shadow.
- **Header:** indigo-50 bg, Space Grotesk 700 title, close button in slate-400.
- **Form fields:** standard Input/Field treatment throughout.
- **Primary action:** indigo-600 button (save/submit).

## 6. Do's and Don'ts

### Do:
- **Do** use Action Indigo (#4f46e5) exclusively for active state, primary action, and selection. When indigo appears, it must mean something.
- **Do** pair every status color with labeled text: emerald means present/complete, amber means expiring/warning, red means critical/overdue. Never use status colors decoratively.
- **Do** use JetBrains Mono for timestamps, client IDs, breadcrumb paths, status codes — any structured data read differently from prose.
- **Do** keep all primary content surfaces white (#ffffff). Let slate-50 be the body field they float on.
- **Do** render active navigation as a full indigo-50 background fill — never as a left-side border stripe.
- **Do** implement all interactive states before shipping a component: hover, focus, active, disabled, error. Half-states ship as broken product.
- **Do** keep body and label text at 12px or smaller. Density is appropriate for this clinical operations register.
- **Do** use tonal layering (white on slate-50 on slate-100) as the primary depth signal. Shadows reinforce but don't carry the system.

### Don't:
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on nav items, list rows, cards, or callouts. Use full background tint or no accent at all.
- **Don't** design to a generic SaaS aesthetic (Notion, Linear, Airtable visual language). This is a clinical operations tool, not a productivity app for knowledge workers.
- **Don't** import consumer health app warmth (MyFitnessPal, Headspace visual register). Warmth in this system comes from reliability and precision, not rounded corners and pastel surfaces.
- **Don't** use overdesigned analytics chrome (Tableau-style dense chart panels). Data here serves operations, not the reverse.
- **Don't** replicate legacy EHR density or visual hostility (Epic, PointClickCare). Institutional seriousness and visual hostility are not the same thing.
- **Don't** use indigo for decorative fills, hover states on non-primary elements, or any surface that has no connection to action or selection.
- **Don't** use gradient text (`background-clip: text` with a gradient fill). Emphasis comes from weight and size.
- **Don't** build identical card grids as the default layout answer. Metric summaries, list rows, and detail panels should coexist in the same view.
- **Don't** place small-caps tracked eyebrow labels above every section heading. One deliberate system label is voice; one above every section is AI scaffolding.
