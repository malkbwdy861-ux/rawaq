
# FULL UI/UX DESIGN RESET — PUBLIC WEBSITE + CMS DASHBOARD

The current implementation is functionally progressing, but the visual design is NOT acceptable.

This is not a request for minor polishing.

Do NOT simply:

- tweak colors,
- increase border radius,
- add shadows,
- reduce padding,
- add icons,
- or cosmetically restyle the existing layouts.

The underlying visual system, information architecture, page composition, component hierarchy, spacing, density, and interaction patterns need to be reconsidered.

The current pages look like the same generic form/list layout repeated across every route.

We need a full visual and UX reset.

---

# 0. IMPORTANT CONTEXT

This project already contains:

- an existing implementation,
- an existing `design.md`,
- an installed Impeccable design skill,
- working routes,
- working CMS functionality,
- public website pages,
- dashboard/admin pages.

DO NOT rebuild the application from scratch.

DO NOT change business logic unnecessarily.

DO NOT break existing functionality, URLs, content models, SEO behavior, publishing flows, API contracts, or database logic.

We are redesigning and restructuring the UI layer around the existing product.

`design.md` must become the authoritative UI/UX specification.

Use the installed Impeccable skill while performing the design work.

---

# 1. QUALITY TARGET

The quality target is comparable to polished products such as:

- Linear
- Vercel
- Stripe Dashboard
- Payload CMS
- Sanity Studio
- high-quality shadcn dashboards
- modern premium SaaS products

Do NOT clone any of them.

Instead study the qualities they share:

- strong hierarchy,
- excellent typography,
- restrained color usage,
- intelligent information density,
- consistent rhythm,
- subtle surfaces,
- minimal unnecessary borders,
- excellent component composition,
- strong interaction states,
- purposeful whitespace,
- predictable navigation,
- polished forms,
- excellent tables,
- excellent empty states,
- clear contextual actions,
- restrained shadows,
- thoughtful responsive behavior,
- keyboard-friendly interfaces,
- calm/easy-to-eye visual appearance.

The finished product should feel deliberately designed rather than generated from generic UI primitives.

---

# 2. FIRST: AUDIT, DO NOT IMMEDIATELY CODE

Before modifying UI code, perform a focused design audit.

Do NOT blindly read the entire repository.

Start with:

1. `design.md`
2. dashboard root layout / shell
3. public root layout
4. shared UI components
5. typography/theme/global CSS
6. route structure
7. representative pages from each UI archetype

Inspect enough representative pages to understand the system.

For the dashboard, inspect at minimum:

- Overview
- Services list
- Service editor
- Solutions list/editor
- Articles list/editor
- Projects list/editor
- Media
- Pages
- Redirects
- Settings

For the public website inspect representative pages such as:

- Homepage
- Services listing
- Service detail
- Solutions
- Projects
- Article/blog listing
- Article detail
- About/company-related pages
- important conversion/contact sections

Do not inspect ten nearly identical files if shared architecture already explains them.

Determine:

- what is shared,
- what should remain shared,
- what should become separate page archetypes,
- which components are currently causing visual repetition,
- which CSS/layout decisions are producing excessive whitespace,
- where raw/default-looking controls remain,
- where visual hierarchy is missing.

---

# 3. IDENTIFY WHY THE CURRENT DESIGN FAILED

Document the major problems before redesigning.

Pay particular attention to:

- enormous unused whitespace,
- pages stretching unnecessarily across ultrawide screens,
- weak typography hierarchy,
- excessive use of borders,
- generic bordered rectangles everywhere,
- raw/native-looking forms,
- giant horizontal form fields,
- weak sidebar,
- weak top navigation,
- lack of icons,
- weak state communication,
- weak active navigation state,
- weak button hierarchy,
- content lists that do not look like professional CMS interfaces,
- editor screens that feel like ordinary HTML forms,
- poor visual grouping,
- repeated page composition regardless of task,
- missing contextual sidebars,
- missing command/action hierarchy,
- poor density,
- poor empty states,
- weak feedback,
- insufficient product personality,
- insufficient brand integration,
- RTL inconsistencies,
- components that technically work but do not visually communicate purpose.

Do not preserve a flawed pattern merely because it already exists.

---

