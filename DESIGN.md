---
name: "Jeddah Shading"
description: "Arabic-first architectural clarity for durable outdoor work in Jeddah and Makkah"
colors:
  source-of-truth: "app/globals.css :root"
  brand-primary: "var(--brand-primary)"
  brand-secondary: "var(--brand-secondary)"
  brand-accent: "var(--brand-accent)"
  background-canvas: "var(--background)"
  background-muted: "var(--muted)"
  surface-base: "var(--card)"
  surface-raised: "var(--surface-raised)"
  surface-overlay: "var(--popover)"
  text-primary: "var(--foreground)"
  text-secondary: "var(--text-secondary)"
  text-muted: "var(--muted-foreground)"
  text-inverted: "var(--text-inverted)"
  border-default: "var(--border)"
  border-strong: "var(--border-strong)"
  state-success: "var(--success)"
  state-warning: "var(--warning)"
  state-error: "var(--destructive)"
  state-info: "var(--info)"
typography:
  display:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "normal"
  headline:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.24
    letterSpacing: "normal"
  title:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.78
    letterSpacing: "normal"
  body-mobile:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.76
    letterSpacing: "normal"
  label:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.7
    letterSpacing: "normal"
  dashboard-title:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "normal"
  dashboard-body:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  dashboard-label:
    fontFamily: "Readex Pro, Noto Sans Arabic, Tahoma, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: "normal"
rounded:
  none: "0"
  subtle: "2px"
  control: "9px"
  surface: "12px"
  prominent: "16px"
  pill: "999px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  md-plus: "20px"
  lg: "24px"
  xl: "32px"
  xl-plus: "40px"
  2xl: "48px"
  3xl: "64px"
  3xl-plus: "80px"
  4xl: "96px"
  5xl: "128px"
components:
  public-button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.text-inverted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  public-button-primary-hover:
    backgroundColor: "{colors.brand-primary-hover}"
    textColor: "{colors.text-inverted}"
    rounded: "{rounded.control}"
  public-button-secondary:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.brand-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  dashboard-button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.text-inverted}"
    typography: "{typography.dashboard-label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  field-standard:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.text-primary}"
    typography: "{typography.dashboard-body}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  status-success:
    backgroundColor: "{colors.state-success-soft}"
    textColor: "{colors.state-success}"
    typography: "{typography.dashboard-label}"
    rounded: "{rounded.control}"
    padding: "4px 8px"
  status-error:
    backgroundColor: "{colors.state-error-soft}"
    textColor: "{colors.state-error}"
    typography: "{typography.dashboard-label}"
    rounded: "{rounded.control}"
    padding: "4px 8px"
---

# Design System: Jeddah Shading

## 0. Compliance Contract And Audit Baseline

This document is an implementation contract. A screen is not compliant because it uses the correct colors. It must also use the correct surface mode, width, density, hierarchy, interaction states, responsive behavior, and RTL treatment defined here.

### September 2026 focused audit

The pre-reset implementation failed primarily because:

- The public site had no shared header, navigation, footer, skip link, or persistent conversion path.
- Dashboard navigation had no current-route state and fell below content on small screens instead of becoming a drawer.
- One `1600px` dashboard width was applied to overview, collections, editors, media, and settings despite their different tasks.
- Collections repeated page-level row, action, flash-message, and empty-state styling instead of using a stable data-management composition.
- Editors were long, undifferentiated forms with action controls at the top, full-width fields, repeated embedded media libraries, and no contextual rail.
- Media, redirects, settings, and editors visually inherited the collection-page pattern even though they are different tools.
- Public Services, Solutions, and Materials repeated the same card grid and exposed CMS language such as “published records” to visitors.
- Public detail pages repeatedly boxed prose and relationship groups, weakening narrative hierarchy and conversion flow.
- Raw color values and one-off dimensions were embedded throughout routes, preventing coherent system-level adjustment.
- Technical values, navigation direction, active state, mobile behavior, and focus treatment were inconsistently handled in RTL.

Patterns may be shared only when the user task is shared. Similar database models are not a reason to give Services, Media, Redirects, Settings, and Projects the same composition.

### Surface modes

Every route declares one visual mode through its nearest shell:

- `PERSUADE`: public pages. Image-led or architectural, generous chapter rhythm, one dominant conversion action, and a `1280px` content cap.
- `OPERATE`: dashboard pages. Neutral, compact, explicit state, predictable controls, and widths selected by task.

Do not mix public display typography, orchestrated motion, broad petrol fields, or promotional copy into `OPERATE`. Do not expose dashboard lifecycle language or dense toolbars in `PERSUADE`.

### Required layout widths

- `public`: `1280px`; wide project media may use `1440px`.
- `dashboard-wide`: `1600px`; overview and media only.
- `dashboard-list`: `1280px`; collections and redirects.
- `dashboard-editor`: `1120px`; two-column editor workspace.
- `dashboard-form`: `880px`; settings and focused forms.
- `editor-main`: `minmax(0, 760px)`.
- `editor-rail`: `288px`, sticky below the `64px` top bar on desktop.
- `prose`: preferred `62ch`, hard maximum `72ch`.

No page may default to the widest width. Inputs follow the information they collect: titles and URLs cap at `760px`, short metadata at `520px`, numeric/date controls at `320px`, and prose editors at `760px`.

### Operational sizing

- Dashboard sidebar: `264px`; mobile drawer: `min(88vw, 320px)`.
- Dashboard top bar: `56px` mobile, `64px` desktop.
- Dashboard control: `40px` with fine pointers, `44px` minimum target, `48px` on mobile primary paths.
- Public header: `72px` mobile, `88px` desktop.
- Public action: `48px` minimum.
- Dashboard table row: `64px` compact, `72px` when secondary metadata is present.
- Dashboard icon: `18px` navigation and controls, `20px` top-level actions, `24px` empty states.
- Collection surface padding: `12px 16px`; editor section spacing: `40px`; major public section spacing: `80px` tablet and `96px` desktop.

### Archetype contracts

