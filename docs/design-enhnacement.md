
# JEDDAH SHADING CMS — FINAL HIGH-FIDELITY DASHBOARD REDESIGN

## STATUS

The previous dashboard design direction is REJECTED.

A new visual direction has now been selected and approved from the provided reference images.

We are no longer exploring styles.

The objective of this session is to rebuild the CMS UI so it closely follows the QUALITY, DENSITY, COMPOSITION, SPACING, SURFACE TREATMENT, and POLISH of the approved references, while remaining original and specifically designed for the Jeddah Shading CMS.

This is NOT another incremental CSS cleanup.

This is a deliberate dashboard presentation-layer redesign.

Preserve the application's functionality and domain logic.

---

# 1. APPROVED VISUAL DIRECTION

The approved visual direction is based on the latest dashboard references provided in this conversation.

The desired dashboard should feel like a polished modern SaaS application with:

- light neutral application canvas
- clean white content surfaces
- subtle gray separation
- controlled use of brand green
- compact but comfortable density
- soft, refined cards
- clear information grouping
- professional data tables
- rich media management
- polished editor screens
- useful dashboard overview
- strong visual hierarchy
- deliberate typography
- thoughtful empty states
- refined controls
- restrained shadows
- consistent icons
- excellent Arabic RTL support

The overall impression should be:

PREMIUM
POLISHED
MODERN
PRODUCT-LIKE
CLEAR
CALM
USEFUL
HIGH-END

It should look like a real SaaS product, not a developer admin panel.

---

# 2. IMPORTANT REFERENCE PRINCIPLE

Use the supplied dashboard screenshots as VISUAL REFERENCES.

Study them for:

- page composition
- information density
- sidebar proportions
- card treatment
- toolbar structure
- table design
- spacing
- header composition
- typography hierarchy
- icon treatment
- action hierarchy
- image/media treatment
- border radius
- shadow strength
- neutral colors
- status badges
- navigation
- visual grouping

Do NOT copy any reference literally.

Do NOT reproduce another product's branding.

Do NOT reproduce unrelated features.

Adapt the visual language to Jeddah Shading CMS.

---

# 3. THIS CMS IS NOT A PROJECT-MANAGEMENT DASHBOARD

Some visual references contain:

- analytics charts
- tasks
- team avatars
- calendars
- project progress
- revenue
- collaboration widgets

Those are VISUAL inspiration only.

DO NOT invent those features.

Our CMS manages:

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

The interface must be designed around CONTENT MANAGEMENT.

Use real CMS information.

Never add meaningless widgets merely because a reference has them.

---

# 4. PRESERVE FUNCTIONALITY

Preserve all existing:

- APIs
- database models
- validation
- authentication
- publishing
- draft state
- archive behavior
- slugs
- relationships
- SEO data
- routes
- content URLs
- redirects
- media relationships
- form behavior
- preview behavior

You may aggressively refactor:

- JSX structure
- UI components
- layout components
- dashboard shell
- design system
- CSS
- Tailwind composition
- visual hierarchy
- interaction patterns

Presentation may be replaced.

Business logic must remain stable.

---

# 5. USE IMPECCABLE

Use the installed Impeccable design skill throughout this redesign.

Do not treat the skill as optional guidance.

Use it when:

- defining hierarchy
- building layout
- adjusting spacing
- evaluating typography
- reviewing responsiveness
- refining interaction states
- inspecting final screens

---

# 6. READ ONLY WHAT IS REQUIRED

Do not waste tokens crawling the entire repository.

Start with:

- `design.md`
- dashboard root layout
- sidebar
- topbar/header
- global CSS/theme
- shared UI primitives
- dashboard overview
- Services collection
- Service editor
- Media page
- one existing list component
- one editor component
- publishing logic/components

Then inspect related files only when implementation requires them.

---

# 7. UPDATE design.md FIRST

Before mass implementation, rewrite the dashboard section of `design.md`.

The new `design.md` must be strict enough that future sessions can reproduce this visual system.

Do not write vague instructions.

Bad:

"Use modern cards."

Good:

"Dashboard cards use neutral white surfaces, 1px subtle borders or soft elevation, 10–14px radius, 20–24px internal padding and no heavy shadows."

Bad:

"Use good spacing."

Good:

"Primary dashboard section gaps are generally 20–24px. Card grids use approximately 16–20px gaps. Page heading to first major section is approximately 24–32px."

