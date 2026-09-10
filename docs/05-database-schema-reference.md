# Database Schema Reference

## 1. Purpose

This document defines the recommended PostgreSQL/Prisma schema architecture for V1.

It is implementation-oriented and must preserve the domain invariant:

> Draft edits must not mutate the currently Published public snapshot.

---

## 2. Technology

- PostgreSQL
- Prisma ORM
- Prisma migrations

---

## 3. Shared Enums

```ts
enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

Optional:
```ts
enum MediaType {
  IMAGE
  FILE
}
```

---

## 4. Versioning Pattern

Use a stable entity + version model for public editable content.

Conceptual example:

```text
Service
├── id
├── status
├── publishedVersionId?
├── draftVersionId?
├── publishedAt?
├── createdAt
└── updatedAt

ServiceVersion
├── id
├── serviceId
├── title
├── slug
├── ...
├── createdAt
└── updatedAt
```

Important:
- all public-rendering fields belong to Version,
- all public-rendering relationships belong to Version,
- Published version is immutable in normal editing flow,
- Draft version is editable,
- Publish promotes Draft to Published atomically.

---

## 5. Shared Version SEO Fields

Recommended on public content versions:

```text
seoTitle?
seoDescription?
canonicalUrl?
noIndex
openGraphTitle?
openGraphDescription?
openGraphImageId?
```

Draft/Preview is noindex regardless of `noIndex`.

---

## 6. Service / ServiceVersion

### Service
```text
id
status
publishedVersionId?
draftVersionId?
publishedAt?
createdAt
updatedAt
```

### ServiceVersion
```text
id
serviceId
title
slug
shortDescription
content
heroMediaId?
SEO fields
createdAt
updatedAt
```

Indexes:
- Service.status
- Service.publishedAt
- ServiceVersion.serviceId

Slug uniqueness:
- Published public slug collisions must be prevented.
- Draft slug collisions must also be validated before Publish.

Implementation may use a normalized slug registry or application/database checks appropriate to Prisma/PostgreSQL.

---

## 7. Solution / SolutionVersion

### Solution
Stable lifecycle fields.

### SolutionVersion
```text
id
solutionId
title
slug
shortDescription
content
heroMediaId?
SEO fields
createdAt
updatedAt
```

---

## 8. Material / MaterialVersion

### Material
Stable lifecycle fields.

### MaterialVersion
```text
id
materialId
name
slug
shortDescription
content
advantages?
limitations?
maintenanceNotes?
recommendedUses?
heroMediaId?
SEO fields
createdAt
updatedAt
```

Bounded structured lists may use JSON.

Do not put core entity relationships in JSON.

---

## 9. Project / ProjectVersion

### Project
```text
id
status
publishedVersionId?
draftVersionId?
publishedAt?
createdAt
updatedAt
```

### ProjectVersion
```text
id
projectId
title
slug
shortDescription
content?
challenge?
solutionSummary?
technicalDetails?
completedAt?
city?
district?
coverMediaId?
SEO fields
createdAt
updatedAt
```

### ProjectVersionGallery
```text
id
projectVersionId
mediaId
sortOrder
caption?
```

Unique:
```text
(projectVersionId, mediaId)
```

Gallery belongs to ProjectVersion, not Project.

---

## 10. Article / ArticleVersion

### Article
Stable lifecycle fields.

### ArticleVersion
```text
id
articleId
title
slug
excerpt
content
heroMediaId?
articleType?
SEO fields
createdAt
updatedAt
```

TipTap `content`:
- stored as structured validated JSON,
- not arbitrary unsafe HTML.

Public route is `/guides/[slug]`.

---

## 11. FAQ / FAQVersion

Recommended V1:
### FAQ
```text
id
status
publishedVersionId?
draftVersionId?
publishedAt?
createdAt
updatedAt
```

### FAQVersion
```text
id
faqId
question
answer
sortOrder?
createdAt
updatedAt
```

FAQ public relationships should attach to FAQVersion or be represented through the parent content version where selected.

Choose one canonical approach and use it consistently.

Recommended simplest approach:
- parent content versions select published FAQ entities,
- FAQ's own question/answer is versioned,
- FAQ relation rows connect parent Version -> FAQ stable identity.

Public rendering resolves FAQ.publishedVersion.

This avoids duplicating FAQ relation tables per FAQ version unnecessarily while still preventing unpublished FAQ content from leaking.

---

## 12. Page / PageVersion

### Page
```text
id
key
status
publishedVersionId?
draftVersionId?
publishedAt?
createdAt
updatedAt
```

`key` unique.

Examples:
- HOME
- ABOUT
- CONTACT
- PRICES

### PageVersion
```text
id
pageId
data
SEO fields
createdAt
updatedAt
```

`data` may be JSON because each Page key has a strict Zod schema.

No arbitrary blocks.

---

## 13. Media

```text
id
type
url
storagePath
originalFilename
storedFilename
mimeType
sizeBytes
width?
height?
altText?
caption?
createdAt
updatedAt
```

Rules:
- binary not in PostgreSQL,
- `storagePath` internal,
- `url` public/application path.

Indexes:
- storedFilename,
- mimeType,
- createdAt.

---

## 14. SiteSettings

Singleton record.

Recommended:
```text
id
companyName
companyDescription?
logoMediaId?
primaryPhone
secondaryPhone?
whatsappNumber
email?
address?
businessHours?
socialLinks?
defaultSeoTitle?
defaultSeoDescription?
defaultOpenGraphImageId?
defaultCtaText?
defaultWhatsappText?
createdAt
updatedAt
```

`socialLinks` may be bounded JSON.

---

## 15. AdminUser

```text
id
email
passwordHash
name?
lastLoginAt?
createdAt
updatedAt
```

Unique:
- email.

If Auth.js adapter requires additional tables, add only what the selected session strategy requires.

---

## 16. Redirect

```text
id
sourcePath
destinationPath
statusCode
createdAt
updatedAt
```

Recommended:
- `sourcePath` unique,
- `statusCode` default 301,
- validate no self-redirect,
- prevent redirect loops in application logic.

Primary creation flow:
- publish detects old Published slug != new Draft slug,
- create/update Redirect from old path to new path.

---

## 17. Versioned Relationship Tables

Public relationships must reference the **content version** that owns the snapshot.

Examples:

```text
ServiceVersionMaterial
ServiceVersionSolution
ServiceVersionProject
ServiceVersionArticle
ServiceVersionFAQ