- Overview uses an operational summary, useful counts, recent records, and direct creation/navigation actions. No fake metrics or charts.
- Collections use a compact page header, toolbar, scan-friendly rows, explicit lifecycle state, stable actions, pagination, and a purposeful empty state.
- Editors use a main content column plus contextual publication rail on desktop. The rail moves before the main content on small screens, and primary actions remain reachable.
- Media uses thumbnail browsing and a focused details/editing context. It must not render as a text collection.
- Redirects use aligned technical columns, LTR-isolated paths, explicit validation, and local overflow only when comparison requires it.
- Settings use category sections with a medium form width and reachable save action. They are not one unstructured full-width form.
- Home uses a decisive brand field, authentic evidence when supplied, varied narrative sections, and one contact hierarchy.
- Service detail uses need, evidence, explanation, related decision support, FAQ, then contact. It is not an article template.
- Project detail is image-led. Guide detail is reading-led. Their widths and rhythm must remain different.

### Approved dashboard presentation contract

Until the five reference screens receive visual approval, dashboard implementation is limited to the shared shell, Overview, Services collection, Service editor, and Media Library. Other routes must not inherit experimental collection or editor markup.

- Physical scene: one Arabic-speaking administrator works at a bright office monitor for sustained content-entry sessions. The interface is light, cool, low-glare, compact, and immediately scannable rather than dark or decorative.
- Color strategy: restrained. At least 90 percent of each viewport uses warm sand-white surfaces and petrol-tinted ink. Gold is reserved for primary actions and selection; turquoise marks links, focus, and small details. Semantic state colors appear only in icon or status surfaces.
- Canvas and surfaces: the dashboard canvas is `background`. Sidebar is a slightly distinct warm neutral. Primary working surfaces use `card`; controls may use `popover`; hover uses a soft turquoise tint. Major cards use a full 1px `border`, 12–14px radius, 18–24px padding, and at most `--shadow-rest` elevation.
- Shell: `240px` desktop sidebar from `1280px`, right-side drawer below it, `60px` utility topbar, compact `40–42px` navigation rows, `16–18px` icons, and no invented brand mark. The brand area stays within `60–68px`. Navigation groups have 12–16px separation, not large dead gaps.
- Page frame: desktop padding is 24–32px, tablet 20–24px, mobile 16px. Overview and Media cap at `1600px`, Services at `1360px`, and Service editor at `1200px`. Heading-to-first-section spacing is 24px; major section gaps are 20–24px; card grids use 16–20px gaps.
- Typography: dashboard page titles are 28–30px at weight 700; section titles 18–20px at weight 600–700; card titles 15–17px at weight 600; body and fields 14–16px; navigation 13–14px; metadata 12–13px. Values use tabular numerals. Secondary and muted colors, not bold weight everywhere, establish supporting hierarchy.
- Controls: fields and buttons use 8–10px radius and `40px` visual height on desktop, with at least `44px` targets on coarse pointers and mobile. Inputs use the white control surface and a visible neutral boundary. Focus uses the standard 2px ring. Menus use 10–12px radius and the floating-control shadow.
- Overview: use only database-backed Service, Project, Article, Media, and Draft counts. KPI cards are 112–124px high with one small tinted icon block, label, value, and real supporting state. Below them, recent records, real attention checks, and compact creation/navigation actions fill a purposeful asymmetric grid. Never render dashes, fake trends, or decorative charts.
- Services collection: use status summary tabs, one cohesive 40px search/filter toolbar, a semantic desktop table, labelled record rows below `768px`, and pagination attached to the result surface. The table uses a 44px tinted header, 60–64px rows, no vertical rules, one subtle separator, title plus isolated LTR slug, restrained status, localized update time, and one contextual action menu.
- Service editor: use `minmax(0, 820px)` main column, `300px` context rail, and 24px gap. Below `1280px`, the rail follows the main editor instead of compressing the writing canvas. The header keeps breadcrumb context and Preview, Save Draft, Publish in one clear action region. Publish is the only filled action.
- Main editor: Basic Information, Content, and Relationships share one 12–14px working surface with open sections separated by rhythm, not nested cards. The title field is visually stronger than minor metadata. Existing Service content remains an intentional plain-text editor because the data model does not preserve rich formatting.
- Publication rail: status, saved metadata, visibility, featured image, SEO, and additional actions use compact panels. Secondary groups use native progressive disclosure. Selected media shows a real preview; empty media uses an icon-led selection area, never a plain “not selected” box.
- Media Library: use a wide 1600px browser with a compact search/type/sort toolbar and a responsive 4/3/2/1-column image grid. Image-first cards use a consistent square preview, 12px radius, concise filename/size/date metadata, and progressively disclosed editing controls. Upload is a polished dashed tile or compact top action, not a large competing form.
- Status and feedback: badges are compact pills only where status is the affordance. Published is soft green, Draft cool gray, warnings soft amber, errors soft red, and information soft blue. Existing server feedback remains visible and specific. Empty states are compact, icon-led, factual, and contain one valid next action.
- Responsive: at 1280px retain the sidebar and multi-column workspaces. Below 1280px use the right drawer. KPI cards become two columns on tablet and one or two on mobile. Tables become labelled records below 768px. The editor and inspector stack. Media becomes three, two, then one column based on available width.
- RTL and bidi: identifying content begins on the right and row actions remain on the left. Directional arrows follow RTL progression. Slugs, URLs, filenames, MIME types, dimensions, and technical identifiers use isolated LTR runs. Drawers originate from the right; menus align to their trigger without viewport overflow.
- Motion: hover, press, disclosure, and drawer state only. Use 120–200ms for controls and exponential ease-out. Do not animate page entry or layout properties. Reduced-motion removes spatial movement.
- Approval gate: inspect the real shell, Overview, Services, Service editor, and Media Library at 1920x1080, 1440x900, 1280x800, and a mobile width. Stop after these five screens for visual approval before propagating the system.

### Component enforcement

