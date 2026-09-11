import { ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { prisma } from "@/server/db/prisma";

export async function getServiceList(searchParams: Record<string, string | string[] | undefined>) {
  const params = parseCmsSearchParams(searchParams);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    AND: [
      params.status === "ALL" || params.status === "UNPUBLISHED_CHANGES" ? {} : { status: params.status },
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
      params.status === "UNPUBLISHED_CHANGES" ? { publishedVersionId: { not: null }, draftVersionId: { not: null } } : {},
    ],
  };
  const totalItems = await prisma.service.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const services = await prisma.service.findMany({
    where,
    include: {
      draftVersion: true,
      publishedVersion: true,
    },
    orderBy: { updatedAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  });

  return { params, pagination, services };
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
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
    getRelationOptions(),
  ]);

  if (!service) notFound();
  return { service, media, relationOptions };
}

export async function getPublishedServices() {
  return prisma.service.findMany({
    where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } },
    include: { publishedVersion: { include: { heroMedia: true } } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedServiceBySlug(slug: string) {
  const service = await prisma.service.findFirst({
    where: { status: ContentStatus.PUBLISHED, publishedVersion: { slug } },
    include: {
      publishedVersion: {
        include: {
          heroMedia: true,
          openGraphImage: true,
          solutions: { where: { solution: { status: ContentStatus.PUBLISHED } }, include: { solution: { include: { publishedVersion: true } } } },
          materials: { where: { material: { status: ContentStatus.PUBLISHED } }, include: { material: { include: { publishedVersion: true } } } },
          projects: { where: { project: { status: ContentStatus.PUBLISHED } }, include: { project: { include: { publishedVersion: true } } } },
          articles: { where: { article: { status: ContentStatus.PUBLISHED } }, include: { article: { include: { publishedVersion: true } } } },
          faqs: { where: { faq: { status: ContentStatus.PUBLISHED } }, include: { faq: { include: { publishedVersion: true } } } },
        },
      },
    },
  });

  if (!service?.publishedVersion) notFound();
  return service;
}

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
    prisma.solution.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.material.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.article.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.fAQ.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  return {
    solutions: solutions.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "حل بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    materials: materials.map((item) => ({ id: item.id, label: item.draftVersion?.name ?? item.publishedVersion?.name ?? "مادة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    projects: projects.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مشروع بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    articles: articles.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مقال بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    faqs: faqs.map((item) => ({ id: item.id, label: item.draftVersion?.question ?? item.publishedVersion?.question ?? "سؤال بدون عنوان", description: item.draftVersion?.answer ?? item.publishedVersion?.answer ?? undefined, status: item.status })),
  };
}
