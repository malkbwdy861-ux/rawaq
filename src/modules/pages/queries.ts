import { ContentStatus, type PageKey } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

import type { CmsRelationOption } from "@/modules/cms/types";
import { getRecentImageMedia, includeSelectedImageMedia } from "@/modules/media/queries";
import { prisma } from "@/server/db/prisma";

import { parseSocialLinks } from "@/modules/settings/queries";

import { pageDraftSchemas, pagePublishSchemas, type StaticPageData } from "./validation";

export const pageDefinitions = [
  { key: "HOME", label: "الرئيسية", path: "/" },
  { key: "ABOUT", label: "من نحن", path: "/about" },
  { key: "CONTACT", label: "التواصل", path: "/contact" },
  { key: "PRICES", label: "الأسعار", path: "/prices" },
  { key: "PROJECTS", label: "المشاريع", path: "/projects" },
  { key: "SERVICES", label: "الخدمات", path: "/services" },
  { key: "SOLUTIONS", label: "الحلول", path: "/solutions" },
] as const satisfies { key: PageKey; label: string; path: string }[];

export async function getPageList() {
  return prisma.page.findMany({ where: { key: { in: pageDefinitions.map((page) => page.key) } }, select: { key: true } });
}

export async function getPageEditorData(key: PageKey) {
  const [page, media, relationOptions] = await Promise.all([
    prisma.page.findUnique({ where: { key }, include: { draftVersion: true, publishedVersion: true } }),
    getRecentImageMedia(),
    getPageRelationOptions(key),
  ]);
  if (!page) notFound();
  const data = page.draftVersion?.data ? pageDraftSchemas[key].safeParse(page.draftVersion.data) : null;
  const draftData = data?.success ? data.data : null;
  const selectedMediaIds = draftData ? getSelectedPageMediaIds(key, draftData, page.draftVersion?.openGraphImageId) : [];
  return { page, draftData, media: await includeSelectedImageMedia(media, selectedMediaIds), relationOptions };
}

export const getPublishedPage = cache(async (key: PageKey) => {
  const page = await prisma.page.findFirst({ where: { key, status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, include: { publishedVersion: { include: { openGraphImage: true } } } });
  if (!page?.publishedVersion?.data) notFound();
  const parsed = pagePublishSchemas[key].safeParse(page.publishedVersion.data);
  if (!parsed.success) notFound();
  return { page, version: page.publishedVersion, data: parsed.data, resolved: await resolveSelections(key, parsed.data, false) };
});

export async function getPagePreview(key: PageKey) {
  const page = await prisma.page.findUnique({ where: { key }, include: { draftVersion: { include: { openGraphImage: true } } } });
  if (!page?.draftVersion?.data) notFound();
  const parsed = pageDraftSchemas[key].safeParse(page.draftVersion.data);
  if (!parsed.success) notFound();
  return { page, version: page.draftVersion, data: parsed.data, resolved: await resolveSelections(key, parsed.data, true) };
}

async function getPageRelationOptions(key: PageKey) {
  const faqsPromise = prisma.fAQ.findMany({ select: { id: true, status: true, draftVersion: { select: { question: true } }, publishedVersion: { select: { question: true } } }, orderBy: { updatedAt: "desc" } });
  if (key === "HOME") {
    const [services, solutions, projects, faqs] = await Promise.all([
      prisma.service.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, heroMedia: { select: { url: true } } } }, publishedVersion: { select: { title: true, heroMedia: { select: { url: true } } } } }, orderBy: { updatedAt: "desc" } }),
      prisma.solution.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true } }, publishedVersion: { select: { title: true } } }, orderBy: { updatedAt: "desc" } }),
      prisma.project.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, coverMedia: { select: { url: true } } } }, publishedVersion: { select: { title: true, coverMedia: { select: { url: true } } } } }, orderBy: { updatedAt: "desc" } }),
      faqsPromise,
    ]);
    return { services: options(services, "title", "خدمة بدون عنوان"), solutions: options(solutions, "title", "حل بدون عنوان"), projects: options(projects, "title", "مشروع بدون عنوان"), faqs: faqOptions(faqs), articles: [] };
  }
  if (key === "PRICES") {
    const [articles, faqs] = await Promise.all([prisma.article.findMany({ where: { OR: [{ draftVersion: { articleType: "PRICING" } }, { publishedVersion: { articleType: "PRICING" } }] }, select: { id: true, status: true, draftVersion: { select: { title: true } }, publishedVersion: { select: { title: true } } }, orderBy: { updatedAt: "desc" } }), faqsPromise]);
    return { services: [], solutions: [], projects: [], faqs: faqOptions(faqs), articles: options(articles, "title", "مقال بدون عنوان") };
  }
  return { services: [], solutions: [], projects: [], faqs: [], articles: [] } as { services: CmsRelationOption[]; solutions: CmsRelationOption[]; projects: CmsRelationOption[]; faqs: CmsRelationOption[]; articles: CmsRelationOption[] };
}

function options<T extends { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; draftVersion: Record<string, unknown> | null; publishedVersion: Record<string, unknown> | null }>(items: T[], field: string, fallback: string): CmsRelationOption[] {
  return items.map((item) => ({
    id: item.id,
    label: String(item.draftVersion?.[field] ?? item.publishedVersion?.[field] ?? fallback),
    imageUrl: relationImageUrl(item.draftVersion) ?? relationImageUrl(item.publishedVersion),
    status: item.status,
  }));
}
function relationImageUrl(version: Record<string, unknown> | null) {
  const media = version?.heroMedia ?? version?.coverMedia;
  if (!media || typeof media !== "object" || !("url" in media)) return undefined;
  return typeof media.url === "string" ? media.url : undefined;
}
function faqOptions<T extends { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; draftVersion: { question: string | null } | null; publishedVersion: { question: string | null } | null }>(items: T[]): CmsRelationOption[] { return items.map((item) => ({ id: item.id, label: item.draftVersion?.question ?? item.publishedVersion?.question ?? "سؤال بدون عنوان", status: item.status })); }