---

# 8. GLOBAL VISUAL LANGUAGE

## Application canvas

Use a very light neutral background.

Examples conceptually:

#F6F7F6
#F7F8F7
#F5F7F6

Avoid yellow/beige canvas.

The previous cream/beige appearance is rejected.

The interface should feel cleaner and cooler.

---

# 9. MAIN SURFACES

Primary content cards should generally use:

white / near-white surfaces.

Create subtle contrast between:

- application canvas
- content card
- input surface
- sidebar
- topbar
- hover state

Avoid everything having exactly the same background.

---

# 10. BRAND GREEN

Jeddah Shading green becomes the primary product accent.

Use a deep sophisticated green.

Conceptually:

Primary:
#0F5B3B
or approximately the existing brand green if already defined.

Hover:
slightly darker.

Soft green:
very light green tint.

Use green for:

- primary CTA
- selected navigation
- positive status
- focus accents
- active control
- progress where appropriate

Do NOT cover large parts of the dashboard with green.

---

# 11. SUPPORTING COLORS

Use subtle semantic colors.

Published:
soft green

Draft:
neutral gray / cool blue-gray

Warning:
amber

Error:
soft red

Info:
soft blue

Use lightly tinted backgrounds.

Do not use aggressively saturated badges.

---

# 12. BORDER RADIUS

The approved references use softer geometry than the previous design.

Use approximately:

Inputs:
8–10px

Buttons:
8–10px

Small cards:
10–12px

Major cards:
12–16px

Image cards:
10–12px

Modal:
14–18px

Do not use extreme pill shapes for everything.

Pills are appropriate for:

- statuses
- filters
- counters
- tabs

---

# 13. SHADOWS

Use soft, almost invisible elevation.

Example philosophy:

shadow-sm
with very low opacity.

Cards should NOT visibly float like marketing cards.

Use stronger shadows only for:

- popovers
- dropdowns
- dialogs
- drawers

---

# 14. BORDERS

Use light neutral borders.

Avoid harsh outlines.

Cards can use:

subtle border + minimal shadow

or

soft shadow with nearly invisible border.

Tables should use row separators rather than heavy grid borders.

---

# 15. TYPOGRAPHY

Arabic typography must be excellent.

Use the project's established Arabic font if appropriate.

If the current font is poor, use a professional Arabic UI font already permitted by the project.

Typography hierarchy:

Dashboard page title:
28–32px
700

Section title:
18–20px
600–700

Card title:
15–17px
600

Body:
14–15px
400–500

Navigation:
13–15px
500

Metadata:
12–13px

Labels:
13–14px
500–600

Large KPI value:
28–34px
600–700

Do not make every text element bold.

Use text color hierarchy:

primary
secondary
muted
disabled

---

# 16. MAIN DASHBOARD SHELL

The shell should resemble the approved references.

For RTL desktop:

┌───────────────────────────────────────────┬───────────────┐
│                 TOP BAR                   │   SIDEBAR     │
├───────────────────────────────────────────┤               │
│                                           │               │
│             MAIN WORKSPACE                │               │
│                                           │               │
│                                           │               │
└───────────────────────────────────────────┴───────────────┘

Sidebar remains RIGHT.

---

# 17. SIDEBAR

Target width:

220–245px desktop.

The sidebar should feel lightweight and elegant.

Structure:

Brand

Overview

CONTENT
Services
Solutions
Materials
Projects
Articles
FAQs
Pages

ASSETS
Media

SEO / APPEARANCE
Redirects

SYSTEM
Settings

Bottom area:
Admin user/account.

Navigation rows:

height:
40–44px

icon:
16–18px

radius:
8–10px

active state:
very subtle light green background
dark green text/icon

Hover:
soft neutral/green-tinted surface.

Avoid large empty vertical gaps.

---

# 18. BRAND AREA

Top of sidebar:

small logo/icon
Jeddah Shading
secondary line:
نظام إدارة المحتوى

Do not create a giant logo header.

Keep it approximately 56–70px high.

---

# 19. TOPBAR

Height:

56–64px.

The topbar should feel useful and polished.

Possible composition:

LEFT side in RTL layout:

Admin avatar
Admin
account dropdown

"عرض الموقع"

Search / command bar

notifications only if functionality exists