- Route files compose domain data and archetypes. They must not define new button, field, badge, status, page-header, empty-state, or container styling inline.
- Raw color values are allowed only in the palette block at `app/globals.css :root`. Components and data visualization consume semantic tokens.
- Cards require a distinct object, action, selection, or comparison boundary. Ordinary sections use spacing, tonal change, or one separator.
- Every interactive component implements default, hover where supported, focus-visible, active, disabled, and pending states.
- Active navigation uses text weight, icon treatment, and a full soft surface or hairline boundary. It never relies on color alone.
- Destructive actions are separated from routine actions and use explicit consequence copy before irreversible work.
- Mixed-direction identifiers use `<bdi dir="ltr">` or an equivalent isolated LTR run. Do not set an entire Arabic sentence to LTR.
- At `320px` and `200%` zoom, primary content must reflow in one dimension. Only true tables and media strips may own horizontal scrolling.

## 1. Overview

**Creative North Star: "The Measured Roshan"**

The visual system translates Al-Balad roshan screens into proportion, repetition, screened depth, and disciplined alignment rather than literal heritage ornament. Warm sand-white supplies a bright, sun-readable ground. Dark petrol communicates durable shade and professional execution. Gold sand and turquoise provide measured highlights. Precise architectural drawings inform fine rules, measured spacing, captions, and image annotation.

The public website uses the project-defined **PERSUADE** surface mode and Impeccable's brand register. It should feel image-led, locally specific, quietly premium, and visually committed. Dark petrol may carry 30 to 45 percent of a major public page through decisive full-width bands, hero fields, or section transitions. Gold sand marks primary actions and turquoise provides smaller details rather than competing broad fields.

The dashboard uses the project-defined **OPERATE** surface mode and Impeccable's product register. It inherits the petrol and warm sand foundation but remains restrained: approximately 90 percent neutral surfaces, with brand or semantic color used only for primary action, current selection, focus, and status. Familiar controls, explicit lifecycle state, predictable forms, and task completion outrank visual novelty.

The brand is architectural, grounded, exact, durable, locally rooted, and quietly premium. It should feel technically competent without becoming industrially cold, bold without becoming loud, and premium through workmanship rather than luxury affectation. The intended memory is simple: built correctly, lasts.

**Key Characteristics:**

- Arabic-first and structurally RTL.
- Warm sand-white ground with decisive dark-petrol fields.
- Architectural alignment and measured repetition.
- Authentic project evidence before promotional claims.
- Restrained gold-sand and turquoise detail.
- Public persuasion and dashboard operation share foundations but not density.

### UX Principles

1. **Proof before promise.** Place real project imagery, factual details, supported materials, or clear process evidence near important claims.
2. **One decision at a time.** Each viewport has one dominant action. WhatsApp leads public conversion; phone remains clearly available without competing.
3. **Need to evidence to contact.** Relationships between Services, Solutions, Materials, Projects, Guides, and FAQs should create the user's path, not decorative recommendation carousels.
4. **Draft safety is visible.** Dashboard users should always know whether they are editing Draft content, what is currently Published, and what Publish will change.
5. **Arabic determines composition.** Reading order, alignment, control placement, mixed numerals, and directional cues begin in RTL rather than being mirrored later.
6. **Density follows intent.** Marketing pages use contrast and breathing room; operational screens use compact consistency without reducing touch or text accessibility.
7. **Errors preserve progress.** Validation, network, upload, and publication failures keep entered work and provide a specific recovery action.

### Spatial Foundation

The base unit is 4px. Use only the frontmatter spacing scale. Related controls use 8 to 16px gaps, component groups use 20 to 32px, content groups use 32 to 64px, and major public sections use 64 to 128px. Equal spacing everywhere is prohibited; tight internal grouping and generous section separation create rhythm.

- Small mobile, 320 to 479px: one column, 16px inline gutters, 16px grid gap.
- Mobile, 480 to 639px: one column, 20px inline gutters, 16px grid gap.
- Small breakpoint, 640px: four-column public grid, 24px gutters, 20px gap.
- Medium breakpoint, 768px: eight-column grid, 24px gutters, 24px gap.
- Large breakpoint, 1024px: twelve-column grid, 32px gutters, 24px gap.
- Extra-large breakpoint, 1280px: twelve columns, 40px gutters, 32px gap where useful.
- Wide breakpoint, 1536px: retain the grid and cap content rather than stretching it.

Public content uses a 1280px maximum container. Wide project media may use 1440px. Long-form text targets 62ch and must not exceed 72ch. Short commercial copy may use 38 to 52ch. Dashboard content remains fluid after navigation, capped at 1600px; form columns should not exceed 760px unless paired with a contextual rail.

Public section padding is 64px on mobile, 80px on tablet, 96px on desktop, and 128px only between major narrative chapters. Dashboard page padding is 16px on small mobile, 24px on tablet, and 32px on desktop. Dashboard form groups use 24px separation; related fields use 12 or 16px.

Use centered composition for concise page introductions, one-action confirmations, and narrow reading experiences. Use split layouts for a claim paired with real evidence. Use controlled asymmetry for public heroes, featured Projects, and architectural transitions. Use grids for genuine comparison or collections, with content-driven column counts. Use full-bleed media only when the image carries real project context. Use narrow columns for Guides, detailed explanations, FAQs, and form instructions.

Do not use the same grid for Services, Projects, Materials, and Guides. Services may use structured editorial rows, Solutions may pair needs with outcomes, Materials may use factual comparison bands, Projects should be image-led case studies, and Guides should emphasize readable titles and excerpts.

### Sizing Foundation

- Public primary controls: 48px high.
- Dashboard controls: 40px with a fine pointer, at least 44px with coarse input.
- Mobile fields and actions: at least 48px high.
- Icon-only actions: 40px visual box on desktop, 44px target minimum, 48px on primary mobile paths.
- Public header: 72px mobile, 88px desktop.
- Dashboard top bar: 56px mobile, 64px desktop.
- Dashboard side navigation: 264px expanded; 72px icon-only only when accessible labels remain available.
- Media thumbnails: 64px compact, 80px standard dashboard preview.

### Responsive Philosophy

Start with mobile structure and add complexity through `min-width` breakpoints. Breakpoints indicate likely transitions, but implementation should add content-driven breaks where Arabic labels or real media require them. Use viewport queries for page topology, container queries for reusable component topology, and pointer/hover capability queries for interaction density.

