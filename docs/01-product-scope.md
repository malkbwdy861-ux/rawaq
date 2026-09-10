# Product Scope Reference

## 1. Purpose

This document is the authoritative product-scope reference for the website and its custom CMS/dashboard.

Use it to prevent:
- feature creep,
- prompt ambiguity,
- hallucinated product requirements,
- accidental expansion into unrelated business systems.

If a later implementation request conflicts with this document, the later request must explicitly state that the product scope is changing. Otherwise, this document remains authoritative.

---

## 2. Product Definition

The product is a **single-company marketing and lead-generation website** for a Saudi business providing outdoor construction, shading, enclosure, and related installation or maintenance services.

The website is not a marketplace.

The website must:
1. present the company professionally,
2. explain services, solutions, materials, and project capabilities,
3. support strong organic search visibility,
4. publish structured commercial and educational content,
5. show real executed projects,
6. help visitors understand options before contacting the company,
7. drive contact through phone and WhatsApp,
8. allow an administrator to manage website content from a custom dashboard,
9. support Draft, Preview, Publish, and Archive workflows.

---

## 3. Business Model

The website represents **one company only**.

The exact service catalog is dynamic and must not be permanently hardcoded as a fixed business assumption.

Possible categories may include:
- shades,
- car shades,
- fences/screens,
- pergolas,
- hangars,
- sandwich panels,
- outdoor structures,
- maintenance,
- other related services approved by the business.

The primary conversion channels are:
- phone,
- WhatsApp.

There is no internal lead-management system in V1.

---

## 4. Primary Goals

### Business Goals
- increase qualified inquiries,
- increase organic search traffic,
- strengthen trust through projects and structured content,
- make content publishing possible without code changes,
- support future content expansion without redesigning the architecture,
- reduce repetitive pre-sales questions by presenting useful service, material, project, and pricing information.

### Visitor Goals
Visitors should be able to:
- understand the company's services,
- find a relevant solution or use case,
- compare available materials/options,
- view real projects,
- understand pricing factors,
- read buying or educational guides,
- contact the company quickly by phone or WhatsApp.

### Administrator Goals
The administrator should be able to:
- manage dynamic entities,
- edit approved static-page content,
- upload and reuse media,
- manage SEO metadata,
- create Draft content,
- Preview unpublished content,
- Publish intentionally,
- Archive content,
- manage site-wide business/contact settings.

---

## 5. User Types

### Public Visitor
A public visitor:
- does not need an account,
- does not log in,
- sees only published public content,
- can contact the business by phone or WhatsApp,
- may fill structured fields before opening WhatsApp.

### Administrator
The administrator:
- authenticates into `/dashboard`,
- manages website content,
- manages media,
- manages site settings,
- controls publishing.

V1 does not require:
- customer accounts,
- employee management,
- complex role hierarchies,
- granular multi-role permissions.

---

## 6. Product Surfaces

### Public Website
Includes:
- Home,
- Services,
- Solutions,
- Materials,
- Projects,
- Guides,
- Prices hub,
- About,
- Contact,
- other explicitly approved fixed-layout pages.

### Admin Dashboard
Exists inside the same Next.js application under:
```text
/dashboard
```

The dashboard is not a separate product or deployment.

---

## 7. Approved Core Entities

V1 domain entities:
- Service
- Solution
- Material
- Project
- Article
- FAQ
- Page
- Media
- SiteSettings
- AdminUser
- Redirect

`Redirect` is a technical SEO entity used to preserve old URLs when published slugs change. It is not a business feature.

Do not add Customer, Lead, Quote, Invoice, Payment, Employee, Testimonial, Provider, Vendor, or Marketplace entities in V1.

---

## 8. Dynamic Content

The following are fully dynamic:
- Services,
- Solutions,
- Materials,
- Projects,
- Articles/Guides,
- FAQs.

The administrator can create, edit, preview, publish, archive, and manage their SEO/relationships according to later references.

---

## 9. Static Pages

Static pages are fixed-layout application pages.

Initial static pages:
- Home,
- About,
- Contact,
- Prices.

They are **not** page-builder pages.

The administrator can edit only fields explicitly defined by the page schema.

The administrator must not receive unrestricted control over:
- arbitrary section creation,
- drag-and-drop page composition,
- arbitrary CSS,
- arbitrary typography,
- arbitrary spacing,
- arbitrary HTML layouts.

---

## 10. Public Route Conventions

Canonical public route groups:

```text
/services/[slug]
/solutions/[slug]
/materials/[slug]
/projects/[slug]
/guides/[slug]
```

The internal CMS entity is named `Article`, but its public listing/detail routes are:

```text
/guides
/guides/[slug]
```

Do not create a second `/articles/[slug]` route.

Pricing architecture:
- `/prices` is the fixed pricing hub,
- detailed pricing content is represented by Article entities under `/guides/[slug]`,
- do not create `/prices/[slug]` in V1 unless the scope changes.

