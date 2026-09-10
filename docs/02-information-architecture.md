# Information Architecture Reference

## 1. Purpose

This document defines the high-level information architecture of the public website and admin dashboard.

It defines:
- page groups,
- route responsibilities,
- content hierarchy,
- entity relationships from a navigation perspective,
- internal-linking expectations,
- dashboard navigation.

It does not define visual design.

---

## 2. Architecture Principles

1. Organize content by user intent.
2. Keep Services, Solutions, Materials, Projects, and Articles semantically distinct.
3. Use entity relationships instead of duplicated text.
4. Keep dynamic content independent from fixed page layouts.
5. Avoid multiple URLs for the same search intent.
6. Support contextual internal linking.
7. Keep the navigation understandable.
8. Avoid unnecessary top-level sections.
9. Allow content growth without changing the core architecture.

---

## 3. Canonical Public Structure

```text
Home
├── Services
│   └── Service Detail
├── Solutions
│   └── Solution Detail
├── Materials
│   └── Material Detail
├── Projects
│   └── Project Detail
├── Prices
├── Guides
│   └── Guide Detail
├── About
└── Contact
```

Canonical route groups:

```text
/
/services
/services/[slug]
/solutions
/solutions/[slug]
/materials
/materials/[slug]
/projects
/projects/[slug]
/prices
/guides
/guides/[slug]
/about
/contact
```

The internal `Article` entity always renders publicly under `/guides`.

Do not create `/articles`.

---

## 4. Home

Purpose:
- introduce the company,
- establish credibility,
- route visitors toward major commercial content,
- promote phone/WhatsApp contact.

Controlled content may include:
- hero,
- featured Services,
- featured Solutions,
- featured Projects,
- trust/benefit content,
- selected FAQs,
- final CTA.

Home is fixed-layout, not a page builder.

---

## 5. Services

Route:
```text
/services
/services/[slug]
```

Service pages may contain:
- title,
- summary,
- content,
- media,
- related Solutions,
- related Materials,
- related Projects,
- related Articles/Guides,
- FAQs,
- pricing guidance link,
- WhatsApp/phone CTA,
- SEO metadata.

A Service represents what the company performs.

---

## 6. Solutions

Route:
```text
/solutions
/solutions/[slug]
```

A Solution represents a customer need/use case.

A Solution page may explain:
- the problem/context,
- suitable Services,
- suitable Materials,
- relevant Projects,
- pricing factors,
- FAQs,
- related Guides,
- CTA.

---

## 7. Materials

Route:
```text
/materials
/materials/[slug]
```

A Material page may include:
- characteristics,
- advantages,
- limitations,
- suitable uses,
- maintenance notes,
- related Services,
- related Solutions,
- real Projects,
- related Guides,
- FAQs.

Only real company-supported materials should be published.

---

## 8. Projects

Route:
```text
/projects
/projects/[slug]
```

Projects are case studies, not image-only gallery entries.

A Project page may include:
- title,
- summary,
- city/district,
- completion information,
- related Services,
- related Solutions,
- related Materials,
- challenge,
- implemented solution,
- gallery,
- technical details,
- CTA.

Projects strengthen trust and internal linking.

---

## 9. Guides / Articles

Internal CMS entity:
```text
Article
```

Public route group:
```text
/guides
/guides/[slug]
```

Article use cases:
- buying guides,
- pricing guides,
- comparisons,
- maintenance,
- material education,
- commercial research.

Do not build separate systems for each article type.

---

## 10. Prices

Canonical route:
```text
/prices
```

`/prices` is a fixed-layout pricing hub.

Its role:
- explain pricing approach,
- explain major price factors,
- link to detailed pricing Guides,
- provide contact CTA.

Detailed price-focused content remains Article entities under:
```text
/guides/[slug]
```

Examples:
```text
/guides/car-shades-prices-jeddah
/guides/sawater-prices-jeddah
```

