# CMS Dashboard Requirements Reference

## 1. Purpose

This document defines the functional requirements of the custom CMS/dashboard.

The dashboard is part of the same Next.js application.

It is a custom CMS built specifically for this website.

It is not:
- a general-purpose CMS platform,
- a page builder,
- a CRM,
- a marketplace backend,
- a customer-management system.

---

## 2. Dashboard Route and Access

Dashboard route:
```text
/dashboard
```

Requirements:
- authenticated administrator access,
- server-side authorization for every mutation,
- public users cannot access dashboard content,
- client-side hiding alone is insufficient.

---

## 3. Required V1 Navigation

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

Do not add:
- Testimonials,
- Leads,
- Quotes,
- Customers,
- Payments,
- Invoices,
- Employees.

---

## 4. Shared Entity Management

For dynamic entities, support:
- list,
- create Draft,
- edit Draft,
- Preview Draft,
- Publish,
- Archive,
- search where useful,
- status filtering,
- sorting,
- pagination or efficient loading.

List views should not load full rich-text bodies.

---

## 5. Publication Behavior

Minimum lifecycle:
```text
DRAFT
PUBLISHED
ARCHIVED
```

A record may have:
- a Published version,
- a newer Draft version,
- both at the same time.

The dashboard may display derived state:
```text
Published — Unpublished changes
```

Critical rule:
> Editing any public-facing field or public-facing relationship must edit the Draft version only.

Examples include:
- slug,
- title,
- body,
- SEO,
- location,
- media,
- gallery,
- related entities.

The public site continues rendering the Published version until Publish succeeds.

---

## 6. Create Flow

New entity:
- creates stable entity identity,
- creates initial Draft version,
- has no Published version until Publish.

Default state:
```text
DRAFT
```

---

## 7. Edit Flow

Editing a Published record:
- must edit/create the Draft version,
- must not mutate current Published version,
- should preserve published public output.

---

## 8. Publish Flow

Publish must:
1. authorize admin,
2. validate Draft,
3. create/promote the new Published snapshot,
4. update publication pointers/status,
5. set/update `publishedAt`,
6. create Redirect when a published slug changes,
7. revalidate affected public routes.

Publish should be atomic where practical.

---

## 9. Preview Flow

Preview must:
- render Draft,
- be protected,
- be noindex/nofollow,
- not appear in sitemap,
- not appear in public listings.

Supported for:
- Service,
- Solution,
- Material,
- Project,
- Article,
- FAQ when needed,
- fixed Pages.

---

## 10. Archive

Archive:
- removes content from normal public listings,
- excludes it from sitemap,
- keeps it in CMS,
- does not imply permanent deletion.

If an archived URL has SEO value, redirect decisions should follow the SEO reference.

---

## 11. Services Module

Administrator can:
- create/edit Draft,
- preview,
- publish,
- archive,
- manage media,
- manage SEO,
- manage relations to Solutions,
- Materials,
- Projects,
- Articles,
- FAQs.

Fields are defined in `06-content-models.md`.

---

## 12. Solutions Module

Administrator can:
- create/edit Draft,
- preview,
- publish,
- archive,
- manage SEO/media,
- manage relations to Services, Materials, Projects, Articles, FAQs.

---

## 13. Materials Module

Administrator can:
- create/edit Draft,
- preview,
- publish,
- archive,
- manage SEO/media,
- manage relations.

Do not auto-generate material claims.

---

## 14. Projects Module

Administrator can:
- create/edit Draft,
- manage city/district,
- manage cover media,
- manage ordered gallery,
- manage relations,
- preview,
- publish,
- archive,
- manage SEO.

Gallery edits are Draft-versioned.

---

## 15. Articles Module

Internal entity name:
```text
Article
```

Public route:
```text
/guides/[slug]
```

Administrator can:
- create/edit Draft,
- use TipTap,
- manage hero media,
- manage relationships,
- preview,
- publish,
- archive,
- manage SEO.

TipTap is the approved rich-text editor.

Do not substitute another editor without scope approval.

---

## 16. FAQ Module

Administrator can:
- create/edit,
- publish/archive,
- relate FAQs to supported entities/pages,
- set ordering where required.

