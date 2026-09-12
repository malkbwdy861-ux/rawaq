import { ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { decodeCmsSlug } from "@/modules/cms/slugs";
import { prisma } from "@/server/db/prisma";

export async function getArticleList(searchParams: Record<string, string | string[] | undefined>) {
  const params = parseCmsSearchParams(searchParams);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    AND: [
      params.status === "ALL" || params.status === "UNPUBLISHED_CHANGES" ? {} : { status: params.status },
      params.q ? { OR: [
        { draftVersion: { title: { contains: params.q, mode: "insensitive" as const } } },
        { publishedVersion: { title: { contains: params.q, mode: "insensitive" as const } } },
        { draftVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
        { publishedVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
      ] } : {},
      params.status === "UNPUBLISHED_CHANGES" ? { publishedVersionId: { not: null }, draftVersionId: { not: null } } : {},
    ],
  };
  const totalItems = await prisma.article.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const articles = await prisma.article.findMany({
    where,
    include: { draftVersion: { select: { title: true, slug: true, articleType: true } }, publishedVersion: { select: { title: true, slug: true, articleType: true } } },
    orderBy: { updatedAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  });
  return { params, pagination, articles };
}

export async function getArticleEditorData(articleId: string) {
  const [article, media, relationOptions] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      include: { draftVersion: { include: { services: true, solutions: true, materials: true, projects: true, faqs: true } }, publishedVersion: true },
    }),
    prisma.media.findMany({ where: { type: "IMAGE" }, orderBy: { createdAt: "desc" }, take: 80 }),
    getRelationOptions(),
  ]);
  if (!article) notFound();
  return { article, media, relationOptions };
}

export async function getPublishedArticles() {
  return prisma.article.findMany({
    where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } },
    include: { publishedVersion: { include: { heroMedia: true } } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedArticleBySlug(slug: string) {
  const decodedSlug = decodeCmsSlug(slug);
  const article = await prisma.article.findFirst({
    where: { status: ContentStatus.PUBLISHED, publishedVersion: { slug: decodedSlug } },
    include: { publishedVersion: { include: {
      heroMedia: true,
      openGraphImage: true,
      services: { where: { service: { status: ContentStatus.PUBLISHED } }, include: { service: { include: { publishedVersion: true } } } },
      solutions: { where: { solution: { status: ContentStatus.PUBLISHED } }, include: { solution: { include: { publishedVersion: true } } } },
      materials: { where: { material: { status: ContentStatus.PUBLISHED } }, include: { material: { include: { publishedVersion: true } } } },
      projects: { where: { project: { status: ContentStatus.PUBLISHED } }, include: { project: { include: { publishedVersion: true } } } },
      faqs: { where: { faq: { status: ContentStatus.PUBLISHED } }, include: { faq: { include: { publishedVersion: true } } } },
    } } },
  });
  if (!article?.publishedVersion) notFound();
  return article;
}

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

async function getRelationOptions() {
  const [services, solutions, materials, projects, faqs] = await Promise.all([
    prisma.service.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.solution.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.material.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.fAQ.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
  ]);
  return {
    services: services.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "خدمة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    solutions: solutions.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "حل بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    materials: materials.map((item) => ({ id: item.id, label: item.draftVersion?.name ?? item.publishedVersion?.name ?? "مادة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    projects: projects.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مشروع بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    faqs: faqs.map((item) => ({ id: item.id, label: item.draftVersion?.question ?? item.publishedVersion?.question ?? "سؤال بدون عنوان", status: item.status })),
  };
}