RIGHT/context side:

breadcrumb
current page context

Example:

لوحة التحكم / الخدمات

Search:

"ابحث في المحتوى..."

Optional shortcut indicator:

⌘ K / Ctrl K

Do not implement command palette unless useful.

But visually structure search like a real application search.

---

# 20. GLOBAL PAGE LAYOUT

Main page padding approximately:

24–32px desktop.

At very large widths:

do not let content stretch without control.

Use max-width where appropriate.

Collections:
wide.

Overview:
grid-based.

Editors:
controlled width.

Media:
wide grid.

---

# 21. DASHBOARD OVERVIEW — COMPLETE REBUILD

The overview must resemble the high-quality references.

It should look visually rich and useful without fake data.

Header area:

مرحباً بك مجدداً، Admin

small description:
إليك نظرة سريعة على محتوى الموقع وحالة النشر.

Optionally show current date subtly.

---

# 22. KPI CARDS

Create a row/grid of compact KPI cards.

Real metrics only.

Examples:

الخدمات
12

المشاريع
5

المقالات
8

الوسائط
42

Cards should include:

small colored icon container
label
large value
small secondary status if real

Examples:

+2 هذا الشهر

or

3 مسودات

Only if backed by actual application data.

Do NOT display:

"-"

inside cards.

If metric unavailable, omit the card or show actual zero.

---

# 23. KPI CARD VISUAL STYLE

Approximate:

height:
110–130px

padding:
18–22px

radius:
12–14px

icon background:
subtle tinted color

value:
28–32px

No dramatic shadow.

Use different subtle icon accent colors where useful:

green
blue
purple
amber

Do not turn the entire interface multicolor.

---

# 24. MAIN OVERVIEW CONTENT

Below KPIs create a purposeful grid.

Suggested desktop:

┌─────────────────────────────┬─────────────────────────┐
│       Recent Content        │    Needs Attention      │
│                             │                         │
│                             │                         │
├─────────────────────────────┼─────────────────────────┤
│                             │    Quick Actions        │
│       Activity / Stats      │                         │
│                             │                         │
└─────────────────────────────┴─────────────────────────┘

Exact composition may differ.

---

# 25. RECENT CONTENT

Display recent content using compact rows.

Examples:

thumbnail
content title
content type
status
updated time
•••

Example:

[img] مظلات سيارات
      خدمة
      منذ ساعتين           منشور

[img] مشروع مظلات فيلا
      مشروع
      منذ 5 ساعات          مسودة

Do not create giant cards.

---

# 26. NEEDS ATTENTION

This card should surface useful CMS issues.

Examples if real:

3 خدمات بدون صورة رئيسية

2 مقالات في حالة مسودة منذ أكثر من 7 أيام

صفحة واحدة بدون وصف SEO

روابط إعادة توجيه تحتاج مراجعة

Use small warning icon and compact rows.

If no issues exist:

"كل شيء يبدو جيداً"

with subtle positive state.

---

# 27. QUICK ACTIONS

Compact action grid/buttons:

+ خدمة جديدة
+ مشروع جديد
+ مقال جديد

رفع وسائط

Potentially:

مراجعة الصفحات

Keep them visually polished.

Do not make them giant.

---

# 28. ACTIVITY CARD

If actual useful publication/activity data exists, show a subtle activity chart.

Example:

نشاط النشر

Published vs Draft over recent days/weeks.

But DO NOT invent values.

If no real meaningful data exists, replace chart with:

recent edits
recent publishing activity
recent content.

Functionality matters more than decorative analytics.

---

# 29. SERVICES COLLECTION PAGE

This page should look VERY close in quality to the approved references.

Header:

الخدمات

إدارة خدمات الموقع المعروضة في الموقع وحالة نشرها.

Primary button:

+ خدمة جديدة

---

# 30. SERVICES STATUS TABS

Add compact status summary tabs if data supports them:

الكل 12

منشور 7

مسودة 5

Archived if relevant.

Use subtle pills/tabs.

This immediately improves scanning.

---

# 31. COLLECTION TOOLBAR

Single cohesive toolbar.

Search field:

البحث في الخدمات...

Filters:

الحالة

التصنيف if relevant

Sort:

الأحدث

Optional filter button.

Example:

[ Search................................ ] [الحالة ▾] [التصنيف ▾] [الأحدث ▾]