Public mobile keeps the value proposition, authentic proof, and contact actions prominent. Secondary descriptions may move below media or into deliberate disclosure, but core content and conversion never disappear. Dashboard mobile supports all core editing tasks. Wide tables become labelled record rows or retain an explicit local horizontal scroll only when true comparison requires it. Editor rails move inline; primary workflow actions may become safe-area-aware sticky controls.

At 200 percent zoom, reading order must remain intact and pages must reflow without two-dimensional page scrolling. Data tables and large media may use their own clearly indicated scroll region. Support portrait and landscape, safe-area insets, software keyboards, coarse pointers on large screens, and fine pointers on tablets.

### RTL Foundation

- Set Arabic language and RTL direction at the document root.
- Use logical inline and block properties in implementation specifications.
- Start reading, alignment, navigation, and identifying table columns from the right.
- Public and dashboard drawers originate from the right.
- Mirror back, forward, previous, next, breadcrumb, and disclosure arrows when their meaning is directional.
- Do not mirror play, close, upload, download, external-link, check, media-control, or brand marks merely because the interface is RTL.
- Isolate phone numbers, email, URLs, slugs, filenames, MIME types, dimensions, and technical identifiers as LTR runs while keeping labels and surrounding sentences RTL.
- Use bidi isolation for mixed sequences so punctuation does not reorder.
- Use the `ar-SA` locale for human dates and numbers unless product content later specifies a different Saudi presentation. Preserve machine identifiers as stored.
- Place dashboard row actions at the left edge and the identifying field at the right unless a specific comparison task requires otherwise.
- Never mirror photographs automatically. Art-direct crops so subject position supports adjacent RTL content.
- Never place essential Arabic text inside imagery.

### Brand Assets

The logo is pending. Reserve horizontal and compact mark slots that tolerate an Arabic wordmark without forcing a square icon. Do not invent a roshan monogram, seal, company name, or symbol. Until an approved asset exists, documentation and prototypes may use a clearly labelled neutral wordmark placeholder only.

## 2. Colors

The palette is sun-readable and rooted in the approved physical references. `app/globals.css :root` is the sole source of truth for numeric color values; this document names roles only. Run `npm run check:colors` to reject raw colors elsewhere in application code.

### Primary

- **Gold Sand:** `primary` is the primary public and dashboard action, important highlight, and selected control color.
- `primary-hover`, `primary-active`, and `primary-soft` provide accessible interaction and selection states derived from the gold.
- Gold is not body text on light surfaces. Use petrol text or the accessible turquoise link role.

### Secondary

**Dark Petrol:** `brand-secondary` carries hero backgrounds, the footer, major dark sections, headings, and structural emphasis. Use `brand-secondary-foreground` and `brand-secondary-muted` for text on these fields. Warm sand-white surfaces derive from `palette-paper` and the brand colors.

### Tertiary

**Turquoise:** `brand-accent` identifies icons, small badges, links, focus, and decorative details. Use `brand-accent-strong` for readable text on light surfaces and `brand-accent-soft` for tinted surfaces. It is never a competing CTA or broad page background.

### Neutral

- `text-primary` is used for headings, body text, primary icons, and high-priority data.
- `text-secondary` is used for supporting prose and ordinary metadata.
- `text-muted` is the lightest permitted text and placeholder role. Never make placeholders lighter.
- `text-inverted` is used on approved dark mineral surfaces.
- `border-default` separates non-interactive regions.
- `border-strong` defines controls and other boundaries that must remain visible.

### Functional Colors

- Success uses `state-success` on `state-success-soft` and always includes explicit Arabic text or a recognizable icon.
- Warning uses `state-warning` on `state-warning-soft` and explains the consequence or required attention.
- Error uses `state-error` on `state-error-soft` and is reserved for failure, invalid input, or destructive action.
- Information uses `state-info` on `state-info-soft` only for neutral informational state, never as a second brand accent.
- Disabled controls use `state-disabled`, retain readable text, and provide an explanation when the reason is not obvious.

### Interaction Colors

- Default filled action: `primary` with `primary-foreground`.
- Hover: `primary-hover`, only when hover is available.
- Active: `primary-active` with immediate press feedback.
- Focus: 2px `ring` outline, 2px offset, separated from the element by an opaque local surface.
- Selected: `primary-soft` plus petrol text or a full 1px primary boundary.
- Disabled: neutral surface and `state-disabled`; do not use opacity alone.

### Approved Contrast Pairings

Use `foreground` or `text-secondary` on warm light surfaces, `brand-secondary-foreground` on petrol fields, `primary-foreground` on gold actions, and `brand-accent-strong` for turquoise links. Recheck WCAG AA whenever a raw palette value changes; derived tokens do not remove the need for contrast testing.

**The Bright-Sun Rule.** Important public information uses `text-primary` or `text-secondary` on an opaque limestone surface. Never place thin text directly over photography. If text must overlap an image, use an opaque mineral panel with verified contrast.

**The One Action Rule.** WhatsApp is the only filled primary contact action in a conversion group. Phone is outlined or text-supported.

**The Accent Restraint Rule.** Turquoise marks links and small details; it never competes with WhatsApp, Save Draft, Publish, or destructive actions.

**The No Pure Neutral Rule.** Pure white, pure black, and zero-chroma gray are prohibited. Use the named tinted surfaces and mineral text roles.

## 3. Typography

**Display Font:** Readex Pro, with Noto Sans Arabic, Tahoma, Arial, and sans-serif fallbacks  
**Body Font:** Readex Pro, with the same fallback stack  
**Dashboard Font:** Readex Pro, with the same fallback stack

Readex Pro supports Arabic and Latin, provides broad weight coverage, and has geometric discipline without turning Arabic into decorative display lettering. One family keeps public expression and dashboard operation coherent, reduces loading cost, and avoids an unnecessary display/body split.

Use a variable WOFF2 with Arabic and required Latin glyphs when licensing and hosting permit. Load weights 400, 500, 600, 650, and 700 through the variable axis rather than separate files. Preload only the regular above-fold face. Use `font-display: swap` and metric-adjusted fallbacks. Do not retain the scaffold's Geist or Arial-first design as brand typography.

### Public Hierarchy

