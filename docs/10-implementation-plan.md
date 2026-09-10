# Implementation Plan Reference

## 1. Purpose

Defines the recommended implementation sequence.

Goals:
- reduce rework,
- keep AI coding sessions scoped,
- respect dependencies,
- preserve architecture,
- prevent feature creep.

---

## 2. Working Method

Do not implement the entire project in one AI coding session.

Recommended:
1. inspect current code,
2. load relevant reference files,
3. implement one bounded phase,
4. type-check/build/test,
5. review against acceptance criteria,
6. continue to next phase.

---

## 3. Phase 0 — Foundation

Tasks:
- Next.js + TypeScript foundation,
- Tailwind,
- shadcn/ui,
- env setup,
- PostgreSQL,
- Prisma,
- source structure,
- lint/type-check/build.

Done when:
- app builds,
- DB connects,
- migrations work,
- architecture baseline exists.

---

## 4. Phase 1 — Auth + Dashboard Shell

Tasks:
- AdminUser,
- Auth.js,
- login/logout,
- protect `/dashboard`,
- server authorization,
- dashboard navigation shell.

Done when:
- anonymous access blocked,
- admin access works,
- mutations require authorization.

---

## 5. Phase 2 — Core Database + Versioning

Implement:
- Service/ServiceVersion,
- Solution/SolutionVersion,
- Material/MaterialVersion,
- Project/ProjectVersion,
- Article/ArticleVersion,
- FAQ/FAQVersion,
- Page/PageVersion,
- Media,
- SiteSettings,
- AdminUser,
- Redirect,
- version-specific relationship tables,
- publication pointers.

Critical acceptance:
- Draft field changes do not alter Published output,
- Draft relationship changes do not alter Published output,
- Draft slug changes do not alter public route before Publish.

---

## 6. Phase 3 — Shared CMS Infrastructure

Build:
- reusable forms,
- list patterns,
- search/status filters,
- pagination,
- slug field validation,
- relation selectors,
- Draft save action,
- Publish action pattern,
- Archive action,
- loading/empty/error states.

Do not build a generic CMS framework or page builder.

---

## 7. Phase 4 — Media

Tasks:
- persistent volume path,
- upload validation,
- safe filenames,
- neutral date/ID folder strategy,
- metadata extraction,
- Media records,
- media browser/picker,
- safe deletion,
- media serving.

Done when:
- uploads survive deployment setup,
- existing Media can be reused,
- unauthorized uploads fail.

---

## 8. Phase 5 — Services

Implement complete vertical slice:
- Service CMS list/create/edit,
- Draft,
- Preview,
- Publish,
- Archive,
- SEO,
- media,
- relationships,
- public `/services`,
- public `/services/[slug]`.

Done when a new Service can be created and published without code changes.

---

## 9. Phase 6 — Materials + Solutions

Repeat complete vertical slices for:
- Material,
- Solution.

Verify relationship versioning.

---

## 10. Phase 7 — Projects

Tasks:
- Project CMS,
- location fields,
- ordered versioned gallery,
- relationships,
- Preview/Publish,
- public listing/detail,
- related-content rendering.

Done when a real project can be published entirely through CMS.

---

## 11. Phase 8 — Articles + TipTap

Tasks:
- TipTap configuration,
- controlled extensions,
- JSON persistence,
- Article CMS,
- relationships,
- Preview/Publish,
- public `/guides`,
- public `/guides/[slug]`.

Do not create `/articles`.

---

## 12. Phase 9 — FAQs + Static Pages

Tasks:
- FAQ publishing,
- Page schemas,
- Home editor,
- About editor,
- Contact editor,
- Prices editor,
- Preview/Publish.

Prices rule:
- `/prices` fixed hub,
- selected pricing Articles link to `/guides/[slug]`,
- no `/prices/[slug]`.

---

## 13. Phase 10 — Site Settings + Contact

Tasks:
- company settings,
- contact settings,
- social settings,
- default SEO/CTA,
- phone actions,
- WhatsApp structured message builder.

No Lead/Quote persistence.

---

## 14. Phase 11 — Redirects + SEO Technical Layer

Tasks:
- Redirect entity/admin tooling,
- publish-time slug-change redirect creation,
- redirect resolution,
- dynamic metadata,
- canonical,
- Open Graph,
- robots,
- sitemap,
- noindex enforcement,
- structured data,
- breadcrumbs,
- internal-linking rules.

Done when old Published slug preserves SEO through redirect after republish.

---

## 15. Phase 12 — Publishing Hardening

Cross-module verification:
- immutable Published snapshots,
- editable Draft snapshots,
- relationship snapshot correctness,
- gallery snapshot correctness,
- page selections correctness,
- Preview security,
- publish transaction,
- targeted revalidation,
- archive behavior.

This phase is mandatory.

---

## 16. Phase 13 — QA + Security

Test:
- auth,
- authorization,
- form validation,
- upload validation,
- XSS/rich-text safety,
- slug collision,
- Redirect loops,
- Draft leakage,
- Preview protection,
- sitemap,
- robots,
- 404s,
- media persistence,
- relation queries,
- build/type-check/lint.

---

## 17. Phase 14 — Deployment + Backup

Tasks:
- production env,
- PostgreSQL production setup,
- Prisma migrations,
- persistent upload volume,
- DB backup,
- uploads backup,
- restore verification,
- domain/SSL,
- health checks.

---

## 18. Suggested AI Sessions

```text
01 Foundation
02 Auth + Dashboard shell
03 Database + Versioning
04 Shared CMS infrastructure
05 Media
06 Services
07 Materials + Solutions
08 Projects
09 Articles + TipTap
10 FAQs + Static Pages
11 Settings + WhatsApp
12 Redirects + SEO
13 Publishing hardening
14 QA + Security
15 Deployment
```

---

## 19. Session Prompt Requirements

Each coding session should state:
- exact phase,
- relevant reference files,
- current codebase state,
- allowed scope,
- explicit non-goals,
- acceptance criteria,
- instruction to inspect before modifying,
- instruction not to rewrite unrelated working code.

Recommended instruction:

> Inspect the current implementation and the provided reference files first. Implement only the requested phase. Preserve existing architecture. Do not add unapproved features or redesign unrelated modules.

---

## 20. Dependencies

Do not:
- build content CRUD before schema/versioning,
- build Project gallery before Media,
- expose Preview before secure Draft resolution,
- build sitemap before publication state works,
- deploy before persistent uploads exist,
- implement slug change without Redirect behavior.

---

## 21. Definition of Done

Every phase must pass:
- type-check,
- production build,
- relevant automated tests,
- manual acceptance checks,
- architecture/reference review.

Generated code alone is not completion.

---

## 22. Design Separation

Design skills/workflows are separate.

Implementation references are authoritative for:
- behavior,
- data,
- scope,
- architecture.

Design outputs are authoritative for:
- colors,
- typography,
- identity,
- visual layout,
- styling.

---

## 23. V1 Final Acceptance

V1 complete when:
- all required dynamic entities work,
- static Pages are editable with fixed schemas,
- Media is persistent,
- TipTap is safe,
- Draft/Preview/Publish is correct,
- published slug changes redirect correctly,
- SEO is correct,
- WhatsApp/phone conversion works,
- no out-of-scope systems were added.