Do NOT use giant "Apply" button unless necessary.

Prefer immediate filtering.

---

# 32. SERVICES TABLE

Use a proper white table card.

Columns appropriate to current schema:

checkbox

الخدمة

الحالة

التصنيف if available

آخر تحديث

optional useful metric only if real

actions

Service cell:

small thumbnail
title
slug

Example:

[img] مظلات سيارات
      /car-shades

Title strong.

Slug muted and LTR.

---

# 33. TABLE VISUAL STYLE

Header background:

very subtle gray.

Rows:

52–64px.

Hover:

soft neutral/green tint.

Borders:

subtle row separators.

Selected row:

subtle selected surface.

Status:

small rounded badge.

Actions:

•••

Pagination:

integrated into table footer.

Do not make each record a card.

---

# 34. SERVICE EDITOR

The editor needs to feel like a premium authoring application.

Recommended structure:

Topbar

Page header

Actions

Editor workspace

Inspector

---

# 35. EDITOR HEADER

Breadcrumb:

الخدمات / مظلات سيارات / تحرير

Title:

تحرير الخدمة

Description:
تعديل بيانات الخدمة والمحتوى المعروض في الموقع.

Actions:

معاينة

حفظ المسودة

نشر

•••

Publish:
green primary button.

Save:
neutral.

Preview:
outline/ghost.

---

# 36. EDITOR WORKSPACE

Desktop:

MAIN CONTENT
approx 700–900px

INSPECTOR / CONTEXT
approx 280–340px

Gap:
20–24px

In RTL the inspector may be positioned appropriately according to chosen composition.

Use the approved screenshot as the visual reference.

---

# 37. MAIN EDITOR CONTENT

Use visually refined sections.

Example:

المعلومات الأساسية

عنوان الخدمة

الرابط المختصر

الوصف المختصر

Then:

محتوى الخدمة

rich editor

Relationships if necessary.

Do not put every section inside a giant independent card.

Use one or two logical major surfaces.

---

# 38. TITLE INPUT

The title should feel important.

Consider a stronger title field.

Do not make it look identical to a minor URL field.

---

# 39. SLUG FIELD

Display:

https://jeddahshading.com/services/
[ car-shades ]

Use LTR internally.

Allow generate/format action if existing functionality supports it.

---

# 40. DESCRIPTION

Use comfortable textarea.

Show character counter if already supported.

Example:

78 / 160

---

# 41. RICH TEXT EDITOR

Create a polished editor.

Toolbar:

Heading
Bold
Italic
Underline if supported
Lists
Quote
Link
Image if supported

Visual style should resemble an actual publishing editor.

Editor canvas:

white
clean
readable
comfortable line height
min height but not excessive.

---

# 42. EDITOR INSPECTOR

Use compact cards / accordion panels.

Primary panel:

حالة النشر

Status:
مسودة

آخر حفظ

Visibility

Publish action

Then:

الصورة الرئيسية

SEO

العلاقات

إعدادات إضافية

Secondary groups should be collapsible.

Use progressive disclosure.

---

# 43. PUBLISHING PANEL

This should be one of the most polished areas.

Display:

حالة النشر
مسودة

آخر حفظ
9 سبتمبر 2026، 12:18 ص

الظهور
عام

Then primary action:

نشر الآن

or the top header button can remain primary.

Avoid duplicated huge buttons.

---

# 44. FEATURED IMAGE

When selected:

show actual image preview.

Controls:

تغيير الصورة

إزالة

When empty:

use an elegant image upload/select area.

Do not render plain bordered boxes with "لم تحدد صورة".

---

# 45. MEDIA LIBRARY

Use the approved reference style.

Header:

مكتبة الوسائط

description:
إدارة جميع الصور والملفات المستخدمة في الموقع.

Primary:

رفع ملفات

---

# 46. MEDIA FILTERS

Top controls:

Search

Type:

الكل
صور
فيديو
مستندات

Sort:

الأحدث

View toggle:

grid
list

Optional filter panel.

---

# 47. MEDIA GRID

Cards should contain:

large image preview

filename

size

date

•••

Example:

car-shade-01.jpg
2.4 MB
9 سبتمبر 2026

4 columns on large desktop if appropriate.

3 at laptop.

2 tablet.

1–2 mobile.

---

# 48. MEDIA CARD STYLE

White surface.