# 4. UPDATE `design.md` BEFORE LARGE-SCALE IMPLEMENTATION

The current `design.md` is not strict enough if the existing UI was considered compliant with it.

Rewrite/enhance it so future AI coding sessions cannot interpret it loosely.

`design.md` must become an IMPLEMENTABLE design specification, not a collection of vague adjectives.

It must define the following.

## Design philosophy

Define principles such as:

- calm,
- premium,
- restrained,
- precise,
- structured,
- readable,
- high-information but not cluttered,
- content-first,
- excellent RTL behavior.

Explain what "premium" means technically.

Do not use vague directions such as:
"make it modern"
or
"make it beautiful".

---

# 5. TWO RELATED BUT DISTINCT DESIGN SYSTEMS

The project contains two experiences:

## A. Public website

Marketing / SEO / conversion focused.

It should feel:

- branded,
- visually memorable,
- polished,
- premium,
- trustworthy,
- more expressive,
- visually richer,
- suitable for a Jeddah shading/construction-related brand.

## B. CMS / Admin

Productivity focused.

It should feel:

- calm,
- clean,
- highly usable,
- dense enough,
- professional,
- understated,
- fast,
- extremely clear.

The dashboard must NOT look like the marketing website.

The two systems should share:

- core brand colors,
- typography philosophy,
- certain tokens,
- brand identity.

But they should have different layout behavior and component composition.

Document this distinction explicitly in `design.md`.

---

# 6. DESIGN TOKENS

Define exact tokens rather than arbitrary values throughout components.

Document:

- canvas colors
- surface colors
- elevated surfaces
- subtle backgrounds
- text primary
- text secondary
- text muted
- borders
- subtle borders
- primary brand
- primary hover
- primary subtle background
- success
- warning
- danger
- info

Avoid using brand green everywhere.

Use strong colors primarily for:

- meaningful actions,
- status,
- active navigation,
- selected elements,
- highlights.

Most of the UI should be neutral.

Also define:

- spacing scale
- typography scale
- container widths
- sidebar width
- topbar height
- editor content width
- form widths
- border radius system
- shadows
- icon sizing
- button heights
- input heights
- table row height
- card padding
- section spacing.

Prevent random one-off spacing values.

---

# 7. TYPOGRAPHY

Create a deliberate Arabic-first typography system.

Define styles for:

- display
- page title
- section title
- card title
- body
- secondary body
- labels
- metadata
- captions
- table content
- navigation
- button text

Arabic typography must feel intentional.

Avoid making everything bold.

Use weight and size intentionally.

Improve line-height for Arabic readability.

Ensure English fragments such as:

`SEO`
`URL`
`slug`
`Admin`

integrate correctly inside RTL interfaces.

Use logical CSS properties where possible.

---

# 8. DASHBOARD INFORMATION ARCHITECTURE

Redesign the dashboard shell.

The dashboard should include a professional:

- sidebar,
- topbar,
- page header,
- breadcrumbs where useful,
- global/page actions,
- navigation hierarchy,
- account/admin menu,
- responsive navigation behavior.

The sidebar must not just be a vertical collection of text.

Use:

- appropriate icons,
- clearly grouped navigation,
- subtle active states,
- section labels,
- excellent spacing,
- predictable hierarchy.

Potential groups could include:

Content:

- Services
- Solutions
- Materials
- Projects
- Articles
- FAQs
- Pages

Assets:

- Media

SEO:

- Redirects
- relevant SEO tools

System:

- Settings

Do not overdecorate.

---

# 9. DIFFERENT DASHBOARD PAGE ARCHETYPES

This is critical.

DO NOT use one generic page composition for every screen.

Create intentional archetypes.

## Dashboard Overview

Should contain useful operational information.

Examples:

- published content
- drafts
- recent activity
- content requiring attention
- quick actions
- recently edited records
- media usage
- SEO/redirect warnings if meaningful

Do not fill it with meaningless statistics merely to occupy space.

---

## Collection / Listing Pages

Examples:

- Services
- Solutions
- Materials
- Projects
- Articles
- FAQs
- Pages

Use a high-quality data management layout.

Consider:

- compact page header
- create action
- search
- filtering
- status filters
- sorting
- table/list
- status badges
- updated date
- contextual row actions
- pagination

Rows should be easy to scan.