---

## 11. WhatsApp and Phone Conversion

There is no internal Quote or Lead module.

The site may collect non-persisted visitor input such as:
- service,
- solution,
- material,
- approximate dimensions,
- city/district,
- notes.

The site formats this into a WhatsApp message and opens WhatsApp using the configured business number.

No inquiry record is saved to PostgreSQL by default.

---

## 12. Media Storage

Media binaries are stored on **persistent server filesystem storage**.

The database stores:
- URL,
- storage path,
- filename metadata,
- MIME type,
- file size,
- dimensions where relevant,
- alt text/caption,
- timestamps.

Do not:
- store raw image binaries in PostgreSQL,
- require S3/R2/Cloudinary or another external provider in V1,
- store uploads only in an ephemeral application container layer.

---

## 13. Publishing Model

Publicly editable content must support:
- Draft,
- Published,
- Archived.

Critical invariant:

> Editing Draft content must never modify the currently published public version until an explicit Publish action succeeds.

Therefore, every field or relationship that affects public rendering belongs to a versioned draft/published snapshot or an equivalent immutable publication model.

This includes, where applicable:
- title,
- slug,
- body content,
- SEO fields,
- location fields,
- media,
- galleries,
- related Services,
- related Solutions,
- related Materials,
- related Projects,
- related Articles,
- related FAQs.

A record may be publicly published while also having newer unpublished changes.

Derived dashboard state may show:
```text
Published — Unpublished changes
```

This is not a separate database status.

---

## 14. SEO Scope

SEO is a core requirement.

The implementation must support:
- editable SEO title and description,
- canonical behavior,
- Open Graph,
- sitemap,
- robots,
- structured data where relevant,
- clean slugs,
- internal linking,
- redirects for published slug changes,
- noindex behavior for drafts/previews,
- exclusion of drafts/archived content from sitemap/public listings.

Do not create SEO landing pages automatically.

Keyword-to-URL decisions come from the approved SEO strategy.

---

## 15. Approved Technical Direction

Core stack:
- Next.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Auth.js
- Zod
- React Hook Form
- Tailwind CSS
- shadcn/ui
- TipTap

Media:
- persistent local/server filesystem storage

Deployment:
- Docker-compatible
- Coolify-compatible

The CMS/dashboard is custom-built.

Do not introduce:
- Payload CMS,
- Strapi,
- Sanity,
- Directus,
- WordPress,
- other headless CMS products,

unless explicitly approved by a future scope change.

---

## 16. Design Boundary

Design identity and visual execution are handled separately through dedicated design skills/workflows.

Implementation references must not invent:
- brand colors,
- typography,
- final layout aesthetics,
- spacing systems,
- visual identity.

Implementation references may define structural UI behavior only where needed.

---

## 17. Explicit Non-Goals

Not in V1:
- marketplace,
- multiple contractor/provider accounts,
- CRM,
- leads dashboard,
- quote management,
- customer database,
- customer accounts,
- invoices,
- payments,
- employee management,
- inventory,
- booking,
- appointments,
- live chat,
- newsletter platform,
- testimonial management,
- page builder,
- plugin system,
- theme builder,
- external CMS,
- mandatory external media storage.

Testimonials may be considered later as a separate enhancement.

---

## 18. Scope Change Rule

AI tools and developers must not add a feature because it is "standard", "common", or "useful".

A feature may be added only when:
1. this scope explicitly includes it,
2. another approved reference requires it,
3. or the project owner explicitly approves the change.

When uncertain, implement the smallest production-safe solution compatible with the documented architecture.

---

## 19. Stable Terminology

### Service
A category of work the company performs.

### Solution
A customer need, problem, context, or use case.

### Material
A real material or construction option supported by the business.

### Project
A real executed work/case study.

### Article
The internal CMS entity for guides, pricing content, comparisons, and educational content.

### Guide
The public presentation/route group for Article entities.

### FAQ
A reusable question-and-answer record.

### Page
A fixed-layout static page with controlled editable data.

### Media
Metadata for a server-stored file.

### SiteSettings
Approved site-wide configuration values.

### Redirect
A technical mapping from an old public URL to a new public URL.

### Draft
The editable unpublished version.

### Published
The public version.

### Archived
Retained content removed from normal public display.

---

## 20. V1 Success Criteria

V1 is complete when:
- public pages render published content,
- admin authentication protects `/dashboard`,
- Services are dynamic,
- Solutions are dynamic,
- Materials are dynamic,
- Projects are dynamic,
- Articles/Guides are dynamic,
- FAQs are manageable,
- static pages expose controlled editable content,
- Media works on persistent server storage,
- Draft/Preview/Publish works without leaking draft changes,
- SEO metadata is manageable,
- sitemap/robots are correct,
- published slug changes can preserve old URLs through redirects,
- phone and WhatsApp contact flows work,
- no out-of-scope business systems have been added.