Image dominates.

Radius:
10–12px.

Thumbnail should use consistent aspect ratio.

Metadata compact.

Hover reveals stronger action affordance.

No heavy shadow.

---

# 49. MEDIA FILTER SIDEBAR / PANEL

If useful, use compact filtering area:

Type

Upload source

Date

Reset filters

Do not make filters visually dominant.

---

# 50. UPLOAD TILE

Inside media grid provide an optional upload tile:

icon

رفع ملفات جديدة

اسحب الملفات هنا

supported types

Make it visually elegant.

---

# 51. SOLUTIONS / MATERIALS / PROJECTS / ARTICLES

After the approved archetypes are established, use the SAME COLLECTION SYSTEM.

Do not invent new visual languages.

Collections should share:

- page header
- tabs
- toolbar
- table
- badges
- pagination
- empty states

But fields should adapt.

---

# 52. PROJECTS

Projects may benefit from:

thumbnail
title
status
services
updated date

Potentially use grid mode later if useful.

---

# 53. ARTICLES

Articles table:

featured image
title
status
author if applicable
published/updated date
SEO state only if real

---

# 54. FAQ

Compact collection.

Question
status
category if existing
updated.

No giant cards.

---

# 55. PAGES

Use collection table:

Page
slug
status
updated

Static pages should clearly indicate their role.

---

# 56. REDIRECTS

Use a more technical table.

Source

Destination

Type

Status

Created / Updated

Actions

This should feel closer to a developer utility.

---

# 57. SETTINGS

Settings should use:

page navigation / tabs / grouped sections.

Example:

General

Contact

SEO

Social

Site configuration

Do not create one 2000px form.

---

# 58. EMPTY STATES

Use attractive but restrained empty states.

Example:

icon

لا توجد حلول بعد

ابدأ بإضافة أول حل ليظهر في الموقع.

+ إنشاء حل

Do not use giant empty bordered containers.

---

# 59. LOADING STATES

Add polished skeletons where appropriate.

Examples:

table rows

cards

media thumbnails

editor panels

Avoid disruptive layout jumps.

---

# 60. TOASTS AND FEEDBACK

Actions should provide feedback.

Examples:

تم حفظ المسودة

تم نشر الخدمة

تم رفع الصورة

حدث خطأ أثناء الحفظ

Use existing toast infrastructure if available.

Do not introduce a second toast library unnecessarily.

---

# 61. DROPDOWNS

Use refined dropdown menus for contextual actions.

Examples:

Edit

Preview

Duplicate

Archive

Delete if allowed

Use separator before destructive operations.

---

# 62. RESPONSIVE DESIGN

Large desktop:

full sidebar
4 KPI cards
two-column dashboard
editor + inspector
4-column media

Laptop:

sidebar remains
reduced gutters
2–4 KPI depending width
editor + narrower inspector
3-column media

Tablet:

sidebar collapses/drawer
2 KPI per row
stack dashboard cards
inspector becomes drawer/below
2-column media

Mobile:

single column
navigation drawer
compact topbar
KPI 1–2 per row
table becomes adaptive
editor single column
media grid 1–2 columns

Do not merely scale desktop down.

---

# 63. RTL DETAILS

This is Arabic-first.

Verify:

sidebar right placement

breadcrumbs

chevrons

dropdowns

pagination

table order

input icons

search icon

mixed numbers

dates

English filenames

URLs

slugs

keyboard shortcut placement

Icons must not appear visually backwards.

Technical strings remain LTR where appropriate.

---

# 64. ICONS

Use one icon family only.

Lucide preferred if already installed.

Avoid mixing icon libraries.

Recommended icon size:

16–18px navigation

18–20px cards

20–24px KPI icon container

Keep stroke consistent.

---

# 65. CARD SYSTEM

Cards are now an APPROVED part of the visual direction.

But use them intentionally.

Good cards:

KPI
recent content
attention
quick actions
publishing
media
dashboard widgets

Do not turn every form field into a card.

---

# 66. CARD TREATMENT

Use a consistent card recipe:

background:
white

border:
subtle neutral

radius:
12–14px

shadow:
extremely subtle

padding:
16–24px depending content

Avoid random card styles.

---

# 67. VISUAL DENSITY

The approved references are visually rich because useful content occupies the screen.

Avoid giant dead areas.