Do not create:
```text
/prices/[slug]
```
in V1.

---

## 11. FAQs

FAQs are reusable entities.

They may relate to:
- Service,
- Solution,
- Material,
- Article,
- Page.

FAQ records do not require a standalone public route in V1.

---

## 12. Static Pages

Initial fixed pages:
- Home,
- About,
- Contact,
- Prices.

Additional fixed pages require explicit product/legal need.

Static pages:
- have coded layouts,
- have known page-specific schemas,
- do not support arbitrary page composition.

---

## 13. Contact Architecture

Primary conversion channels:
- phone,
- WhatsApp.

Structured WhatsApp flows may appear on:
- Services,
- Solutions,
- Projects,
- Guides,
- Prices,
- Contact.

Visitor-entered data is used only to compose the WhatsApp message unless future scope explicitly adds persistence.

---

## 14. URL Principles

URLs must:
- be stable,
- be human-readable,
- use meaningful slugs,
- avoid unnecessary nesting,
- avoid keyword cannibalization,
- reflect entity type.

Slug rules:
- unique within route namespace,
- validated,
- editable in Draft,
- published slug changes must preserve the old URL through Redirect behavior.

---

## 15. Redirect Architecture

When a published slug changes:
```text
old public path
   ↓ 301
new public path
```

A Redirect entity stores the old mapping.

Redirects are technical SEO infrastructure, not editorial content.

Avoid redirect loops and duplicate source paths.

---

## 16. Internal Linking

Relationships should drive contextual links.

Examples:

```text
Service
→ related Materials
→ related Solutions
→ related Projects
→ related Guides
→ related FAQs
```

```text
Project
→ Services
→ Materials
→ Solutions
→ related Projects
```

```text
Guide
→ related Service
→ related Material
→ related Project
→ CTA
```

Avoid keyword-stuffed footer link farms.

---

## 17. Public Discovery Rules

Public visitors receive only Published versions.

Draft:
- not listed,
- not in sitemap,
- not indexable,
- visible only through secure preview.

Archived:
- not listed,
- not in sitemap,
- not normally public.

---

## 18. Dashboard Information Architecture

```text
Dashboard
├── Overview
├── Content
│   ├── Services
│   ├── Solutions
│   ├── Materials
│   ├── Projects
│   ├── Articles
│   ├── FAQs
│   └── Pages
├── Media
├── SEO
│   └── Redirects
└── Settings
```

No V1 sections for:
- Testimonials,
- Customers,
- Leads,
- Quotes,
- Invoices,
- Payments,
- Employees.

---

## 19. Dashboard Overview

Keep lightweight.

May show:
- published Service count,
- published Project count,
- published Article count,
- draft count,
- recently edited content,
- quick links.

Do not add advanced analytics integrations by default.

---

## 20. Pages Navigation

Pages corresponds only to fixed-layout pages:

```text
Pages
├── Home
├── About
├── Contact
└── Prices
```

Do not allow arbitrary page creation in V1.

---

## 21. SEO Navigation

Entity-level SEO fields belong primarily inside the relevant entity editor.

SEO section may contain:
- site-wide SEO defaults,
- indexing/sitemap information,
- Redirect management.

Do not duplicate every entity SEO field into a second management surface.

---

## 22. Media Navigation

Media supports:
- browse,
- upload,
- inspect metadata,
- edit alt/caption,
- select existing assets,
- safe delete.

Storage details belong to `09-media-management.md`.

---

## 23. Design Boundary

This document defines structure, routes, relationships, and navigation only.

It does not define:
- colors,
- typography,
- spacing,
- brand identity,
- detailed visual layout.

---

## 24. AI Guardrails

AI tools must not:
- create `/articles`,
- create `/prices/[slug]`,
- create a page builder,
- create a marketplace,
- create customer/lead systems,
- add testimonials,
- invent new navigation groups,
- invent local landing pages,
- expose drafts publicly.
