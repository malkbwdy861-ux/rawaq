import { ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { decodeCmsSlug } from "@/modules/cms/slugs";
import { getRecentImageMedia, includeSelectedImageMedia } from "@/modules/media/queries";
import { prisma } from "@/server/db/prisma";

export async function getServiceList(searchParams: Record<string, string | string[] | undefined>) {
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
    prisma.service.count({ where }),
    prisma.service.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const services = await prisma.service.findMany({
    where,
    select: {
      id: true, status: true, updatedAt: true,
      draftVersion: { select: { title: true, slug: true, shortDescription: true, heroMedia: { select: { url: true } } } },
      publishedVersion: { select: { title: true, slug: true, shortDescription: true, heroMedia: { select: { url: true } } } },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.take,
  });

  const statusCounts = {
    ALL: groupedStatuses.reduce((sum, item) => sum + item._count._all, 0),
    DRAFT: groupedStatuses.filter((item) => item.status !== ContentStatus.PUBLISHED).reduce((sum, item) => sum + item._count._all, 0),
    PUBLISHED: groupedStatuses.find((item) => item.status === ContentStatus.PUBLISHED)?._count._all ?? 0,
  };

  return { params, pagination, services, statusCounts };
}

export async function getServiceEditorData(serviceId: string) {
  const [service, media, relationOptions] = await Promise.all([
    prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        draftVersion: {
          include: { solutions: true, materials: true, projects: true, articles: true, faqs: true },
        },
        publishedVersion: true,
      },
    }),
    getRecentImageMedia(),
    getRelationOptions(),
  ]);

  if (!service) notFound();
  return { service, media: await includeSelectedImageMedia(media, [service.draftVersion?.heroMediaId, service.draftVersion?.openGraphImageId]), relationOptions };
}

export async function getNewServiceEditorData() {
  const [media, relationOptions] = await Promise.all([
    getRecentImageMedia(),
    getRelationOptions(),
  ]);

  return { media, relationOptions };
}

export async function getPublishedServices(page = 1, pageSize = 12) {
  const where = { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } };
  const totalItems = await prisma.service.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const items = await prisma.service.findMany({
    where,
    select: { id: true, publishedVersion: { select: { title: true, slug: true, shortDescription: true, heroMedia: { select: { url: true, altText: true } } } } },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.take,
  });
  return { items, pagination };
}

export const getPublishedServiceBySlug = cache(async (slug: string) => {
  const decodedSlug = decodeCmsSlug(slug);
  const service = await prisma.service.findFirst({
    where: { status: ContentStatus.PUBLISHED, publishedVersion: { slug: decodedSlug } },
    include: {
      publishedVersion: {
        include: {
          heroMedia: { select: { url: true, altText: true, caption: true } },
          openGraphImage: { select: { url: true } },
          solutions: { where: { solution: { status: ContentStatus.PUBLISHED } }, select: { solution: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
          materials: { where: { material: { status: ContentStatus.PUBLISHED } }, select: { material: { select: { publishedVersion: { select: { name: true, slug: true } } } } } },
          projects: { where: { project: { status: ContentStatus.PUBLISHED } }, select: { project: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
          articles: { where: { article: { status: ContentStatus.PUBLISHED } }, select: { article: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
          faqs: { where: { faq: { status: ContentStatus.PUBLISHED } }, select: { faq: { select: { publishedVersion: { select: { question: true, answer: true } } } } } },
        },
      },
    },
  });

  if (!service?.publishedVersion) notFound();
  return service;
});

export async function getServicePreview(serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { draftVersion: { include: { heroMedia: true, openGraphImage: true } } },
  });

  if (!service?.draftVersion) notFound();
  return service;
}

async function getRelationOptions() {
  const [solutions, materials, projects, articles, faqs] = await Promise.all([
    prisma.solution.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.material.findMany({ select: { id: true, status: true, draftVersion: { select: { name: true, slug: true } }, publishedVersion: { select: { name: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.article.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.fAQ.findMany({ select: { id: true, status: true, draftVersion: { select: { question: true, answer: true } }, publishedVersion: { select: { question: true, answer: true } } }, orderBy: { updatedAt: "desc" } }),
  ]);

  return {
    solutions: solutions.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "حل بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    materials: materials.map((item) => ({ id: item.id, label: item.draftVersion?.name ?? item.publishedVersion?.name ?? "مادة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    projects: projects.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مشروع بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    articles: articles.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مقال بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    faqs: faqs.map((item) => ({ id: item.id, label: item.draftVersion?.question ?? item.publishedVersion?.question ?? "سؤال بدون عنوان", description: item.draftVersion?.answer ?? item.publishedVersion?.answer ?? undefined, status: item.status })),
  };
}