At 1920px width the dashboard should feel intentionally filled.

But do not add filler.

Use:

real metrics

real records

recent content

useful actions

real status.

---

# 68. NO FAKE FEATURES

NEVER invent:

users
revenue
sales
customers
messages
notifications
analytics
traffic
conversion
team members
comments
performance percentages

unless these genuinely exist.

Visual richness must come from REAL CMS data.

---

# 69. NO AI-TEMPLATE LOOK

Avoid patterns strongly associated with generated dashboards:

four identical giant cards

giant empty chart

gradient blobs

random emoji

oversized radius

giant hero title

meaningless graphs

unnecessary glass effect

generic "Welcome back" filling half the screen

too many pastel colors

---

# 70. QUALITY DETAILS

Inspect:

alignment

baseline

spacing

icon placement

Arabic line height

hover states

focus states

scrollbars

sticky toolbar

sticky inspector if useful

overflow

long titles

empty values

broken images

loading

dropdown positioning

responsive table behavior

keyboard navigation

---

# 71. ACCESSIBILITY

Maintain:

visible focus

good contrast

semantic labels

keyboard access

minimum interactive sizes

accessible icons

screen-reader-friendly buttons

proper form associations

---

# 72. PERFORMANCE

Do not sacrifice performance for design.

Avoid unnecessary:

animation libraries

large dependencies

heavy runtime effects

excessive client components

Prefer CSS transitions.

Use existing architecture when suitable.

---

# 73. ANIMATION

Use very subtle animation only.

Approximately:

120–200ms transitions.

Examples:

hover

dropdown

drawer

button state

sidebar

Do not animate large sections unnecessarily.

---

# 74. FIRST IMPLEMENTATION PHASE

Do NOT immediately propagate this design across every screen.

First implement:

1. Dashboard shell
2. Dashboard Overview
3. Services Collection
4. Service Editor
5. Media Library

These FIVE screens define the system.

They must be visually excellent.

---

# 75. REQUIRED VISUAL CHECK

After implementing each screen:

OPEN THE REAL PAGE IN THE BROWSER.

Inspect at:

1920×1080
1440×900
1280×800

and one mobile width.

Do not judge from code.

---

# 76. SCREENSHOT REVIEW

Compare the rendered output visually against the APPROVED reference screenshots supplied by the user.

Compare:

composition

density

surface treatment

polish

spacing

card design

typography

toolbar design

table quality

media quality

editor ergonomics

navigation quality

---

# 77. REJECTION TEST

Ask yourself:

Does this still resemble the previous rejected beige CRUD dashboard?

If yes:

STOP.

Do not continue.

Rework the UI.

---

# 78. QUALITY TEST

Ask:

If this screenshot were placed among the user's approved dashboard references, would it visually belong there?

It does NOT need to be identical.

But the design quality must feel comparable.

If it looks obviously cheaper or more amateur:

continue refining.

---

# 79. UPDATE design.md AFTER VALIDATION

Once these five reference screens are visually coherent, finalize `design.md`.

Document:

colors

typography

spacing

cards

buttons

inputs

tables

sidebar

topbar

dashboard widgets

editor

media

badges

empty states

responsive

RTL

interaction states

anti-patterns

Future sessions must be able to reproduce the system.

---

# 80. DO NOT PROPAGATE YET

Do NOT redesign all remaining routes automatically.

After the five reference screens are finished:

STOP.

I will review:

Dashboard Overview
Services
Service Editor
Media Library
Dashboard Shell

before authorizing the design propagation.

---

# ABSOLUTE FINAL RULE

The visual references provided by the user are now the QUALITY BAR.

Do not respond to them by building another minimalist developer dashboard.

The target is the polished SaaS aesthetic shown in those references:

- rich but controlled
- clean
- soft
- organized
- visually balanced
- highly usable
- deliberately composed
- modern
- professional

Preserve Jeddah Shading identity.

Preserve Arabic RTL.

Preserve CMS functionality.

But rebuild the presentation until it genuinely looks like a professionally designed commercial SaaS CMS.

Start now with:

1. inspect current `design.md`
2. inspect the five relevant screens/components
3. update the design specification
4. implement the dashboard shell
5. implement Overview
6. implement Services
7. implement Service Editor
8. implement Media Library
9. render and visually inspect all screens
10. refine until they match the approved quality level
11. STOP for visual approval