- **Display:** `clamp(3rem, 6vw, 4.5rem)`, weight 700, line-height 1.18. Home hero and rare chapter statements only.
- **H1:** `clamp(2.25rem, 4.5vw, 3.5rem)`, weight 700, line-height 1.24. Exactly one page title.
- **H2:** `clamp(1.75rem, 3vw, 2.5rem)`, weight 650, line-height 1.35. Major narrative sections.
- **H3:** `clamp(1.375rem, 2vw, 1.875rem)`, weight 600, line-height 1.45. Subsections and grouped facts.
- **Lead:** 1.25rem mobile, 1.5rem desktop, weight 500, line-height 1.65. Short introductions only.
- **Body:** 1.0625rem mobile, 1.125rem desktop, weight 400, line-height 1.76 to 1.78.
- **Small:** 0.9375rem mobile, 1rem desktop, weight 400, line-height 1.7. Captions and supporting facts.
- **Label:** 0.875rem, weight 600, line-height 1.7. Navigation, buttons, field labels, and compact metadata.

### Dashboard Hierarchy

- **Page title:** 1.5rem mobile, 1.75rem desktop, weight 700, line-height 1.45.
- **Section title:** 1.25rem mobile, 1.4375rem desktop, weight 600, line-height 1.5.
- **Subheading:** 1.125rem mobile, 1.1875rem desktop, weight 600, line-height 1.55.
- **Body and field value:** 1rem, weight 400, line-height 1.65.
- **Small/table content:** 0.875rem, weight 400, line-height 1.6.
- **Label/button/status:** 0.8125rem, weight 600, line-height 1.55.
- **Caption:** 0.75rem, weight 500, line-height 1.65. Timestamps and low-priority metadata only.

### Reading Rules

- Public prose targets 62ch and never exceeds 72ch. Dashboard instructions target 55ch.
- Use paragraph spacing, not first-line indentation.
- Balance short headings and apply visually improved wrapping to prose where browser support permits.
- Do not apply letter spacing to Arabic. Do not uppercase or simulate small caps.
- Use tabular numerals for prices, dimensions, dates, counts, statuses, and tables.
- Isolate mixed Latin and numeric data without changing surrounding Arabic alignment.
- Body text never falls below 17px on public mobile or 16px in dashboard fields.
- Instructions, errors, and required information never use the 12px caption role.
- Test Arabic shaping, diacritics, long headings, Saudi phone numbers, Latin filenames, and mixed Arabic-number table cells on supported platforms.

**The Single-Family Rule.** Do not add a decorative display font, serif, or monospace voice unless the approved identity changes.

**The Arabic Measure Rule.** Long-form content uses a controlled reading width and generous leading; wide empty sections do not substitute for readable composition.

**The Weight-before-Size Rule.** Use weight, position, color, and space with type scale. Do not create hierarchy through a proliferation of nearby font sizes.

## 4. Elevation

The system is flat by default. Depth comes from opaque tonal layers, full hairline boundaries, overlap, and spacing. Shadows indicate actual floating behavior such as menus, drawers, sticky controls, and dialogs. Public sections and ordinary dashboard panels have no shadow at rest.

### Shadow Vocabulary

- **Resting edge:** `--shadow-rest`. Menus, a raised mobile contact bar, and working surfaces that need separation.
- **Floating control:** `--shadow-float`. Dropdowns, popovers, and sticky controls.
- **Drawer:** `--shadow-drawer`. Public and dashboard navigation drawers only.
- **Dialog:** `--shadow-dialog`. Required modal confirmation only.

### Border Vocabulary

- Standard boundary: 1px `border-default`.
- Interactive boundary: 1px `border-strong`.
- Focus: 2px `brand-primary-focus`, offset 2px.
- Selected: full 1px primary boundary, soft primary fill, or both.
- Architectural rule: 1px divider used to explain structure, never repeated around every section.
- Side-stripe accents are prohibited.

### Overlay Vocabulary

Use an opaque `surface-overlay` for menus and popovers. Dialog backdrops may use a bounded translucent mineral ink overlay, but dialog content remains opaque. Decorative transparency, backdrop blur, and glass cards are prohibited.

### Z-Index Scale

- Base content: 0.
- Local overlap: 10.
- Sticky header and local sticky actions: 100.
- Dropdown, popover, and combobox: 200.
- Navigation drawer: 300.
- Dialog backdrop: 400.
- Dialog: 500.
- Toast and live workflow feedback: 600.
- Tooltip: 700.

**The Flat-until-Floating Rule.** If a surface does not physically overlap another surface, it receives no shadow.

**The Opaque-Surface Rule.** Blur and glass do not communicate quality here. Use material color, spacing, and precise boundaries.

## 5. Components

### Shape Language

The system is precise with slight softening, not sharp-industrial and not pill-heavy. Buttons, fields, statuses, and compact controls use 4px. Standard content surfaces use 8px. A prominent 12px radius is reserved for large media or one major CTA panel when the composition benefits. Project images may use 2px or remain square. Pills are limited to removable filters, compact segmented selections, and avatar-like circular controls. Never mix square, 24px rounded, and pill controls arbitrarily.

### Buttons And Links

Public primary means WhatsApp. It is filled gold sand with dark ink, 48px high, content-width on wide screens, and may become full-width on narrow screens. Public secondary means phone or contextual navigation and uses an outlined or text-supported treatment. Tertiary actions are underlined turquoise text links with standalone labels.

Dashboard primary means the single current workflow action, usually Save Draft. Preview is secondary. Publish is visually distinct and appears as an enabled action only when publication requirements are met; it does not compete as a second filled primary beside Save Draft. Archive and permanent media deletion use the error family and are separated from routine actions.

All buttons grow with Arabic text and preserve at least 44 by 44px targets. Define default, hover, focus-visible, active, disabled, loading, error, and success where applicable. Loading preserves width and keeps action context. Icon-only buttons are rare, conventional, and always have an accessible Arabic name. Never use labels equivalent to OK, Yes, or Submit; use a specific verb and object.

Inline links are visibly identifiable without color alone. Link text names its destination. A whole card may be linked only when it has one destination and contains no nested interactive control. Phone links use the configured number. WhatsApp links use the configured number and approved composed message. External navigation is disclosed where it could surprise the user.

