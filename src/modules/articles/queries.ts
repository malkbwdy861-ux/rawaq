import { ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

import { decodeCmsSlug } from "@/modules/cms/slugs";
import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { prisma } from "@/server/db/prisma";
import { getRecentImageMedia, includeSelectedImageMedia } from "@/modules/media/queries";

export async function getArticleList(searchParams: Record<string, string | string[] | undefined>) {
  const parsedParams = parseCmsSearchParams(searchParams);
  const params = {
    ...parsedParams,
    status: parsedParams.status === "DRAFT" || parsedParams.status === "PUBLISHED" ? parsedParams.status : "ALL",
    pageSize: 10,
  } as const;
  const where = {
    AND: [
      params.status === "ALL" ? {} : params.status === "PUBLISHED" ? { status: ContentStatus.PUBLISHED } : { status: { not: ContentStatus.PUBLISHED } },
      params.q ? { OR: [
        { draftVersion: { title: { contains: params.q, mode: "insensitive" as const } } },
        { publishedVersion: { title: { contains: params.q, mode: "insensitive" as const } } },
        { draftVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
        { publishedVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
      ] } : {},
    ],
  };
  const [totalItems, groupedStatuses] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const pagination = getCmsPagination({ page: params.page ?? 1, pageSize: 10, totalItems });
  const articles = await prisma.article.findMany({
    where,
    select: { id: true, status: true, updatedAt: true, draftVersion: { select: { title: true, slug: true, excerpt: true, articleType: true, heroMedia: { select: { url: true } } } }, publishedVersion: { select: { title: true, slug: true, excerpt: true, articleType: true, heroMedia: { select: { url: true } } } } },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.take,
  });
  const statusCounts = {
    ALL: groupedStatuses.reduce((sum, item) => sum + item._count._all, 0),
    DRAFT: groupedStatuses.filter((item) => item.status !== ContentStatus.PUBLISHED).reduce((sum, item) => sum + item._count._all, 0),
    PUBLISHED: groupedStatuses.find((item) => item.status === ContentStatus.PUBLISHED)?._count._all ?? 0,
  };
  return { params, pagination, articles, statusCounts };
}

export async function getArticleEditorData(articleId: string) {
  const [article, media, relationOptions] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      include: { draftVersion: { include: { services: true, solutions: true, materials: true, projects: true, faqs: true } }, publishedVersion: true },
    }),
    getArticleImages(),
    getRelationOptions(),
  ]);
  if (!article) notFound();
  return { article, media: await includeSelectedImageMedia(media, [article.draftVersion?.heroMediaId, article.draftVersion?.openGraphImageId]), relationOptions };
}

export async function getNewArticleEditorData() {
  const [media, relationOptions] = await Promise.all([getArticleImages(), getRelationOptions()]);
  return { media, relationOptions };
}

export async function getPublishedArticles(page = 1, pageSize = 12) {
  const where = { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } };
  const totalItems = await prisma.article.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const items = await prisma.article.findMany({ where, select: { id: true, publishedAt: true, publishedVersion: { select: { title: true, slug: true, excerpt: true, articleType: true, heroMedia: { select: { url: true, altText: true } } } } }, orderBy: [{ publishedAt: "desc" }, { id: "desc" }], skip: pagination.skip, take: pagination.take });
  return { items, pagination };
}

export const getPublishedArticleBySlug = cache(async (slug: string) => {
  const decodedSlug = decodeCmsSlug(slug);
  const article = await prisma.article.findFirst({
    where: { status: ContentStatus.PUBLISHED, publishedVersion: { slug: decodedSlug } },
    include: { publishedVersion: { include: {
      heroMedia: { select: { url: true, altText: true, caption: true } },
      openGraphImage: { select: { url: true } },
      services: { where: { service: { status: ContentStatus.PUBLISHED } }, select: { service: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
      solutions: { where: { solution: { status: ContentStatus.PUBLISHED } }, select: { solution: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
      materials: { where: { material: { status: ContentStatus.PUBLISHED } }, select: { material: { select: { publishedVersion: { select: { name: true, slug: true } } } } } },
      projects: { where: { project: { status: ContentStatus.PUBLISHED } }, select: { project: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
      faqs: { where: { faq: { status: ContentStatus.PUBLISHED } }, select: { faqId: true, faq: { select: { publishedVersion: { select: { question: true, answer: true } } } } } },
    } } },
  });
  if (!article?.publishedVersion) notFound();
  return article;
});

export async function getArticlePreview(articleId: string) {
  const article = await prisma.article.findUnique({ where: { id: articleId }, include: { draftVersion: { include: {
    heroMedia: true,
    services: { include: { service: { include: { draftVersion: true, publishedVersion: true } } } },
    solutions: { include: { solution: { include: { draftVersion: true, publishedVersion: true } } } },
    materials: { include: { material: { include: { draftVersion: true, publishedVersion: true } } } },
    projects: { include: { project: { include: { draftVersion: true, publishedVersion: true } } } },
    faqs: { include: { faq: { include: { draftVersion: true, publishedVersion: true } } } },
  } } } });
  if (!article?.draftVersion) notFound();
  return article;
}

function getArticleImages() {
  return getRecentImageMedia();
}

async function getRelationOptions() {
  const [services, solutions, materials, projects, faqs] = await Promise.all([
    prisma.service.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.solution.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.material.findMany({ select: { id: true, status: true, draftVersion: { select: { name: true, slug: true } }, publishedVersion: { select: { name: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.fAQ.findMany({ select: { id: true, status: true, draftVersion: { select: { question: true, answer: true } }, publishedVersion: { select: { question: true, answer: true } } }, orderBy: { updatedAt: "desc" } }),
  ]);
  return {
    services: services.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "خدمة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    solutions: solutions.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "حل بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    materials: materials.map((item) => ({ id: item.id, label: item.draftVersion?.name ?? item.publishedVersion?.name ?? "مادة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    projects: projects.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مشروع بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    faqs: faqs.map((item) => ({ id: item.id, label: item.draftVersion?.question ?? item.publishedVersion?.question ?? "سؤال بدون عنوان", description: item.draftVersion?.answer ?? item.publishedVersion?.answer ?? undefined, status: item.status })),
  };
}
