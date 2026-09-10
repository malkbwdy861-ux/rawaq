# Domain Model Reference

## 1. Purpose

This document defines the conceptual domain model.

It is authoritative for:
- entity meaning,
- entity boundaries,
- lifecycle concepts,
- relationships,
- versioning semantics.

Database-specific implementation belongs in `05-database-schema-reference.md`.

---

## 2. Core Entities

V1 entities:
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

No Customer, Lead, Quote, Invoice, Payment, Employee, Testimonial, Provider, Vendor, or Marketplace entity is required.

---

## 3. Entity Identity vs Content Version

Publicly editable entities are split conceptually into:

### Stable Entity
Represents identity/lifecycle.

Contains only stable or publication-management data such as:
- id,
- status,
- publishedVersionId,
- draftVersionId,
- publishedAt,
- createdAt,
- updatedAt.

### Content Version
Represents a full public-rendering snapshot.

All fields that can change what a visitor sees belong to the version, including:
- title/name,
- slug,
- summary,
- body,
- SEO,
- location,
- media,
- gallery,
- public relationships.

This rule prevents Draft edits from modifying Published output.

---

## 4. Publishable Entities

The following require Draft/Published version separation:
- Service
- Solution
- Material
- Project
- Article
- Page
- FAQ, when FAQ changes are independently publishable.

Media itself is not versioned in V1.

SiteSettings may use a simpler direct model because settings changes are intentionally global/immediate unless later requirements add draft settings.

Redirect is not versioned.

---

## 5. Service

Represents work the company performs.

A Service version may contain:
- title,
- slug,
- shortDescription,
- content,
- heroMedia,
- SEO,
- related Solutions,
- related Materials,
- related Projects,
- related Articles,
- related FAQs.

---

## 6. Solution

Represents a customer problem/use case.

A Solution version may contain:
- title,
- slug,
- shortDescription,
- content,
- heroMedia,
- SEO,
- related Services,
- related Materials,
- related Projects,
- related Articles,
- related FAQs.

---

## 7. Material

Represents a real business-supported material/option.

A Material version may contain:
- name,
- slug,
- shortDescription,
- content,
- advantages,
- limitations,
- maintenanceNotes,
- recommendedUses,
- heroMedia,
- SEO,
- related Services,
- related Solutions,
- related Projects,
- related Articles,
- related FAQs.

---

## 8. Project

Represents a real executed work/case study.

A Project version may contain:
- title,
- slug,
- summary,
- content,
- challenge,
- solutionSummary,
- technicalDetails,
- completedAt,
- city,
- district,
- coverMedia,
- ordered gallery,
- SEO,
- related Services,
- related Solutions,
- related Materials,
- related Articles.

All these belong to the version because Draft edits must not alter Published output.

---

## 9. Article

Internal CMS entity for:
- Guides,
- pricing guides,
- comparisons,
- maintenance content,
- educational content.

Public route:
```text
/guides/[slug]
```

A version may contain:
- title,
- slug,
- excerpt,
- TipTap content,
- heroMedia,
- optional articleType,
- SEO,
- related Services,
- related Solutions,
- related Materials,
- related Projects,
- related FAQs.

---

## 10. FAQ

Reusable question/answer.

FAQ may relate to:
- Services,
- Solutions,
- Materials,
- Articles,
- Pages.

If FAQ is independently publishable, its question, answer, ordering, and public relationships must be versioned.

---

## 11. Page

Represents a fixed-layout static page.

Initial keys:
- HOME
- ABOUT
- CONTACT
- PRICES.

A Page version contains:
- page-specific structured data,
- SEO,
- public entity selections.

Page is not a generic page builder.

---

## 12. Media

Represents metadata for a file stored on persistent server storage.

Contains:
- public URL,
- storage path,
- filenames,
- MIME type,
- size,
- dimensions,
- alt,
- caption,
- timestamps.

Media may be referenced from content versions.

---

## 13. SiteSettings

Stores approved global configuration:
- company info,
- contact info,
- logo,
- social links,
- default SEO,
- default CTA values.

Do not turn this into unrestricted arbitrary settings.

---

## 14. AdminUser

Represents dashboard administrator authentication identity.

V1 does not require complex role hierarchy.

---

## 15. Redirect

Represents a technical permanent URL mapping.

Fields conceptually:
- sourcePath,
- destinationPath,
- statusCode,
- createdAt.

Primary use:
- preserve old public URL after a Published slug changes.

Rules:
- sourcePath unique,
- no self-redirect,
- prevent redirect loops.

---

## 16. Relationship Versioning Rule

Any relationship that affects public output belongs to the content version.

Example:

Wrong:
```text
Project -> Materials
```
stored only on stable Project while Draft is edited.

Correct:
```text
ProjectVersion -> Materials
```

This ensures:
- Published ProjectVersion keeps current public Materials,
- Draft ProjectVersion can use different Materials,
- Publish atomically promotes the Draft relationship snapshot.

The same principle applies to:
- Services,
- Solutions,
- Materials,
- Projects,
- Articles,
- FAQs,
- media/gallery selections.

---

## 17. Relationship Matrix

Conceptual public-content relationships:

| Entity Version | Services | Solutions | Materials | Projects | Articles | FAQs | Media |
|---|---|---|---|---|---|---|---|
| ServiceVersion | — | many | many | many | many | many | many |
| SolutionVersion | many | — | many | many | many | many | many |
| MaterialVersion | many | many | — | many | many | many | many |
| ProjectVersion | many | many | many | — | many | optional | many |
| ArticleVersion | many | many | many | many | — | many | many |
| FAQVersion | many | many | many | optional | many | — | optional |
| PageVersion | many | optional | optional | many | optional | many | many |

Exact join-table design belongs in the database reference.

---

## 18. Publication State

Stable entity lifecycle:
```text
DRAFT
PUBLISHED
ARCHIVED
```

Possible state:
```text
status = PUBLISHED
publishedVersionId = V2
draftVersionId = V3
```

Meaning:
- V2 is live,
- V3 contains unpublished changes.

Derived dashboard label:
```text
Published — Unpublished changes
```

---

## 19. Slug Semantics

Slug belongs to the version.

Public routing resolves the slug of the Published version.

Preview resolves the slug of the Draft version through secure preview flow.

When Draft changes a previously Published slug and gets published:
- create Redirect from old Published path,
- promote new slug.

---

## 20. Deletion Principles

Prefer Archive for public content.

Permanent deletion:
- must respect references,
- must not silently break media/content,
- may cascade version-owned records and version relationship rows.

---

## 21. Domain Invariants

- Draft edits never alter Published rendering.
- Published entity points to an immutable publication snapshot.
- public routes query only Published versions.
- Draft/Preview is not indexable.
- slug changes preserve old Published URL when possible.
- Media binaries are not stored in PostgreSQL.
- Material/Project facts must be real.
- Page never becomes a page builder.
- no out-of-scope business entities.

---

## 22. Anti-Hallucination Rules

Do not:
- add generic CMS block entities,
- use EAV/key-value modeling for core content,
- put public relationships on stable entities if Draft changes could leak,
- create CRM models,
- invent business data,
- create `/articles` or `/prices/[slug]`.
