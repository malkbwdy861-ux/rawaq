import { Prisma, type PageKey } from "@prisma/client";

import { uniqueIds } from "./reference-values.ts";

export { retainExistingSelectedIds, uniqueIds } from "./reference-values.ts";

export type CmsReferenceKind = "service" | "solution" | "material" | "project" | "article" | "faq" | "media";

type EntityIdGroups = Partial<Record<Exclude<CmsReferenceKind, "media">, string[]>>;

const pageArrayKeys: Record<Exclude<CmsReferenceKind, "material" | "media">, string> = {
  service: "selectedServiceIds",
  solution: "selectedSolutionIds",
  project: "selectedProjectIds",
  article: "selectedPricingArticleIds",
  faq: "selectedFaqIds",
};

const pageMediaKeys = new Set(["mediaId", "backgroundMediaId"]);

export type ExistingCmsReferenceIds = Record<CmsReferenceKind, ReadonlySet<string>>;

export function removePageReference(data: Prisma.JsonValue, kind: CmsReferenceKind, id: string): Prisma.JsonValue {
  if (Array.isArray(data)) return data.map((value) => removePageReference(value, kind, id));
  if (!data || typeof data !== "object") return data;

  const arrayKey = kind === "material" || kind === "media" ? null : pageArrayKeys[kind];
  return Object.fromEntries(Object.entries(data).map(([key, value]) => {
    if (arrayKey === key && Array.isArray(value)) return [key, value.filter((item) => item !== id)];
    if (kind === "media" && pageMediaKeys.has(key) && value === id) return [key, ""];
    return [key, removePageReference(value ?? null, kind, id)];
  })) as Prisma.JsonObject;
}

export function sanitizePageReferences(data: Prisma.JsonValue, existing: ExistingCmsReferenceIds): Prisma.JsonValue {
  if (Array.isArray(data)) return data.map((value) => sanitizePageReferences(value, existing));
  if (!data || typeof data !== "object") return data;

  return Object.fromEntries(Object.entries(data).map(([key, value]) => {
    const kind = Object.entries(pageArrayKeys).find(([, arrayKey]) => arrayKey === key)?.[0] as Exclude<CmsReferenceKind, "material" | "media"> | undefined;
    if (kind && Array.isArray(value)) {
      return [key, uniqueIds(value.filter((item): item is string => typeof item === "string" && existing[kind].has(item)))];
    }
    if (pageMediaKeys.has(key) && typeof value === "string" && value && !existing.media.has(value)) return [key, ""];
    return [key, sanitizePageReferences(value ?? null, existing)];
  })) as Prisma.JsonObject;
}

export function getPageMediaReferenceIds(data: Prisma.JsonValue): string[] {
  if (Array.isArray(data)) return uniqueIds(data.flatMap(getPageMediaReferenceIds));
  if (!data || typeof data !== "object") return [];
  return uniqueIds(Object.entries(data).flatMap(([key, value]) => {
    if (pageMediaKeys.has(key) && typeof value === "string" && value) return [value];
    return getPageMediaReferenceIds(value ?? null);
  }));
}

