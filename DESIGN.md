---
name: "Jeddah Shading"
description: "Arabic-first architectural clarity for durable outdoor work in Jeddah and Makkah"
colors:
  background-canvas: "oklch(97.5% 0.009 100)"
  background-muted: "oklch(95% 0.012 110)"
  background-brand-subtle: "oklch(95.5% 0.018 145)"
  surface-base: "oklch(99% 0.004 110)"
  surface-raised: "oklch(96.5% 0.009 120)"
  surface-overlay: "oklch(98.5% 0.006 115)"
  text-primary: "oklch(22% 0.018 155)"
  text-secondary: "oklch(42% 0.018 150)"
  text-muted: "oklch(50% 0.014 150)"
  text-inverted: "oklch(99% 0.004 100)"
  border-default: "oklch(82% 0.012 145)"
  border-strong: "oklch(64% 0.018 145)"
  brand-primary: "oklch(37% 0.075 155)"
  brand-primary-hover: "oklch(29% 0.055 155)"
  brand-primary-active: "oklch(22% 0.035 155)"
  brand-primary-focus: "oklch(51% 0.09 155)"
  brand-primary-soft: "oklch(90% 0.035 150)"
  brand-accent: "oklch(58% 0.11 45)"
  brand-accent-strong: "oklch(34% 0.065 42)"
  brand-accent-soft: "oklch(91% 0.035 55)"
  state-success: "oklch(44% 0.085 155)"
  state-success-soft: "oklch(95.5% 0.018 145)"
  state-warning: "oklch(47% 0.10 75)"
  state-warning-soft: "oklch(94% 0.035 80)"
  state-error: "oklch(46% 0.16 28)"
  state-error-soft: "oklch(94% 0.025 28)"
  state-info: "oklch(46% 0.09 240)"
  state-info-soft: "oklch(94% 0.025 240)"
  state-disabled: "oklch(53% 0.012 150)"
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
  control: "4px"
  surface: "8px"
  prominent: "12px"
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

## 1. Overview

**Creative North Star: "The Measured Roshan"**

The visual system translates Al-Balad roshan screens into proportion, repetition, screened depth, and disciplined alignment rather than literal heritage ornament. Red Sea limestone supplies a bright, sun-readable ground. Mineral green communicates durable shade and professional execution. Fired clay appears only as a material note. Precise architectural drawings inform fine rules, measured spacing, captions, and image annotation.

The public website uses the project-defined **PERSUADE** surface mode and Impeccable's brand register. It should feel image-led, locally specific, quietly premium, and visually committed. Mineral green may carry 30 to 45 percent of a major public page through decisive full-width bands, hero fields, or section transitions. It must never become a generic green accent scattered across a template.

The dashboard uses the project-defined **OPERATE** surface mode and Impeccable's product register. It inherits the mineral and limestone foundation but remains restrained: approximately 90 percent neutral surfaces, with brand or semantic color used only for primary action, current selection, focus, and status. Familiar controls, explicit lifecycle state, predictable forms, and task completion outrank visual novelty.

The brand is architectural, grounded, exact, durable, locally rooted, and quietly premium. It should feel technically competent without becoming industrially cold, bold without becoming loud, and premium through workmanship rather than luxury affectation. The intended memory is simple: built correctly, lasts.

**Key Characteristics:**

- Arabic-first and structurally RTL.
- Bright limestone ground with decisive mineral-green fields.
- Architectural alignment and measured repetition.
- Authentic project evidence before promotional claims.
- Restrained fired-clay detail.
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

The palette is mineral, sun-readable, and rooted in the approved physical references. All canonical values are in the YAML frontmatter. The project intentionally uses OKLCH as its source of truth; strict Stitch export may warn because it expects hexadecimal sRGB.

### Primary

- **Mineral Green:** `brand-primary` is the core brand color, primary public action, dashboard primary action, current selection, and major public color field.
- **Deep Mineral:** `brand-primary-hover` and `brand-primary-active` provide interaction depth and dark structural fields.
- **Screened Mineral:** `brand-primary-soft` and `background-brand-subtle` support selected rows, quiet navigation, and restrained section transitions.

