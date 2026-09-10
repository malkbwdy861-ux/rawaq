# SEO Architecture Reference

## 1. Purpose

Defines technical SEO rules.

This document does not define keyword research or invent new landing pages.

---

## 2. Indexable Content

Indexable when Published:
- Home,
- Service pages,
- Solution pages,
- Material pages,
- Project pages,
- Guides,
- approved fixed Pages.

Not indexable:
- Dashboard,
- auth routes,
- Preview,
- Drafts,
- Archived content,
- internal APIs,
- admin utilities.

---

## 3. Canonical Routes

```text
/services/[slug]
/solutions/[slug]
/materials/[slug]
/projects/[slug]
/guides/[slug]
```

Internal `Article` = public `Guide`.

Do not create `/articles`.

Pricing:
```text
/prices
```
is the canonical pricing hub.

Detailed pricing content:
```text
/guides/[slug]
```

Do not create `/prices/[slug]` in V1.

---

## 4. Metadata Fallback

Title:
1. `seoTitle`,
2. content title + site name,
3. SiteSettings fallback.

Description:
1. `seoDescription`,
2. shortDescription/excerpt,
3. SiteSettings fallback.

Open Graph:
1. explicit OG override,
2. standard SEO/content values,
3. SiteSettings fallback.

---

## 5. Canonical URLs

Default:
- canonical public Published URL.

Manual canonical override only where intentionally required.

Preview:
- must not become canonical public content,
- noindex/nofollow.

---

## 6. Sitemap

Include only current Published public URLs.

Include:
- static public routes,
- Services,
- Solutions,
- Materials,
- Projects,
- Guides.

Exclude:
- Drafts,
- Archived,
- Dashboard,
- Preview,
- Redirect source URLs,
- internal routes.

Use reliable `lastModified`.

---

## 7. Robots

Production robots should normally:
- allow public crawling,
- block dashboard/internal utility paths,
- reference sitemap.

Never deploy accidental:
```text
Disallow: /
```

Example policy:
```text
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /preview/
Sitemap: https://production-domain.example/sitemap.xml
```

Exact generated format follows Next.js.

---

## 8. Draft and Preview

Critical:
- noindex,
- nofollow,
- not in sitemap,
- not public listing,
- secure access.

This overrides any Draft version `noIndex` setting.

---

## 9. Archived Content

Archived:
- removed from public listings,
- removed from sitemap,
- noindex.

If old URL has SEO value:
- use editorial redirect decision where appropriate.

---

## 10. Slug Changes and Redirects

Slug belongs to version.

When a Published entity changes slug and the new Draft is published:

```text
old Published path
↓ 301
new Published path
```

Store Redirect.

Rules:
- prevent loops,
- avoid chains when possible,
- keep source unique,
- do not redirect source to itself.

---

## 11. Structured Data

Use only relevant schema matching visible content.

Potential:
- Organization / LocalBusiness,
- Service,
- Article,
- FAQPage,
- BreadcrumbList.

Do not add schema merely to maximize markup.

FAQPage schema only when visible FAQ content satisfies requirements.

---

## 12. Local SEO

Use real business information:
- name,
- phone,
- address,
- service area,
- business hours.

Do not invent:
- branches,
- service areas,
- neighborhoods,
- city coverage.

---

## 13. Internal Linking

Use real relationships.

Examples:
- Service → Materials,
- Service → Projects,
- Project → Service,
- Guide → relevant Service,
- Material → relevant Projects.

Avoid keyword-stuffed sitewide link farms.

---

## 14. Breadcrumbs

Examples:
```text
Home > Services > Car Shades
Home > Projects > Project Name
Home > Guides > Guide Name
```

Match real route semantics.

---

## 15. Pricing SEO

`/prices`:
- overview/hub,
- explains pricing factors,
- links to relevant pricing Guides.

Price-specific intent pages are Article/Guide content under `/guides`.

Do not invent fixed prices.

---

## 16. Project SEO

Projects should use unique real information.

Avoid thin image-only pages where possible.

Never fabricate:
- city,
- materials,
- technical details,
- project scope.

---

## 17. Image SEO

Media supports:
- alt text,
- dimensions,
- optimized rendering.

Do not keyword-stuff alt text.

---

## 18. Performance

Support SEO with:
- server-rendered content,
- optimized images,
- narrow client boundaries,
- stable layout,
- reasonable Core Web Vitals.

---

## 19. Search Console Readiness

Before launch verify:
- correct robots,
- valid sitemap,
- production canonicals,
- no staging noindex,
- no accidental public Drafts,
- domain metadata is correct.

---

## 20. AI Guardrails

Do not:
- invent keyword pages,
- create duplicate intent pages,
- create neighborhood pages automatically,
- invent prices,
- create `/articles`,
- create `/prices/[slug]`,
- expose Draft,
- add structured data not supported by visible content.