### CTA Hierarchy

1. Primary: structured WhatsApp contact.
2. Secondary: direct phone call.
3. Tertiary: contextual internal destination.
4. Supporting: configured email, address, hours, or social links.

Use high-intent WhatsApp and phone actions after decision evidence on Service, Solution, Material, Project, Guide, Prices, and Contact surfaces when contact is relevant to that page. Use softer internal links before sufficient evidence has been shown. A main CTA group contains no more than WhatsApp and phone. Do not repeat the same full CTA after every section.

A public mobile contact bar may use one safe-area-aware bottom surface. WhatsApp occupies the dominant area and phone remains secondary. The bar must not cover content, focused fields, validation, or legal controls. If the bar exists, do not add a floating WhatsApp bubble.

### Header And Navigation

Desktop public navigation has one primary row: logo/home link, canonical route navigation, and the WhatsApp action. A restrained utility row may show phone, About, and Contact only when content length permits. Canonical discovery items are Services, Solutions, Materials, Projects, Prices, and Guides. Active state uses weight plus a bottom or full hairline cue, never a thick side stripe.

The header is 88px on desktop and may compact once after scroll. It remains stable rather than continuously transforming. On tablet, preserve logo, WhatsApp, and the highest-priority links that fit; move remaining links into an explicitly labelled menu. On mobile, use a 72px row with menu trigger, optically balanced logo slot, and WhatsApp action.

The mobile menu is a full-height drawer from the right. It contains one flat destination list, current-page indication, and a separate contact region with WhatsApp then phone. Opening moves focus inside and makes the background inert. Escape and an explicit close button dismiss it. Closing restores focus. Nested public navigation is not required by the approved information architecture.

Dashboard desktop navigation is a persistent right-side rail with Overview; Content containing Services, Solutions, Materials, Projects, Articles, FAQs, and Pages; Media; SEO containing Redirects; and Settings. Below 1024px it becomes a right-side drawer. Mobile top bars show menu, page title, and one contextual action. Public terminology is Guides; dashboard terminology remains Articles.

### Footer

The public footer contains company identity and configured description, canonical route groups, configured contact details, configured social links, and legally required information when supplied. It supports discovery but is not a duplicate sitemap. It contains no keyword link farm, invented location links, newsletter form, testimonials, fabricated ratings, or unavailable social accounts. Phone, email, URLs, and handles use correct mixed direction.

The dashboard has no marketing footer. Use only a compact operational footer when required for version, support, or legal information.

### Breadcrumbs

Use visible breadcrumbs on all public listing and detail pages except Home. The pattern is Home, route group, current item. Current item is plain text and marked current. Directional separators point with RTL progression. Long titles wrap or truncate visually while the full value remains accessible. Breadcrumb structured data must match the visible route.

Dashboard breadcrumbs are used only for nested editor routes where navigation plus page title does not provide enough location.

### Content Cards And Rows

Cards exist only for distinct, actionable, or genuinely comparable records. Never nest cards. Prefer editorial rows, image-led project bands, ruled material comparisons, relationship lists, and open spatial grouping over repeated containers.

- **Service:** title, short description, detail link, optional 4:3 authentic application media.
- **Solution:** need or context title, short description, detail link, optional 4:3 media.
- **Material:** name, short description, detail link, optional factual characteristic and 1:1 or 4:3 detail media.
- **Project:** title, short description, optional real 3:2 image, optional factual city/district or completion detail, and case-study link.
- **Guide:** title, excerpt, detail link, optional article type and 16:9 relevant editorial media.
- **Dashboard record:** title or name, lifecycle state, updated metadata, and consistent actions; usually no image.

Missing optional media produces a deliberate text-led layout, never a fake photograph or blank colored image placeholder. Do not fabricate metadata to equalize card height. Clamp summaries in listings only when full titles and essential context remain available. Render related content only when a real relationship exists.

### Imagery And Media

Use authentic company-supplied project and supported-material photography. Preserve construction joints, material texture, shade behavior, site context, and human scale. Avoid fake skies, heavy filters, excessive sharpening, misleading composites, or grading that changes material truth. Generic stock and AI-generated imagery may not serve as evidence of executed work.

- Public hero desktop: 16:9 or 3:2, preserving structure and installation context.
- Public hero mobile: art-directed 4:5 crop, never a blind center crop.
- Project listing: 3:2.
- Project gallery: original image available, with normalized previews and captions.
- Service and Solution: 4:3.
- Material: 1:1 detail or 4:3 application context.
- Guide: 16:9 when relevant imagery exists.
- Dashboard media tile: 1:1 contain; it does not imply the final public crop.
- Open Graph: the approved platform ratio supplied through explicit media or fallback.

Reserve dimensions to prevent layout shift. Use responsive sources and art direction where composition changes. Meaningful images receive concise Arabic alt text describing relevant visible information. Decorative images use empty alt. Never copy filenames into alt text or add SEO keywords. Gallery controls expose image position, caption, keyboard operation, and a non-thumbnail navigation path.

### Forms And Fields

Every field has a visible Arabic label, control, optional concise hint, and associated error. Place errors below fields and include a form-level summary linked to invalid fields after failed submission. Validate on blur and submit, not on every keystroke except a genuine real-time requirement. Preserve values after recoverable errors.

Fields use `surface-base`, a full 1px `border-strong` boundary, 4px radius, and standard 44px desktop height or 48px mobile height. Textareas begin at 120px. Focus changes the boundary to primary and applies the standard focus ring. Placeholders never replace labels.

Public structured WhatsApp forms may collect only approved Service, Solution, Material, approximate dimensions, city, district, and notes values. The final label explicitly says that WhatsApp will open. Do not imply that a request, quote, or lead has been saved. Preserve values if external navigation fails.

Dashboard forms group fields by meaning rather than database structure. Main content comes first, followed by entity-specific facts, media, relationships, FAQs where supported, and SEO. Drafts may remain incomplete; Publish requirements are shown separately. Slug controls explain public-route consequences and redirect behavior. Relationship selectors prevent duplicates and support search where useful. Media selection always offers Select Existing and Upload New.

