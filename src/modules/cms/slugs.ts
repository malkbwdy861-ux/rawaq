import type { Prisma } from "@prisma/client";

export type CmsSlugContentType = "services" | "solutions" | "materials" | "projects" | "articles";

export function normalizeCmsSlug(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\p{Script=Arabic}-]+/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function encodeCmsSlug(slug: string) {
  return encodeURIComponent(slug);
}

export function decodeCmsSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function cmsContentPath(prefix: string, slug: string) {
  return `${prefix}/${encodeCmsSlug(slug)}`;
}

export async function generateUniqueCmsSlug({
  tx,
  contentType,
  contentId,
  source,
}: {
  tx: Prisma.TransactionClient;
  contentType: CmsSlugContentType;
  contentId: string;
  source: string;
}) {
  const baseSlug = normalizeCmsSlug(source);
  if (!baseSlug) throw new Error("تعذر إنشاء رابط مختصر من العنوان. استخدم عنوانًا يحتوي على أحرف أو أرقام صالحة.");

  const existingSlugs = new Set(await findExistingSlugs(tx, contentType, contentId, baseSlug));
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const slug = `${baseSlug}-${suffix}`;
    if (!existingSlugs.has(slug)) return slug;
  }

  throw new Error("تعذر إنشاء رابط مختصر فريد. جرّب عنوانًا مختلفًا.");
}

async function findExistingSlugs(tx: Prisma.TransactionClient, contentType: CmsSlugContentType, contentId: string, baseSlug: string) {
  const slugWhere = { startsWith: baseSlug };
  const select = { draftVersion: { select: { slug: true } }, publishedVersion: { select: { slug: true } } } as const;
  let records: { draftVersion: { slug: string | null } | null; publishedVersion: { slug: string | null } | null }[];

  switch (contentType) {
    case "services":
      records = await tx.service.findMany({ where: { id: { not: contentId }, OR: [{ draftVersion: { slug: slugWhere } }, { publishedVersion: { slug: slugWhere } }] }, select });
      break;
    case "solutions":
      records = await tx.solution.findMany({ where: { id: { not: contentId }, OR: [{ draftVersion: { slug: slugWhere } }, { publishedVersion: { slug: slugWhere } }] }, select });
      break;
    case "materials":
      records = await tx.material.findMany({ where: { id: { not: contentId }, OR: [{ draftVersion: { slug: slugWhere } }, { publishedVersion: { slug: slugWhere } }] }, select });
      break;
    case "projects":
      records = await tx.project.findMany({ where: { id: { not: contentId }, OR: [{ draftVersion: { slug: slugWhere } }, { publishedVersion: { slug: slugWhere } }] }, select });
      break;
    case "articles":
      records = await tx.article.findMany({ where: { id: { not: contentId }, OR: [{ draftVersion: { slug: slugWhere } }, { publishedVersion: { slug: slugWhere } }] }, select });
      break;
  }

  return records.flatMap((record) => [record.draftVersion?.slug, record.publishedVersion?.slug]).filter((slug): slug is string => Boolean(slug));
}