On the public site, mineral green may carry 30 to 45 percent of a major page when used as one decisive field. On the dashboard, keep brand color below approximately 10 percent of the viewport and reserve it for action, selection, focus, and state.

### Secondary

The secondary brand role is the limestone surface family: `background-canvas`, `background-muted`, `surface-base`, and `surface-raised`. These are active identity colors, not default white or generic gray. They create sun-readable calm and let authentic imagery carry visual detail.

### Tertiary

**Fired Clay** uses `brand-accent`, `brand-accent-strong`, and `brand-accent-soft`. It identifies material annotations, selected project details, location context, and rare editorial emphasis. Keep fired clay below approximately 3 percent of a page's visual weight. It is never a competing CTA, error state, or broad page background.

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

- Default filled action: `brand-primary` with `text-inverted`.
- Hover: `brand-primary-hover`, only when hover is available.
- Active: `brand-primary-active` with immediate press feedback.
- Focus: 2px `brand-primary-focus` outline, 2px offset, separated from the element by an opaque local surface.
- Selected: `brand-primary-soft` plus primary text or a full 1px primary boundary.
- Disabled: neutral surface and `state-disabled`; do not use opacity alone.

### Approved Contrast Pairings

The following conservative pairings meet WCAG AA after sRGB conversion and gamut clipping. Recheck the rendered implementation, font weight, anti-aliasing, forced-colors mode, and image context before release.

| Foreground | Background | Approximate contrast | Approved use |
|---|---|---:|---|
| `text-primary` | `background-canvas` | 16.0:1 | All text |
| `text-primary` | `surface-base` | 16.8:1 | All text |
| `text-secondary` | `background-canvas` | 7.8:1 | Body and metadata |
| `text-muted` | `background-canvas` | 5.5:1 | Placeholder and tertiary text |
| `text-inverted` | `brand-primary` | 9.8:1 | Filled actions and dark fields |
| `brand-primary` | `background-brand-subtle` | 8.9:1 | Selected and branded soft surfaces |
| `brand-accent-strong` | `brand-accent-soft` | 9.1:1 | Clay annotations |
| `state-error` | `state-error-soft` | 6.4:1 | Error text and icons |
| `state-warning` | `state-warning-soft` | 5.8:1 | Warning text and icons |
| `state-info` | `state-info-soft` | 5.9:1 | Informational text and icons |
| `border-strong` | `surface-base` | 3.2:1 | Input and component boundaries |
| `brand-primary-focus` | `background-canvas` | 5.1:1 | Focus indicator |

**The Bright-Sun Rule.** Important public information uses `text-primary` or `text-secondary` on an opaque limestone surface. Never place thin text directly over photography. If text must overlap an image, use an opaque mineral panel with verified contrast.

**The One Action Rule.** WhatsApp is the only filled primary contact action in a conversion group. Phone is outlined or text-supported.

**The Clay Restraint Rule.** Fired clay marks material or place; it never competes with WhatsApp, Save Draft, Publish, or destructive actions.

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

- **Resting edge:** `0 1px 2px oklch(22% 0.018 155 / 0.08)`. Menus, a raised mobile contact bar, and working surfaces that need separation.
- **Floating control:** `0 8px 24px oklch(22% 0.018 155 / 0.12)`. Dropdowns, popovers, and sticky controls.
- **Drawer:** `0 16px 48px oklch(22% 0.018 155 / 0.16)`. Public and dashboard navigation drawers only.
- **Dialog:** `0 24px 64px oklch(22% 0.018 155 / 0.20)`. Required modal confirmation only.

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

Public primary means WhatsApp. It is filled mineral green, 48px high, content-width on wide screens, and may become full-width on narrow screens. Public secondary means phone or contextual navigation and uses an outlined or text-supported treatment. Tertiary actions are underlined text links with standalone labels.

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
- **Do** use mineral green decisively on public pages and sparingly in the dashboard.
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