Do not assume autosave. Show unsaved state and protect accidental navigation when edits exist. Submitting prevents duplicate actions and announces progress. Server validation remains authoritative.

### Dashboard Workflow And Status

Use explicit Arabic labels for Draft, Published, Archived, and Published with unpublished changes. Color is supplementary. Published with unpublished changes must not appear equivalent to Published. A success toast never replaces persistent lifecycle state.

Save Draft, Preview, Publish, and Archive remain distinct actions. Publish states that public content will change. A publish failure confirms that the current Published version remains live and the Draft remains recoverable. Archive explains removal from listings and sitemap without implying permanent deletion.

Dashboard forms support loading, ready, submitting, validation error, success, and server error. Authentication expiry, permission denial, missing records, network failure, and server failure each provide a specific path forward without exposing technical internals.

### Tables And Lists

Dashboard tables use tabular numerals, explicit column headings, and stable row action placement. Search and status filters appear where useful. Sorting is visible only where implemented. Selection appears only when a real batch action exists. Lists use pagination or efficient incremental loading and never fetch rich-text bodies.

Below 768px, use flat record rows showing title, status, one useful metadata line, and actions. Do not reproduce every desktop column. Redirects and truly comparative data may retain a local horizontal scroll with visible affordance. Sticky headings use opaque surfaces. Sticky columns must be tested in RTL so they do not obscure content.

### Accordions, Tabs, And Badges

Use accordions for FAQs and secondary disclosure, never to hide primary service information. The full summary is a 44px target, uses correct heading structure, exposes expanded state, and has a mirrored directional chevron. Multiple FAQs may remain open. Reduced motion removes spatial expansion.

Use tabs only for peer views of the same object. One tab is tabbable and arrows follow visual adjacency in RTL. Selected state uses more than color. On narrow screens, replace tabs with an explicit selector or stacked sections before labels clip. Required form errors must not remain hidden in inactive tabs.

Badges are limited to lifecycle status, optional Article type, and active filter or selection state. They pair color with text or icon, use 4px radius, and remain visually quiet. Promotional, urgency, popular, discount, and fabricated-proof badges are prohibited.

### Empty, Loading, Success, And Error States

Empty states contain a factual heading, one explanatory sentence, and one valid next action. Distinguish no records, no filtered results, no selected relationships, and empty media. Optional public sections with no content do not render.

Use structural skeletons for pages, lists, cards, and media. Inline button progress names long operations such as Saving Draft, Publishing, or Uploading media. Preserve dimensions to prevent layout shift. A failed secondary selector must not block the entire editor.

Success feedback names the result. Saving Draft and Publishing use different messages and polite live-region announcements. Errors state what failed, why when known, and what to do next. Never blame the user or use humor during failure.

### Motion And Interaction

- Press and immediate color feedback: 100ms.
- Hover, focus, and selection: 150ms.
- Menus, tooltips, and validation feedback: 200ms.
- Accordion and progressive disclosure: 300ms.
- Drawer entrance: 400ms; exit: 300ms.
- Optional public first-view reveal: 500ms maximum, one sequence per page, no more than six items, 40ms stagger.

Default easing is `cubic-bezier(0.25, 1, 0.5, 1)`. Emphasized entrance uses `cubic-bezier(0.16, 1, 0.3, 1)`. Exit uses `cubic-bezier(0.7, 0, 0.84, 0)`. Reversible state change uses `cubic-bezier(0.65, 0, 0.35, 1)`.

Dashboard pages have no orchestrated entrance. Motion conveys state only. Avoid casual animation of width, height, top, left, or margins. Use transforms, opacity, grid-row disclosure, or FLIP-style movement. Under reduced motion, remove spatial travel and stagger while preserving focus, progress, status, and immediate state feedback.

### Page Composition Patterns

**Home:** concise hero with one decisive real image when approved hero media is supplied; WhatsApp and phone; selected Services; selected Solutions; real featured Projects; trust or benefit content; selected FAQs; final CTA. Without hero media, use an intentional text-and-geometry composition rather than a fake image. Vary composition between sections rather than repeating cards.

**Listing pages:** breadcrumb; H1 and concise supplied introduction; optional useful filters only when supported by real content; type-specific listing; pagination or efficient loading; contextual contact action where appropriate. Do not invent facets, counts, or local links.

**Service detail:** breadcrumb; title, short description, optional hero; main content; related Solutions and Materials; real Projects as proof; related Guides; FAQs; supplied pricing link; contact CTA.

**Solution detail:** breadcrumb; need/context introduction; main content; suitable Services and Materials; relevant Projects; supplied pricing factors; related Guides; FAQs; contact CTA.

**Material detail:** breadcrumb; name, short description, optional hero; main content; advantages and limitations with equal factual weight; recommended uses and maintenance; related Services and Solutions; real Projects; Guides; FAQs; contact CTA.

**Project detail:** breadcrumb; title and summary; cover image when supplied; available factual metadata; challenge; implemented solution; technical details; ordered gallery when supplied; related Services, Solutions, Materials, and Guides; contact CTA. Omit absent facts and media rather than filling gaps.

**Guide detail:** breadcrumb; optional Article type; H1, excerpt, optional hero; in-page contents only for sufficiently long content; structured body; real tables only when required; related entities; visible FAQs; contact CTA.

**Prices:** breadcrumb; hero; pricing approach; supplied pricing factors; selected Pricing Guides; FAQs; contact CTA. Never invent prices and never imply `/prices/[slug]`.

**About:** breadcrumb; hero; supplied company story; supplied values; supplied capabilities; final CTA. Do not add mission, vision, team, history, certifications, or statistics without approved content.

**Contact:** breadcrumb; hero; contact introduction; structured WhatsApp flow; enabled phone, email, address, and hours from settings; closing guidance. Do not imply internal lead storage.

**Dashboard Overview:** lightweight published counts for Services, Projects, and Articles; Draft count; recently edited content; quick links. No revenue, lead, traffic, or conversion analytics.

**Dashboard lists:** search where useful; lifecycle filter; sorting and pagination; Create Draft; title, status, update metadata, and actions. No rich body content.