Avoid huge cards for individual records.

Avoid giant unused horizontal spaces.

---

## Editor Pages

Examples:

- Service editor
- Solution editor
- Article editor
- Project editor

These should NOT look like giant forms spread across the whole viewport.

Use a structured editor architecture.

Potential desktop pattern:

MAIN COLUMN

- core content
- title
- slug
- description
- body
- structured content
- images/content blocks

CONTEXT SIDEBAR

- publish status
- visibility
- dates
- taxonomy
- featured media
- SEO summary
- contextual metadata

Use sticky contextual areas where appropriate.

Primary actions should remain easy to reach:

- Save Draft
- Preview
- Publish / Update

Destructive actions must be visually separated.

---

## Media Manager

Treat Media as an asset-management experience.

Potential features/patterns:

- grid/list switch if useful
- thumbnails
- filename
- size/type metadata
- search
- upload action
- selection state
- asset details panel
- pagination
- empty state

Do not make Media look like Services.

---

## Redirect Manager

Treat redirects like a technical tool.

Use a compact data table:

Source
Destination
Type
Status
Updated
Actions

Provide helpful validation and technical feedback.

---

## Settings

Use category navigation / tabs / sections.

Do not display settings as one enormous form.

Group related configuration logically.

---

# 10. FORM DESIGN

Create a proper form system.

Every form field should support:

- label
- optional description
- input
- validation
- error
- disabled state
- optional indicator
- required indicator where useful.

Create consistent components for:

- text input
- textarea
- slug input
- select
- multiselect
- checkbox
- radio
- switch
- file/image picker
- date fields
- rich text fields
- URL fields
- SEO fields

Do NOT use arbitrary full-width fields simply because space is available.

For example:

A slug does not need to occupy a 1400px input.

Use intentional max widths.

---

# 11. BUTTON HIERARCHY

Define:

Primary
Secondary
Ghost
Outline
Destructive
Icon-only

Examples:

Publish = primary

Save draft = secondary

Preview = outline/secondary

Archive/Delete = destructive or contextual

Minor row actions = ghost/icon

Do not render five equally prominent rectangular buttons beside each other.

---

# 12. TABLE SYSTEM

Define a reusable professional table pattern.

Include:

- headers
- row hover
- selected state
- status badge
- metadata
- actions menu
- pagination
- search
- filters
- mobile behavior
- empty state
- loading skeleton.

Tables should look refined and lightweight.

Avoid unnecessary grid borders.

---

# 13. SURFACES AND BORDERS

The current implementation relies too heavily on bordered rectangles.

Fix this.

Do not place every section inside a visible 1px box.

Use hierarchy created through:

- spacing,
- background contrast,
- typography,
- alignment,
- grouping,
- subtle separators.

Reserve cards for things that semantically deserve cards.

Use borders intentionally.

---

# 14. WIDTH AND DENSITY

The current application wastes enormous amounts of screen space.

Introduce explicit layout constraints.

Dashboard content should have intentional max-width behavior.

Different screens can use different content widths.

For example:

Overview:
wide grid

Table:
wide

Editor:
controlled central workspace

Settings:
medium width

Long-form content:
readable measure

Do NOT blindly set everything to `width: 100%`.

Support ultrawide displays gracefully.

---

# 15. EMPTY STATES

Replace empty bordered boxes with designed empty states.

A good empty state may include:

- icon
- concise title
- one-sentence explanation
- primary next action
- optional secondary documentation/help

Examples:

"No solutions yet"

should not just be text in a giant rectangle.

Give the user an obvious next action.

---

# 16. ICONOGRAPHY

Use a coherent icon library such as Lucide if already available/appropriate.

Use icons for meaning, not decoration.

Examples:

- Dashboard
- Services
- Solutions
- Materials
- Projects
- Articles
- FAQs
- Pages
- Media
- Redirects
- Settings
- Search
- Filter
- Publish
- Preview
- Archive
- More actions

Keep icon sizes consistent.

---

# 17. MICROINTERACTIONS

Use subtle interaction feedback.

Examples:

- button transitions
- navigation hover
- table hover
- focus rings
- selected rows
- dropdown transitions
- expandable content
- skeleton loading
- toast feedback
- saving states.

Avoid excessive animation.

