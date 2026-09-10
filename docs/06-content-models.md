# Content Models Reference

## 1. Purpose

This document defines editable V1 content fields.

It guides:
- CMS forms,
- Zod schemas,
- Preview,
- Publish validation,
- public rendering.

Every public-facing field listed here is stored on the Draft/Published Version unless explicitly stated otherwise.

---

## 2. Shared Version Fields

Dynamic content versions may include:
- title/name,
- slug,
- short description/excerpt,
- content,
- hero/cover media,
- SEO,
- relations.

Stable entity lifecycle/status fields are not duplicated into the content version.

---

## 3. Shared SEO Fields

```text
seoTitle?
seoDescription?
canonicalUrl?
noIndex
openGraphTitle?
openGraphDescription?
openGraphImage?
```

---

## 4. ServiceVersion

Required for Publish:
```text
title
slug
shortDescription
content
```

Optional:
```text
heroMedia
relatedSolutions[]
relatedMaterials[]
relatedProjects[]
relatedArticles[]
faqs[]
SEO fields
```

---

## 5. SolutionVersion

Required for Publish:
```text
title
slug
shortDescription
content
```

Optional:
```text
heroMedia
relatedServices[]
relatedMaterials[]
relatedProjects[]
relatedArticles[]
faqs[]
SEO fields
```

---

## 6. MaterialVersion

Required for Publish:
```text
name
slug
shortDescription
content
```

Optional:
```text
advantages[]
limitations[]
maintenanceNotes
recommendedUses
heroMedia
relatedServices[]
relatedSolutions[]
relatedProjects[]
relatedArticles[]
faqs[]
SEO fields
```

Do not auto-generate technical claims.

---

## 7. ProjectVersion

Required for Publish:
```text
title
slug
shortDescription
```

Optional:
```text
content
challenge
solutionSummary
technicalDetails
completedAt
city
district
coverMedia
gallery[]
relatedServices[]
relatedSolutions[]
relatedMaterials[]
relatedArticles[]
SEO fields
```

Gallery item:
```text
media
sortOrder
caption?
```

Recommended public-quality guidance:
- at least one relevant Service where real,
- at least one real image where available.

Do not invent missing project facts.

---

## 8. ArticleVersion

Internal entity:
```text
Article
```

Public route:
```text
/guides/[slug]
```

Required for Publish:
```text
title
slug
excerpt
content
```

Optional:
```text
heroMedia
articleType
relatedServices[]
relatedSolutions[]
relatedMaterials[]
relatedProjects[]
faqs[]
SEO fields
```

If `articleType` is enabled:
```text
GUIDE
PRICING
COMPARISON
MAINTENANCE
GENERAL
```

Do not create separate content systems per type.

---

## 9. TipTap Model

Store structured TipTap JSON.

Recommended allowed features:
- paragraphs,
- headings,
- bold,
- italic,
- bullet list,
- ordered list,
- blockquote,
- links,
- media embeds if required,
- tables only if actual content requires them.

Do not allow arbitrary unsafe HTML or scripts.

---

## 10. FAQVersion

Required:
```text
question
answer
```

Optional:
```text
sortOrder
```

FAQ entity relationships are selected by parent content versions or approved FAQ relation model.

---

## 11. Home PageVersion

Fixed-layout schema:

```text
hero:
  title
  description
  primaryCtaText
  primaryCtaTarget
  secondaryCtaText?
  secondaryCtaTarget?
  mediaId?

featuredServices:
  title?
  description?
  selectedServiceIds[]

featuredSolutions:
  title?
  description?
  selectedSolutionIds[]

featuredProjects:
  title?
  description?
  selectedProjectIds[]

trustSection:
  title?
  description?
  items[]
    title
    description

faqSection:
  title?
  selectedFaqIds[]

finalCta:
  title
  description?
  buttonText
  target
```

Selections reference stable entities; public rendering resolves their Published versions.

No arbitrary blocks.

---

## 12. About PageVersion

```text
hero:
  title
  description
  mediaId?

companyStory:
  title
  content

values:
  title?
  items[]
    title
    description

capabilities:
  title?
  content?

finalCta:
  title
  description?
  buttonText
  target
```

Do not invent mission/vision sections unless requested.

---

## 13. Contact PageVersion

```text
hero:
  title
  description

contactIntro:
  title?
  description?

showPhone
showWhatsapp
showEmail
showAddress
showBusinessHours

finalCta:
  title?
  description?
```

Actual contact values come from SiteSettings.

---

## 14. Prices PageVersion

`/prices` is a fixed hub.

```text
hero:
  title
  description

intro:
  title?
  content

pricingFactors:
  title
  items[]
    title
    description

selectedPricingArticleIds[]

faqSection:
  selectedFaqIds[]

finalCta:
  title
  description?
  buttonText
  target
```

Selected pricing articles are Article entities rendered publicly under `/guides`.

Do not add `/prices/[slug]`.

Do not invent prices.

---

## 15. SiteSettings

Not versioned in V1.

### Company
```text
companyName
companyDescription?
logoMediaId?
address?
businessHours?
```

### Contact
```text
primaryPhone
secondaryPhone?
whatsappNumber
email?
```

### Social
```text
facebook?
instagram?
x?
tiktok?
youtube?
linkedin?
```

### SEO Defaults
```text
defaultSeoTitle?
defaultSeoDescription?
defaultOpenGraphImageId?
```

### CTA Defaults
```text
defaultWhatsappText?
defaultCallText?
```

---

## 16. Media Editable Metadata

Editable:
```text
altText?
caption?
```

System-managed:
```text
originalFilename
storedFilename
url
storagePath
mimeType
sizeBytes
width?
height?
createdAt
```

Administrators do not manually edit storage paths.

---

## 17. Redirect Model

```text
sourcePath
destinationPath
statusCode = 301
```

Normally generated by Publish when a published slug changes.

May be manually managed only through SEO/Redirect admin tooling if implemented.

---

## 18. Structured WhatsApp Input

Non-persisted input may include:
```text
serviceId?
solutionId?
materialId?
dimensions?
city?
district?
notes?
```

Used only to compose a WhatsApp message.

---

## 19. Publish Validation

Drafts may be incomplete.

Publish validates:
- required title/name,
- valid slug,
- required summary/content,
- valid relationships,
- safe structured content,
- route collision rules.

Optional SEO overrides should not block publishing when valid defaults exist.

---

## 20. Localization

Do not invent multilingual content storage.

If V1 is Arabic-only, use one value per field.

Add multilingual structure only after explicit approval.

---

## 21. AI Guardrails

Do not:
- add extra fields without reference support,
- add testimonials,
- add leads/customers,
- convert Pages into block builders,
- duplicate SiteSettings values in Page data,
- store relationships as comma-separated text,
- create `/articles`,
- create `/prices/[slug]`.