**Dashboard editors:** identity/content; structured or rich content; media; entity facts; relationships; FAQs where supported; SEO; explicit Draft, Preview, Publish, and Archive controls.

**Media:** search/filter; upload; responsive browser; selection; metadata; alt/caption editing; reference-aware deletion.

**Redirects:** source, destination, 301 status, and actions. Path fields are LTR. Prevent duplicate sources, self-redirects, loops, and unnecessary chains.

**Settings:** Company, Contact, Social, and Website defaults only. Do not expose an unrestricted key/value editor.

### Marketing And SEO Content

Use exactly one visible H1. Opening copy answers intent without restating the title. Long content uses logical H2/H3 hierarchy, short paragraphs, real lists, media with captions, and tables only for genuine comparisons. Add an in-page contents list only when section depth justifies it.

Related links come from real content relationships. Projects serve as evidence where related. FAQ structured data requires visible qualifying FAQs. The final contact CTA appears after enough decision context. Do not repeat conclusions to stuff keywords, create footer link farms, or generate city, district, neighborhood, or duplicate-intent landing pages.

### Accessibility Requirements

- Meet WCAG 2.2 AA across public and dashboard surfaces.
- Text contrast is at least 4.5:1; large text and UI graphics meet at least 3:1 where applicable.
- Every action is keyboard accessible and has a visible focus state.
- Provide a skip link and semantic landmarks with one main region.
- Maintain logical heading hierarchy without choosing levels for visual size.
- Labels, hints, errors, and requirements remain programmatically associated.
- Focus an error summary after failed form submission and link it to invalid fields.
- Announce saving, publishing, upload, error, and success state appropriately.
- Drawers and dialogs trap focus, make background content inert, close predictably, and restore focus.
- Galleries, tabs, accordions, menus, and tables follow established keyboard conventions.
- Do not communicate state through color alone.
- Preserve 44px targets, 320px reflow, 200 percent text enlargement, forced-colors support, and reduced-motion alternatives.
- Meaningful images receive factual Arabic alt text; decorative images use empty alt.
- Screen-reader reading order matches visual RTL order.
- Session expiry and operation failure never silently discard work.

## 6. Do's and Don'ts

### Do:

- **Do** show authentic project evidence before promotional claims.
- **Do** use dark petrol decisively on public pages, gold for primary actions, and turquoise sparingly for details.
- **Do** keep WhatsApp as the single filled contact action and phone as the clear secondary action.
- **Do** express roshan influence through proportion, screening, rhythm, and measured alignment.
- **Do** use opaque limestone surfaces for bright outdoor readability.
- **Do** use logical RTL structure and explicit bidi handling from the first implementation pass.
- **Do** vary page and section composition according to content type.
- **Do** keep Guides readable at 62ch preferred measure and break substantial content into meaningful sections.
- **Do** preserve familiar dashboard affordances, explicit publication state, and predictable feedback.
- **Do** let Drafts remain incomplete while distinguishing Publish requirements.
- **Do** use full borders, surface tints, text, and icons for state emphasis.
- **Do** provide every interactive state, visible focus, keyboard behavior, and 44px targets.
- **Do** preserve user input after recoverable errors.
- **Do** test mobile editing, Arabic text expansion, 200 percent zoom, coarse pointers, real devices, and reduced motion.
- **Do** use only approved routes, content relationships, and factual business information.

### Don't:

- **Don't** use generic contractor templates with stock roofs, yellow-and-black construction clichés, crowded service tiles, and bargain-led messaging.
- **Don't** use generic SaaS presentation, identical card grids, gradient text, decorative glass effects, hero-metric templates, and interchangeable AI-generated layouts.
- **Don't** use luxury showroom or editorial affectation that hides practical capability behind precious styling.
- **Don't** use loud promotional styling, excessive badges, urgency banners, decorative icons, and competing calls to action.
- **Don't** fabricate prices, project facts, technical claims, service areas, branches, credentials, ratings, statistics, or proof points.
- **Don't** use colored left or right side stripes greater than 1px on cards, navigation, lists, callouts, or alerts.
- **Don't** use gradient text, default glassmorphism, or decorative backdrop blur.
- **Don't** use repeated icon, heading, and text tiles or nest cards.
- **Don't** center every section or apply identical section padding throughout.
- **Don't** use modal dialogs as the first solution; prefer inline disclosure, a dedicated route, or a drawer.
- **Don't** use a monospace face as shorthand for technical competence or add a decorative display family.
- **Don't** place large rounded icons above every heading or transform Arabic labels to uppercase.
- **Don't** use display typography, orchestrated entrances, or decorative imagery in dashboard controls.
- **Don't** reinvent standard forms, scrollbars, tables, menus, dialogs, or publication controls for flavor.
- **Don't** make Save Draft and Publish look equivalent or hide current lifecycle state.
- **Don't** validate an incomplete Draft as though it is being Published.
- **Don't** load rich-text bodies in dashboard lists or wrap every field group in a card.
- **Don't** use optimistic behavior for Publish, Archive, or permanent media deletion.
- **Don't** use stock, AI-generated, composited, or falsely representative imagery as project proof.
- **Don't** mirror photographs or place essential Arabic text inside images.
- **Don't** invent a logo, roshan symbol, monogram, company name, or seal while the identity is pending.
- **Don't** use pure black, pure white, zero-chroma gray, gray text on colored backgrounds, or weak placeholders.
- **Don't** rely on color, hover, swipe, icon shape, or animation as the only cue.
- **Don't** use bounce, elastic, generic easing, decorative motion, or casual layout-property animation.
- **Don't** add a dark theme without an approved usage scene that requires it.
- **Don't** add testimonials, customer accounts, CRM, quote persistence, bookings, newsletter, live chat, page building, or analytics dashboards.
- **Don't** create `/articles`, `/prices/[slug]`, or unapproved city, district, neighborhood, and keyword landing pages.
- **Don't** imply that structured WhatsApp details are saved by the website.
- **Don't** add multilingual storage or English UI without an approved scope change.
- **Don't** expose Draft, Preview, Archived, dashboard, or authentication content to public indexing.