Interaction should feel instant and controlled.

---

# 18. ACCESSIBILITY

Maintain:

- sufficient contrast
- keyboard navigation
- visible focus states
- semantic markup
- accessible buttons
- proper labels
- meaningful icons
- touch-friendly interactive targets.

Do not sacrifice usability for aesthetics.

---

# 19. RESPONSIVE DASHBOARD

Desktop-first does NOT mean desktop-only.

Define responsive behavior.

For example:

Large desktop:
full sidebar + wide workspace

Laptop:
slightly reduced gutters/sidebar

Tablet:
collapsible sidebar

Mobile:
drawer navigation
stacked actions
adapted tables/cards
editor sidebar moves below main content

Do not simply shrink the desktop UI.

---

# 20. PUBLIC WEBSITE REDESIGN

The public website should receive the same level of design discipline.

Do NOT make every public page:

Hero
Cards
Cards
CTA
Footer

with slightly different text.

Create specific templates based on content purpose.

---

# 21. PUBLIC HOMEPAGE

The homepage needs strong brand presence.

Create deliberate hierarchy:

- premium hero
- clear value proposition
- primary CTA
- trust/supporting proof
- services
- solutions/use cases
- selected projects
- reasons to choose the company
- process
- service areas if relevant
- selected content
- conversion section
- footer.

Sections should visually vary while remaining cohesive.

Avoid endless identical card grids.

---

# 22. SERVICE PAGES

Service detail pages should be designed around conversion and search intent.

Potential structure:

- focused hero
- service summary
- visual proof
- benefits
- process
- related solutions/materials
- project examples
- FAQs
- local relevance
- final CTA.

Do not use the article template for service pages.

---

# 23. PROJECT PAGES

Project pages should be visually driven.

Use:

- strong project imagery
- project overview
- scope
- materials
- challenge/solution
- gallery
- outcome
- related services
- next CTA.

---

# 24. ARTICLE PAGES

Prioritize reading.

Use:

- readable content width
- excellent typography
- metadata
- table of contents if useful
- featured image
- meaningful heading spacing
- related articles
- subtle CTA.

Do not stretch article paragraphs across the viewport.

---

# 25. LISTING / ARCHIVE PAGES

Services, articles, projects etc. should not all share one grid blindly.

Choose the presentation according to content.

Projects may benefit from stronger imagery.

Articles need editorial metadata.

Services need fast scanning and conversion clarity.

---

# 26. BRAND EXPRESSION

The public site must feel specific to Jeddah Shading rather than a generic shadcn template.

Use the established brand direction from `design.md`.

Brand expression can come from:

- typography
- photography
- composition
- section rhythm
- restrained brand color
- subtle geometric motifs
- material/architectural inspiration

Avoid obvious template aesthetics.

Avoid gradients everywhere.

Avoid decorative effects without purpose.

---

# 27. RTL QUALITY

Arabic/RTL must be first-class.

Do not simply apply:

`direction: rtl`

and consider the task complete.

Check:

- sidebar alignment
- icons
- breadcrumb direction
- mixed English/Arabic strings
- arrows
- pagination
- dropdown alignment
- forms
- editor toolbars
- tables
- number alignment
- URLs
- slugs
- technical metadata.

URLs/slugs/code-like values can remain LTR where appropriate.

---

# 28. COMPONENT ARCHITECTURE

Do not style each page independently.

Create/refactor shared primitives.

Potential component layers:

PRIMITIVES

- Button
- Badge
- Input
- Textarea
- Select
- Tooltip
- Dropdown
- Dialog
- Sheet
- Tabs

DASHBOARD

- DashboardShell
- Sidebar
- Topbar
- PageHeader
- Breadcrumbs
- DataTable
- FilterBar
- EmptyState
- StatCard
- StatusBadge
- EditorLayout
- EditorSidebar
- PublishPanel
- FormSection
- MediaPicker

PUBLIC

- Container
- Section
- SectionHeader
- CTA
- ServiceCard
- ProjectCard
- ArticleCard
- Hero primitives

Avoid premature abstraction.

Only abstract patterns that are genuinely shared.

---

# 29. CREATE PAGE ARCHETYPES BEFORE REDESIGNING EVERYTHING

Before touching every route, establish reference implementations.

