import { ContentStatus, type PageKey } from "@prisma/client";
import { notFound } from "next/navigation";

import type { CmsRelationOption } from "@/modules/cms/types";
import { prisma } from "@/server/db/prisma";

import { parseSocialLinks } from "@/modules/settings/queries";

import { pageDraftSchemas, pagePublishSchemas, type StaticPageData } from "./validation";

export const pageDefinitions = [
  { key: "HOME", label: "الرئيسية", path: "/" },
  { key: "ABOUT", label: "من نحن", path: "/about" },
  { key: "CONTACT", label: "التواصل", path: "/contact" },
  { key: "PRICES", label: "الأسعار", path: "/prices" },
] as const satisfies { key: PageKey; label: string; path: string }[];

export async function getPageList() {
  return prisma.page.findMany({ where: { key: { in: pageDefinitions.map((page) => page.key) } }, include: { draftVersion: true, publishedVersion: true } });
}

export async function getPageEditorData(key: PageKey) {
  const [page, media, relationOptions] = await Promise.all([
    prisma.page.findUnique({ where: { key }, include: { draftVersion: true, publishedVersion: true } }),
    prisma.media.findMany({ where: { type: "IMAGE" }, orderBy: { createdAt: "desc" }, take: 80 }),
    getPageRelationOptions(key),
  ]);
  if (!page) notFound();
  const data = page.draftVersion?.data ? pageDraftSchemas[key].safeParse(page.draftVersion.data) : null;
  return { page, draftData: data?.success ? data.data : null, media, relationOptions };
}

export async function getPublishedPage(key: PageKey) {
  const page = await prisma.page.findFirst({ where: { key, status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, include: { publishedVersion: { include: { openGraphImage: true } } } });
  if (!page?.publishedVersion?.data) notFound();
  const parsed = pagePublishSchemas[key].safeParse(page.publishedVersion.data);
  if (!parsed.success) notFound();
  return { page, version: page.publishedVersion, data: parsed.data, resolved: await resolveSelections(key, parsed.data, false) };
}

export async function getPagePreview(key: PageKey) {
  const page = await prisma.page.findUnique({ where: { key }, include: { draftVersion: { include: { openGraphImage: true } } } });
  if (!page?.draftVersion?.data) notFound();
  const parsed = pageDraftSchemas[key].safeParse(page.draftVersion.data);
  if (!parsed.success) notFound();
  return { page, version: page.draftVersion, data: parsed.data, resolved: await resolveSelections(key, parsed.data, true) };
}

async function getPageRelationOptions(key: PageKey) {
  const faqsPromise = prisma.fAQ.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } });
  if (key === "HOME") {
    const [services, solutions, projects, faqs] = await Promise.all([
      prisma.service.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
      prisma.solution.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
      prisma.project.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
      faqsPromise,
    ]);
    return { services: options(services, "title", "خدمة بدون عنوان"), solutions: options(solutions, "title", "حل بدون عنوان"), projects: options(projects, "title", "مشروع بدون عنوان"), faqs: faqOptions(faqs), articles: [] };
  }
  if (key === "PRICES") {
    const [articles, faqs] = await Promise.all([prisma.article.findMany({ where: { OR: [{ draftVersion: { articleType: "PRICING" } }, { publishedVersion: { articleType: "PRICING" } }] }, include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }), faqsPromise]);
    return { services: [], solutions: [], projects: [], faqs: faqOptions(faqs), articles: options(articles, "title", "مقال بدون عنوان") };
  }
  return { services: [], solutions: [], projects: [], faqs: [], articles: [] } as { services: CmsRelationOption[]; solutions: CmsRelationOption[]; projects: CmsRelationOption[]; faqs: CmsRelationOption[]; articles: CmsRelationOption[] };
}

function options<T extends { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; draftVersion: Record<string, unknown> | null; publishedVersion: Record<string, unknown> | null }>(items: T[], field: string, fallback: string): CmsRelationOption[] {
  return items.map((item) => ({ id: item.id, label: String(item.draftVersion?.[field] ?? item.publishedVersion?.[field] ?? fallback), status: item.status }));
}
function faqOptions<T extends { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; draftVersion: { question: string | null } | null; publishedVersion: { question: string | null } | null }>(items: T[]): CmsRelationOption[] { return items.map((item) => ({ id: item.id, label: item.draftVersion?.question ?? item.publishedVersion?.question ?? "سؤال بدون عنوان", status: item.status })); }

async function resolveSelections(key: PageKey, data: StaticPageData, preview: boolean) {
  const versionInclude = preview ? { draftVersion: true, publishedVersion: true } : { publishedVersion: true };
  const statusWhere = preview ? {} : { status: ContentStatus.PUBLISHED };
  const heroMediaId = "mediaId" in data.hero ? data.hero.mediaId || null : null;
  const homeData = key === "HOME" ? data as Extract<StaticPageData, { featuredServices: unknown }> : null;
  const pricesData = key === "PRICES" ? data as Extract<StaticPageData, { selectedPricingArticleIds: unknown }> : null;
  const [heroMedia, services, solutions, materials, projects, articles, faqs, settings] = await Promise.all([
    heroMediaId ? prisma.media.findUnique({ where: { id: heroMediaId } }) : null,
    homeData ? prisma.service.findMany({ where: { id: { in: homeData.featuredServices.selectedServiceIds }, ...statusWhere }, include: versionInclude }) : key === "CONTACT" ? prisma.service.findMany({ where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, include: { publishedVersion: true }, orderBy: { updatedAt: "desc" }, take: 80 }) : [],
    homeData ? prisma.solution.findMany({ where: { id: { in: homeData.featuredSolutions.selectedSolutionIds }, ...statusWhere }, include: versionInclude }) : key === "CONTACT" ? prisma.solution.findMany({ where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, include: { publishedVersion: true }, orderBy: { updatedAt: "desc" }, take: 80 }) : [],
    key === "CONTACT" ? prisma.material.findMany({ where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, include: { publishedVersion: true }, orderBy: { updatedAt: "desc" }, take: 80 }) : [],
    homeData ? prisma.project.findMany({ where: { id: { in: homeData.featuredProjects.selectedProjectIds }, ...statusWhere }, include: { ...versionInclude, publishedVersion: { include: { coverMedia: true } }, ...(preview ? { draftVersion: { include: { coverMedia: true } } } : {}) } }) : [],
    pricesData ? prisma.article.findMany({ where: { id: { in: pricesData.selectedPricingArticleIds }, ...statusWhere }, include: versionInclude }) : [],
    (homeData || pricesData) ? prisma.fAQ.findMany({ where: { id: { in: (homeData ?? pricesData)!.faqSection.selectedFaqIds }, ...statusWhere }, include: versionInclude }) : [],
    key === "CONTACT" ? prisma.siteSettings.findFirst({ include: { defaultOpenGraphImage: true } }) : null,
  ]);
  return { heroMedia, services, solutions, materials, projects, articles, faqs, settings: settings ? { ...settings, socialLinks: parseSocialLinks(settings.socialLinks) } : null, preview };
}