export async function cleanupCmsEntityReferences(tx: Prisma.TransactionClient, kind: CmsReferenceKind, id: string) {
  if (kind === "service") await Promise.all([
    tx.solutionVersionService.deleteMany({ where: { serviceId: id } }),
    tx.materialVersionService.deleteMany({ where: { serviceId: id } }),
    tx.projectVersionService.deleteMany({ where: { serviceId: id } }),
    tx.articleVersionService.deleteMany({ where: { serviceId: id } }),
  ]);
  if (kind === "solution") await Promise.all([
    tx.serviceVersionSolution.deleteMany({ where: { solutionId: id } }),
    tx.materialVersionSolution.deleteMany({ where: { solutionId: id } }),
    tx.projectVersionSolution.deleteMany({ where: { solutionId: id } }),
    tx.articleVersionSolution.deleteMany({ where: { solutionId: id } }),
  ]);
  if (kind === "material") await Promise.all([
    tx.serviceVersionMaterial.deleteMany({ where: { materialId: id } }),
    tx.solutionVersionMaterial.deleteMany({ where: { materialId: id } }),
    tx.projectVersionMaterial.deleteMany({ where: { materialId: id } }),
    tx.articleVersionMaterial.deleteMany({ where: { materialId: id } }),
  ]);
  if (kind === "project") await Promise.all([
    tx.serviceVersionProject.deleteMany({ where: { projectId: id } }),
    tx.solutionVersionProject.deleteMany({ where: { projectId: id } }),
    tx.materialVersionProject.deleteMany({ where: { projectId: id } }),
    tx.articleVersionProject.deleteMany({ where: { projectId: id } }),
  ]);
  if (kind === "article") await Promise.all([
    tx.serviceVersionArticle.deleteMany({ where: { articleId: id } }),
    tx.solutionVersionArticle.deleteMany({ where: { articleId: id } }),
    tx.materialVersionArticle.deleteMany({ where: { articleId: id } }),
    tx.projectVersionArticle.deleteMany({ where: { articleId: id } }),
  ]);
  if (kind === "faq") await Promise.all([
    tx.serviceVersionFAQ.deleteMany({ where: { faqId: id } }),
    tx.solutionVersionFAQ.deleteMany({ where: { faqId: id } }),
    tx.materialVersionFAQ.deleteMany({ where: { faqId: id } }),
    tx.articleVersionFAQ.deleteMany({ where: { faqId: id } }),
  ]);
  if (kind === "media") await Promise.all([
    tx.serviceVersion.updateMany({ where: { heroMediaId: id }, data: { heroMediaId: null } }),
    tx.serviceVersion.updateMany({ where: { openGraphImageId: id }, data: { openGraphImageId: null } }),
    tx.solutionVersion.updateMany({ where: { heroMediaId: id }, data: { heroMediaId: null } }),
    tx.solutionVersion.updateMany({ where: { openGraphImageId: id }, data: { openGraphImageId: null } }),
    tx.materialVersion.updateMany({ where: { heroMediaId: id }, data: { heroMediaId: null } }),
    tx.materialVersion.updateMany({ where: { openGraphImageId: id }, data: { openGraphImageId: null } }),
    tx.projectVersion.updateMany({ where: { coverMediaId: id }, data: { coverMediaId: null } }),
    tx.projectVersion.updateMany({ where: { openGraphImageId: id }, data: { openGraphImageId: null } }),
    tx.articleVersion.updateMany({ where: { heroMediaId: id }, data: { heroMediaId: null } }),
    tx.articleVersion.updateMany({ where: { openGraphImageId: id }, data: { openGraphImageId: null } }),
    tx.pageVersion.updateMany({ where: { openGraphImageId: id }, data: { openGraphImageId: null } }),
    tx.siteSettings.updateMany({ where: { logoMediaId: id }, data: { logoMediaId: null } }),
    tx.siteSettings.updateMany({ where: { defaultOpenGraphImageId: id }, data: { defaultOpenGraphImageId: null } }),
    tx.projectVersionGallery.deleteMany({ where: { mediaId: id } }),
  ]);

  if (kind !== "material") await cleanupPageVersionReferences(tx, kind, id);
}

export async function assertCmsEntityIdsExist(tx: Prisma.TransactionClient, groups: EntityIdGroups) {
  await Promise.all(Object.entries(groups).map(async ([kind, rawIds]) => {
    const ids = uniqueIds(rawIds ?? []);
    if (!ids.length) return;
    let found: { id: string }[] = [];
    if (kind === "service") found = await tx.service.findMany({ where: { id: { in: ids } }, select: { id: true } });
    if (kind === "solution") found = await tx.solution.findMany({ where: { id: { in: ids } }, select: { id: true } });
    if (kind === "material") found = await tx.material.findMany({ where: { id: { in: ids } }, select: { id: true } });
    if (kind === "project") found = await tx.project.findMany({ where: { id: { in: ids } }, select: { id: true } });
    if (kind === "article") found = await tx.article.findMany({ where: { id: { in: ids } }, select: { id: true } });
    if (kind === "faq") found = await tx.fAQ.findMany({ where: { id: { in: ids } }, select: { id: true } });
    if (found.length !== ids.length) throw new Error("أحد العناصر المرتبطة المحددة لم يعد موجوداً.");
  }));
}

export const cmsReferencePagePaths: Record<PageKey, string> = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRICES: "/prices",
  FAQS: "/faqs",
  PROJECTS: "/projects",
  SERVICES: "/services",
  SOLUTIONS: "/solutions",
  GUIDES: "/guides",
  MATERIALS: "/materials",
};

async function cleanupPageVersionReferences(tx: Prisma.TransactionClient, kind: CmsReferenceKind, id: string) {
  const versions = await tx.pageVersion.findMany({ where: { data: { not: Prisma.JsonNull } }, select: { id: true, data: true } });
  for (const version of versions) {
    const cleaned = removePageReference(version.data, kind, id);
    if (JSON.stringify(cleaned) !== JSON.stringify(version.data)) {
      await tx.pageVersion.update({ where: { id: version.id }, data: { data: cleaned as Prisma.InputJsonValue } });
    }
  }
}