Dashboard reference screens:

1. Dashboard Overview
2. Services Collection
3. Service Editor

Public reference screens:

4. Homepage
5. Service Detail
6. Article Detail

These six screens should establish the design vocabulary.

Do NOT blindly redesign all routes before these look excellent.

Once these are approved internally against `design.md`, propagate the patterns to related routes.

---

# 30. REQUIRED IMPLEMENTATION PLAN

After updating `design.md`, create a concise implementation plan.

Use phases approximately like:

Phase 1
Design system + tokens + typography + globals

Phase 2
Dashboard shell/navigation

Phase 3
Dashboard reference screens

Phase 4
Remaining dashboard collections

Phase 5
Remaining dashboard editors/tools

Phase 6
Public shell/components

Phase 7
Public reference pages

Phase 8
Remaining public pages

Phase 9
Responsive + RTL + accessibility refinement

Phase 10
Final visual consistency pass

Do not execute unrelated backend refactors.

---

# 31. VISUAL ACCEPTANCE CRITERIA

A screen is NOT finished merely because:

- it compiles,
- spacing changed,
- shadcn components were added,
- colors match `design.md`.

Before considering each archetype complete, verify:

- Does the screen have clear hierarchy?
- Is the primary action obvious?
- Can the content be scanned quickly?
- Is whitespace intentional?
- Does it work on a wide monitor?
- Does it remain usable on laptop/tablet/mobile?
- Does RTL feel native?
- Are controls visually consistent?
- Are inputs appropriately sized?
- Are states clear?
- Does it feel like a professional product?
- Is unnecessary UI removed?
- Is visual density appropriate for the task?
- Does the page have its own purpose-specific composition?
- Does it remain consistent with the broader system?

---

# 32. ANTI-PATTERNS — DO NOT DO THESE

Do NOT:

- wrap every section in a bordered card,
- use giant blank areas,
- make every input full viewport width,
- put every action inside equally prominent buttons,
- use green everywhere,
- add huge shadows,
- add glassmorphism,
- add random gradients,
- add decorative blobs,
- add excessive rounded corners,
- add icons merely to make something look designed,
- repeat the exact same layout across all content types,
- create unnecessary dashboard charts,
- use fake metrics,
- invent business data,
- redesign functionality that already works,
- sacrifice Arabic readability for visual novelty.

---

# 33. PRESERVE FUNCTIONALITY

While redesigning:

Preserve existing:

- forms
- validation
- draft/published state
- publishing behavior
- slugs
- SEO fields
- redirects
- media relationships
- API behavior
- authentication
- database schemas
- dynamic routing
- public content URLs.

Refactor presentation architecture where necessary without unnecessarily changing domain logic.

---

# 34. WORKFLOW

Follow this order:

1. Read `design.md`.
2. Activate/use Impeccable guidance.
3. Inspect global styles and layouts.
4. Inspect representative pages.
5. Audit current design problems.
6. Rewrite/enhance `design.md`.
7. Produce the implementation plan.
8. Create/refactor shared design primitives.
9. Implement Dashboard Overview.
10. Implement Services Collection.
11. Implement Service Editor.
12. Review those three together.
13. Implement public Homepage.
14. Implement Service Detail.
15. Implement Article Detail.
16. Review those three together.
17. Propagate established patterns.
18. Perform responsive/RTL/accessibility review.
19. Perform final cross-route consistency review.

Do not skip directly to step 17.

---

# 35. IMPORTANT EXECUTION RULE

When implementing a screen:

Do not ask:

"What components already exist that I can put here?"

Ask:

"What information and actions does this user need on this screen?"

Then compose the interface using the design system.

Function determines layout.

Do not force content into existing generic card/form layouts.

---

# 36. FINAL EXPECTATION

At completion the website should feel like TWO polished products belonging to ONE brand:

PUBLIC WEBSITE:
premium, expressive, trustworthy, conversion-focused.

CMS:
calm, precise, efficient, professional, information-focused.

A person opening the CMS should immediately recognize it as a serious modern content-management product.

A visitor opening the public site should immediately recognize a professionally designed commercial brand.

Both must feel intentionally designed.

Start with the audit and `design.md` rewrite.

Do not begin mass page implementation until the new design specification and implementation plan are internally coherent.
