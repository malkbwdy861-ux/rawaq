import { ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

import { decodeCmsSlug } from "@/modules/cms/slugs";
import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { prisma } from "@/server/db/prisma";
import { getRecentImageMedia, includeSelectedImageMedia } from "@/modules/media/queries";

export async function getSolutionList(searchParams: Record<string, string | string[] | undefined>) {
  const parsedParams = parseCmsSearchParams(searchParams);
  const params = {
    ...parsedParams,
    status: parsedParams.status === "DRAFT" || parsedParams.status === "PUBLISHED" ? parsedParams.status : "ALL",
    pageSize: 10,
  } as const;
  const page = params.page ?? 1;
  const pageSize = 10;
  const where = {
    AND: [
      params.status === "ALL" ? {} : params.status === "PUBLISHED" ? { status: ContentStatus.PUBLISHED } : { status: { not: ContentStatus.PUBLISHED } },
      params.q
        ? {
            OR: [
              { draftVersion: { title: { contains: params.q, mode: "insensitive" as const } } },
              { publishedVersion: { title: { contains: params.q, mode: "insensitive" as const } } },
              { draftVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
              { publishedVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
            ],
          }
        : {},
    ],
  };
  const [totalItems, groupedStatuses] = await Promise.all([
    prisma.solution.count({ where }),
    prisma.solution.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const solutions = await prisma.solution.findMany({
    where,
    select: { id: true, status: true, updatedAt: true, draftVersion: { select: { title: true, slug: true, shortDescription: true, heroMedia: { select: { url: true } } } }, publishedVersion: { select: { title: true, slug: true, shortDescription: true, heroMedia: { select: { url: true } } } } },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.take,
  });
  const statusCounts = {
    ALL: groupedStatuses.reduce((sum, item) => sum + item._count._all, 0),
    DRAFT: groupedStatuses.filter((item) => item.status !== ContentStatus.PUBLISHED).reduce((sum, item) => sum + item._count._all, 0),
    PUBLISHED: groupedStatuses.find((item) => item.status === ContentStatus.PUBLISHED)?._count._all ?? 0,
  };

  return { params, pagination, solutions, statusCounts };
}

export async function getSolutionEditorData(solutionId: string) {
  const [solution, media, relationOptions] = await Promise.all([
    prisma.solution.findUnique({
      where: { id: solutionId },
      include: {
        draftVersion: { include: { services: true, materials: true, projects: true, articles: true, faqs: true } },
        publishedVersion: true,
      },
    }),
    getImageMedia(),
    getRelationOptions(),
  ]);
  if (!solution) notFound();
  return { solution, media: await includeSelectedImageMedia(media, [solution.draftVersion?.heroMediaId, solution.draftVersion?.openGraphImageId]), relationOptions };
}

export async function getNewSolutionEditorData() {
  const [media, relationOptions] = await Promise.all([getImageMedia(), getRelationOptions()]);
  return { media, relationOptions };
}

export async function getPublishedSolutions(page = 1, pageSize = 12) {
  const where = { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } };
  const totalItems = await prisma.solution.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const items = await prisma.solution.findMany({
    where,
    select: { id: true, publishedVersion: { select: { title: true, slug: true, shortDescription: true, heroMedia: { select: { url: true, altText: true } } } } },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }], skip: pagination.skip, take: pagination.take,
  });
  return { items, pagination };
}

export const getPublishedSolutionBySlug = cache(async (slug: string) => {
  const decodedSlug = decodeCmsSlug(slug);
  const solution = await prisma.solution.findFirst({
    where: { status: ContentStatus.PUBLISHED, publishedVersion: { slug: decodedSlug } },
    include: {
      publishedVersion: {
        include: {
          heroMedia: { select: { url: true, altText: true, caption: true } },
          openGraphImage: { select: { url: true } },
          services: { where: { service: { status: ContentStatus.PUBLISHED } }, select: { service: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
          materials: { where: { material: { status: ContentStatus.PUBLISHED } }, select: { material: { select: { publishedVersion: { select: { name: true, slug: true } } } } } },
          projects: { where: { project: { status: ContentStatus.PUBLISHED } }, select: { project: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
          articles: { where: { article: { status: ContentStatus.PUBLISHED } }, select: { article: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
          faqs: { where: { faq: { status: ContentStatus.PUBLISHED } }, select: { faq: { select: { publishedVersion: { select: { question: true, answer: true } } } } } },
        },
      },
    },
  });
  if (!solution?.publishedVersion) notFound();
  return solution;
});

export async function getSolutionPreview(solutionId: string) {
  const solution = await prisma.solution.findUnique({ where: { id: solutionId }, include: { draftVersion: { include: { heroMedia: true, openGraphImage: true } } } });
  if (!solution?.draftVersion) notFound();
  return solution;
}

function getImageMedia() {
  return getRecentImageMedia();
}

async function getRelationOptions() {
  const [services, materials, projects, articles, faqs] = await Promise.all([
    prisma.service.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.material.findMany({ select: { id: true, status: true, draftVersion: { select: { name: true, slug: true } }, publishedVersion: { select: { name: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.article.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.fAQ.findMany({ select: { id: true, status: true, draftVersion: { select: { question: true, answer: true } }, publishedVersion: { select: { question: true, answer: true } } }, orderBy: { updatedAt: "desc" } }),
  ]);
  return {
    services: services.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "خدمة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    materials: materials.map((item) => ({ id: item.id, label: item.draftVersion?.name ?? item.publishedVersion?.name ?? "مادة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    projects: projects.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مشروع بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    articles: articles.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مقال بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    faqs: faqs.map((item) => ({ id: item.id, label: item.draftVersion?.question ?? item.publishedVersion?.question ?? "سؤال بدون عنوان", description: item.draftVersion?.answer ?? item.publishedVersion?.answer ?? undefined, status: item.status })),
  };
}
