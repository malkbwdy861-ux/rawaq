# Application Architecture Reference

## 1. Purpose

Defines the recommended application architecture for the single Next.js project.

Covers:
- runtime boundaries,
- source organization,
- data access,
- validation,
- auth,
- versioned publishing,
- Preview,
- media,
- caching,
- SEO integration.

---

## 2. Stack

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
- persistent server filesystem media storage

Deployment:
- Docker/Coolify compatible.

---

## 3. One Application

Use one Next.js application.

Conceptual:
```text
Public routes
Dashboard routes
Server actions/route handlers
Database access
Media serving
```

Do not create a separate dashboard app.

---

## 4. Recommended Structure

```text
src/
├── app/
│   ├── (public)/
│   ├── dashboard/
│   ├── api/
│   └── preview/
├── modules/
│   ├── services/
│   ├── solutions/
│   ├── materials/
│   ├── projects/
│   ├── articles/
│   ├── faqs/
│   ├── pages/
│   ├── media/
│   ├── redirects/
│   ├── seo/
│   ├── settings/
│   └── auth/
├── components/
├── lib/
├── server/
│   ├── db/
│   ├── auth/
│   ├── repositories/
│   ├── services/
│   └── validation/
└── types/
```

Exact naming may adapt to the actual codebase.

---

## 5. Server Components

Prefer Server Components for:
- public content pages,
- server-rendered CMS lists,
- metadata,
- published content queries.

Use Client Components only for real interactivity:
- TipTap,
- forms,
- media picker,
- sortable gallery,
- client-only controls.

Keep `"use client"` boundaries narrow.

---

## 6. Data Access

Recommended flow:
```text
Route/UI
↓
application service/query
↓
repository
↓
Prisma
↓
PostgreSQL
```

Avoid arbitrary Prisma calls across UI components.

---

## 7. Validation

Use Zod.

Server validation is mandatory.

Flow:
```text
Form
↓
client feedback
↓
server action
↓
auth/authorization
↓
server Zod validation
↓
domain mutation
```

---

## 8. Authentication

Use Auth.js.

Requirements:
- secure login,
- protected `/dashboard`,
- secure session,
- server-side mutation checks,
- logout.

A simple `requireAdmin()` guard is sufficient for V1.

---

## 9. Versioned Query Model

Public query:
```text
Stable Entity
→ publishedVersionId
→ Published Version
```

Dashboard editor:
```text
Stable Entity
→ draftVersionId
→ Draft Version
```

Preview:
```text
Stable Entity
→ draftVersionId
→ secure Preview render
```

Never render Draft relations/media/content through normal public queries.

---

## 10. Draft Editing

When editing Published content:
- reuse or create Draft version,
- copy current Published snapshot into Draft when needed,
- edit only Draft,
- keep Published immutable.

Copy operation must include:
- scalar fields,
- SEO,
- gallery,
- relationships,
- page selections.

---

## 11. Publish Transaction

Recommended transaction:
1. authorize,
2. validate Draft,
3. load current Published version,
4. detect slug change,
5. make Draft snapshot the new Published version,
6. preserve/create next Draft strategy as defined by implementation,
7. update stable entity pointers/status,
8. create Redirect if old Published path changed,
9. commit,
10. revalidate routes.

Prefer a database transaction for pointer/redirect changes.

---

## 12. Preview

Use secure preview access:
- authenticated admin session and/or signed token,
- noindex/nofollow,
- not in sitemap,
- not public listing.

Preview may use canonical public layout but Draft data.

---

## 13. Route Model

Canonical:
```text
/services/[slug]
/solutions/[slug]
/materials/[slug]
/projects/[slug]
/guides/[slug]
```

Article internal entity maps to `/guides`.

Prices:
```text
/prices
```
only as fixed hub in V1.

---

## 14. Redirect Handling

Before normal content resolution or through Next.js redirect configuration backed by DB:
- resolve Redirect.sourcePath,
- return permanent redirect.

Avoid:
- redirect loops,
- chains where possible,
- source == destination.

---

## 15. Server Mutations

Prefer:
- Server Actions for internal dashboard mutations,
- Route Handlers only when a stable HTTP endpoint is genuinely needed.

Do not create a REST API for every CMS action by default.

---

## 16. Caching/Revalidation

Published content may be cached.

After Publish/Archive/Redirect changes, revalidate:
- affected detail route,
- entity listing route,
- pages featuring that entity,
- related content pages when needed,
- sitemap if required.

Prefer targeted revalidation.

---

## 17. Metadata

Server-generated.

Fallback:
1. version SEO override,
2. version title/summary,
3. SiteSettings default.

Preview always forces noindex.

---

## 18. TipTap

- controlled extension list,
- structured JSON persistence,
- safe public renderer,
- no arbitrary scriptable HTML.

Public renderer should not require dashboard editor runtime.

---

## 19. Media Upload Flow

```text
Admin upload
↓
authorize
↓
validate file
↓
safe filename
↓
write to persistent storage
↓
extract metadata
↓
create Media row
↓
return Media
```

Do not use ephemeral build/container storage.

---

## 20. Media Serving

Separate:
```text
storagePath
public URL
```

Prefer stable static serving path suitable for public images.

Do not expose raw host paths.

---

## 21. Static Pages

Coded route/component + PageVersion data.

Example:
```text
Home component
↓
HOME Page
↓
published PageVersion
↓
validated HomePage schema
```

No generic block renderer.

---

## 22. Error Handling

Do not expose:
- stack traces,
- SQL errors,
- filesystem paths,
- secrets.

Public unknown/unpublished content:
- 404 unless secure Preview.

---

## 23. Query Performance

- avoid N+1,
- use selective `select/include`,
- paginate CMS lists,
- do not load rich bodies for tables,
- resolve only required published relations.

---

## 24. Environment Variables

Recommended:
```text
DATABASE_URL
AUTH_SECRET
APP_URL
UPLOAD_DIR
UPLOAD_PUBLIC_BASE
```

Add only required variables.

---

## 25. Security

Protect:
- dashboard,
- mutations,
- upload path,
- MIME/file validation,
- Preview,
- rich content,
- secrets,
- redirects.

---

## 26. Design Boundary

Architecture does not define visual identity.

Design skills control:
- colors,
- typography,
- detailed layout,
- visual system.

---

## 27. AI Guardrails

Must preserve:
- one Next.js app,
- Prisma/PostgreSQL,
- custom CMS,
- versioned public content,
- TipTap,
- local persistent media,
- `/guides` route for Article,
- `/prices` hub only,
- Redirect SEO behavior.

Do not add out-of-scope modules.