SolutionVersionService
SolutionVersionMaterial
SolutionVersionProject
SolutionVersionArticle
SolutionVersionFAQ

MaterialVersionService
MaterialVersionSolution
MaterialVersionProject
MaterialVersionArticle
MaterialVersionFAQ

ProjectVersionService
ProjectVersionSolution
ProjectVersionMaterial
ProjectVersionArticle

ArticleVersionService
ArticleVersionSolution
ArticleVersionMaterial
ArticleVersionProject
ArticleVersionFAQ
```

Important:
- do not model the same semantic relation twice in two directions unless necessary,
- choose one canonical join table per semantic pair where possible,
- public page queries should resolve relations from the current Published version.

A simpler canonical naming strategy is allowed if it preserves this invariant.

---

## 18. Page Selections

When fixed Page data selects related entities, store selected stable entity IDs inside validated PageVersion JSON only if:
- ordering matters,
- relationships are simple,
- relational querying is not needed.

Otherwise use explicit PageVersion join tables.

Choose the simplest approach per actual query needs.

---

## 19. Referential Actions

Use Cascade for:
- Version rows owned by a deleted parent,
- version-specific join rows,
- ProjectVersionGallery rows.

Use Restrict/guarded deletion for:
- referenced Media,
- risky public content dependencies.

Public entities should usually be Archived instead of deleted.

---

## 20. Indexing

Index:
- stable entity status,
- publishedAt,
- version foreign keys,
- relation foreign keys,
- Redirect.sourcePath,
- ProjectVersion city/district if queried frequently,
- createdAt/updatedAt where admin sorting uses them.

Do not over-index without a query pattern.

---

## 21. Slug Collision Strategy

Because slug lives on Versions, avoid naive `unique(slug)` across every historical version.

Required behavior:
- current Draft/Public slugs must not collide with another entity in the same route namespace,
- historical old versions may retain previous slugs.

Implementation options:
1. application transaction + lookup checks,
2. a dedicated route/slug registry table,
3. a partial uniqueness strategy implemented outside Prisma if needed.

Prefer the simplest reliable approach supported by the final codebase.

Do not make every historical Version slug globally unique if that blocks legitimate reuse/history.

---

## 22. JSON Rules

Approved:
- TipTap document,
- static PageVersion data,
- bounded lists,
- social links.

Not approved for:
- core entity identity,
- publication status,
- public relational content where queries/relations matter.

---

## 23. Seed Data

May seed:
- initial AdminUser,
- SiteSettings singleton,
- fixed Page records.

Do not seed fictional Services, Projects, Materials, or claims.

---

## 24. Migration Rules

Use Prisma migrations.

Never:
- reset production DB,
- manually alter production schema without migrations,
- execute destructive migrations without review.

---

## 25. Data Integrity Invariants

Database/application together must guarantee:
- Draft edits do not alter Published output,
- publishedVersionId belongs to the same stable entity,
- draftVersionId belongs to the same stable entity,
- no duplicate version relationship rows,
- no orphaned owned versions,
- no broken media references,
- no invalid Redirect loops,
- no public slug collision.