If FAQ changes can affect a published page, published content must not receive those changes until the FAQ's publication flow is complete.

---

## 17. Static Pages Module

Initial Pages:
- Home,
- About,
- Contact,
- Prices.

Fixed page schemas only.

Do not allow:
- arbitrary section creation,
- arbitrary HTML layout,
- drag/drop page building,
- arbitrary styling.

Page changes use Draft/Preview/Publish just like other public content.

---

## 18. Media Module

Administrator can:
- upload,
- browse,
- search/filter where useful,
- select existing Media,
- edit alt/caption,
- inspect metadata,
- safely delete.

Binary files:
- live on persistent server storage,
- are not stored in PostgreSQL.

---

## 19. SEO Module

Entity SEO fields remain in entity editors.

SEO section supports:
- global SEO defaults,
- Redirect management,
- relevant technical configuration visibility.

### Redirect Management
Administrator or publish logic may manage:
- sourcePath,
- destinationPath,
- permanent redirect behavior.

Prevent:
- duplicate source paths,
- loops,
- redirect to identical path.

---

## 20. Settings Module

Approved categories:

### Company
- company name,
- description,
- logo,
- address,
- business hours.

### Contact
- primary phone,
- optional secondary phone,
- WhatsApp number,
- email.

### Social
- approved social links.

### Website
- default CTA values,
- default SEO values.

Do not build unrestricted key/value settings.

---

## 21. WhatsApp Configuration

May configure:
- business WhatsApp number,
- default message text.

Public structured contact forms may collect input and compose a WhatsApp message.

Do not save the inquiry as Lead/Quote data.

---

## 22. Authentication

Minimum:
- login,
- secure password hashing,
- session,
- protected dashboard routes,
- server-side mutation authorization,
- logout.

No complex RBAC required in V1.

---

## 23. Forms

Use:
- React Hook Form where appropriate,
- Zod,
- server-side validation.

Form states:
- loading,
- ready,
- submitting,
- validation error,
- success,
- server error.

---

## 24. Slug Management

Slug:
- editable in Draft,
- validated,
- unique in route namespace.

If a Published slug changes and the new Draft is published:
- preserve old public path with Redirect,
- revalidate old/new routes.

---

## 25. Relationship Selectors

Use entity IDs.

Selectors should:
- search existing records when useful,
- prevent duplicates,
- clearly identify selected records.

Relationship changes must be Draft-versioned for public content.

---

## 26. Publish Validation

Draft may be incomplete.

Publish must validate required public fields.

Do not require optional relationships merely because the UI exposes them.

---

## 27. Media Selection UX

Conceptual behavior:
```text
Choose Media
├── Select Existing
└── Upload New
```

Do not force duplicate uploads.

---

## 28. Destructive Actions

Require explicit confirmation.

Media deletion:
- check references,
- block or warn when actively referenced.

Content:
- prefer Archive over immediate permanent deletion.

---

## 29. Performance

- paginate large collections,
- query only needed fields,
- avoid loading TipTap bodies in lists,
- optimize media thumbnails,
- avoid N+1 queries.

---

## 30. Security

At minimum:
- server-side authorization,
- Zod validation,
- safe rich-text rendering,
- file validation,
- path traversal protection,
- upload size/type restrictions,
- protected Preview,
- no secret exposure.

---

## 31. Design Boundary

This document defines behavior, not visual identity.

Do not infer:
- colors,
- typography,
- spacing,
- detailed layout styling.

---

## 32. Explicit Non-Goals

Do not implement:
- CRM,
- customer accounts,
- leads,
- quotes,
- invoices,
- payments,
- employee management,
- testimonials,
- analytics integrations,
- page builder,
- plugin system,
- theme builder,
- multi-tenancy.

---

## 33. V1 Completion Criteria

Authenticated admin can:
- manage Services,
- manage Solutions,
- manage Materials,
- manage Projects,
- manage Articles,
- manage FAQs,
- edit static Pages,
- manage Media,
- manage entity SEO,
- manage Redirects,
- manage SiteSettings,
- Draft,
- Preview,
- Publish,
- Archive,

without exposing unpublished changes publicly.