async function resolveSelections(key: PageKey, data: StaticPageData, preview: boolean) {
  const versionInclude = preview ? { draftVersion: true, publishedVersion: true } : { publishedVersion: true };
  const serviceVersionInclude = preview
    ? { draftVersion: { include: { heroMedia: true } }, publishedVersion: { include: { heroMedia: true } } }
    : { publishedVersion: { include: { heroMedia: true } } };
  const solutionVersionInclude = preview
    ? { draftVersion: { include: { heroMedia: true } }, publishedVersion: { include: { heroMedia: true } } }
    : { publishedVersion: { include: { heroMedia: true } } };
  const projectRelationsInclude = {
    coverMedia: true,
    category: { select: { id: true, name: true, slug: true, iconKey: true, isActive: true } },
  };
  const statusWhere = preview ? {} : { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } };
  const heroMediaId = "mediaId" in data.hero ? data.hero.mediaId || null : null;
  const homeData = key === "HOME" ? data as Extract<StaticPageData, { featuredServices: unknown }> : null;
  const valuePropositionMediaId = homeData?.valueProposition.mediaId || null;
  const sectionMediaIds = homeData ? [
    ...homeData.howWeWork.steps.map((step) => step.mediaId),
    homeData.trustSection.featuredProof.mediaId,
    homeData.finalCta.backgroundMediaId,
  ].filter((id): id is string => Boolean(id)) : [];
  const pricesData = key === "PRICES" ? data as Extract<StaticPageData, { selectedPricingArticleIds: unknown }> : null;
  const [heroMedia, valuePropositionMedia, sectionMedia, services, solutions, materials, projects, articles, faqs, settings] = await Promise.all([
    heroMediaId ? prisma.media.findFirst({ where: { id: heroMediaId, type: "IMAGE" }, select: { id: true, url: true, altText: true } }) : null,
    valuePropositionMediaId ? prisma.media.findUnique({ where: { id: valuePropositionMediaId }, select: { id: true, url: true, altText: true } }) : null,
    sectionMediaIds.length ? prisma.media.findMany({ where: { id: { in: sectionMediaIds }, type: "IMAGE" }, select: { id: true, url: true, altText: true } }) : [],
    homeData ? prisma.service.findMany({ where: { id: { in: homeData.featuredServices.selectedServiceIds }, ...statusWhere }, include: serviceVersionInclude }) : key === "CONTACT" ? prisma.service.findMany({ where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, select: { id: true, publishedVersion: { select: { title: true } } }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 80 }) : [],
    homeData ? prisma.solution.findMany({ where: { id: { in: homeData.featuredSolutions.selectedSolutionIds }, ...statusWhere }, include: solutionVersionInclude }) : key === "CONTACT" ? prisma.solution.findMany({ where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, select: { id: true, publishedVersion: { select: { title: true } } }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 80 }) : [],
    key === "CONTACT" ? prisma.material.findMany({ where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, select: { id: true, publishedVersion: { select: { name: true } } }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 80 }) : [],
    homeData ? prisma.project.findMany({ where: { id: { in: homeData.featuredProjects.selectedProjectIds }, ...statusWhere }, include: { ...versionInclude, publishedVersion: { include: projectRelationsInclude }, ...(preview ? { draftVersion: { include: projectRelationsInclude } } : {}) } }) : [],
    pricesData ? prisma.article.findMany({ where: { id: { in: pricesData.selectedPricingArticleIds }, ...statusWhere, ...(preview ? {} : { publishedVersion: { articleType: "PRICING" } }) }, include: versionInclude }) : [],
    (homeData || pricesData) ? prisma.fAQ.findMany({ where: { id: { in: (homeData ?? pricesData)!.faqSection.selectedFaqIds }, ...statusWhere }, include: versionInclude }) : [],
    key === "CONTACT" || key === "HOME" ? prisma.siteSettings.findFirst({ include: { defaultOpenGraphImage: true }, orderBy: { createdAt: "asc" } }) : null,
  ]);
  const faqIds = (homeData ?? pricesData)?.faqSection.selectedFaqIds ?? [];
  return {
    heroMedia,
    valuePropositionMedia,
    sectionMedia: Object.fromEntries(sectionMedia.map((media) => [media.id, media])),
    services: homeData ? orderSelections(services, homeData.featuredServices.selectedServiceIds) : services,
    solutions: homeData ? orderSelections(solutions, homeData.featuredSolutions.selectedSolutionIds) : solutions,
    materials,
    projects: homeData ? orderSelections(projects, homeData.featuredProjects.selectedProjectIds) : projects,
    articles: pricesData ? orderSelections(articles, pricesData.selectedPricingArticleIds) : articles,
    faqs: orderSelections(faqs, faqIds),
    settings: settings ? { ...settings, socialLinks: parseSocialLinks(settings.socialLinks) } : null,
    preview,
  };
}

function orderSelections<T extends { id: string }>(items: T[], ids: string[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}

function getSelectedPageMediaIds(key: PageKey, data: StaticPageData, openGraphImageId?: string | null) {
  const ids: (string | null | undefined)[] = [openGraphImageId, "mediaId" in data.hero ? data.hero.mediaId : null];
  if (key === "HOME" && "featuredServices" in data) {
    ids.push(
      data.valueProposition.mediaId,
      ...data.howWeWork.steps.map((step) => step.mediaId),
      data.trustSection.featuredProof.mediaId,
      data.finalCta.backgroundMediaId,
    );
  }
  return ids;
}
