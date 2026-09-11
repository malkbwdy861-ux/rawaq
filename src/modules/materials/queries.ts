import { ContentStatus, type Prisma } from "@prisma/client";
import { notFound } from "next/navigation";

import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { prisma } from "@/server/db/prisma";

export async function getMaterialList(searchParams: Record<string, string | string[] | undefined>) {
  const params = parseCmsSearchParams(searchParams);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    AND: [
      params.status === "ALL" || params.status === "UNPUBLISHED_CHANGES" ? {} : { status: params.status },
      params.q
        ? {
            OR: [
              { draftVersion: { name: { contains: params.q, mode: "insensitive" as const } } },
              { publishedVersion: { name: { contains: params.q, mode: "insensitive" as const } } },
              { draftVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
              { publishedVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
            ],
          }
        : {},
      params.status === "UNPUBLISHED_CHANGES" ? { publishedVersionId: { not: null }, draftVersionId: { not: null } } : {},
    ],
  };

  const totalItems = await prisma.material.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const materials = await prisma.material.findMany({
    where,
    include: { draftVersion: true, publishedVersion: true },
    orderBy: { updatedAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  });

  return { params, pagination, materials };
}

export async function getMaterialEditorData(materialId: string) {
  const [material, media, relationOptions] = await Promise.all([
    prisma.material.findUnique({
      where: { id: materialId },
      include: {
        draftVersion: { include: { services: true, solutions: true, projects: true, articles: true, faqs: true } },
        publishedVersion: true,
      },
    }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
    getRelationOptions(),
  ]);

  if (!material) notFound();
  return { material, media, relationOptions };
}

export async function getPublishedMaterials() {
  return prisma.material.findMany({
    where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } },
    include: { publishedVersion: { include: { heroMedia: true } } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedMaterialBySlug(slug: string) {
  const material = await prisma.material.findFirst({
    where: { status: ContentStatus.PUBLISHED, publishedVersion: { slug } },
    include: {
      publishedVersion: {
        include: {
          heroMedia: true,
          openGraphImage: true,
          services: { where: { service: { status: ContentStatus.PUBLISHED } }, include: { service: { include: { publishedVersion: true } } } },
          solutions: { where: { solution: { status: ContentStatus.PUBLISHED } }, include: { solution: { include: { publishedVersion: true } } } },
          projects: { where: { project: { status: ContentStatus.PUBLISHED } }, include: { project: { include: { publishedVersion: true } } } },
          articles: { where: { article: { status: ContentStatus.PUBLISHED } }, include: { article: { include: { publishedVersion: true } } } },
          faqs: { where: { faq: { status: ContentStatus.PUBLISHED } }, include: { faq: { include: { publishedVersion: true } } } },
        },
      },
    },
  });

  if (!material?.publishedVersion) notFound();
  return material;
}

export async function getMaterialPreview(materialId: string) {
  const material = await prisma.material.findUnique({ where: { id: materialId }, include: { draftVersion: { include: { heroMedia: true, openGraphImage: true } } } });
  if (!material?.draftVersion) notFound();
  return material;
}

export function jsonStringArray(value: Prisma.JsonValue | null | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function getRelationOptions() {
  const [services, solutions, projects, articles, faqs] = await Promise.all([
    prisma.service.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.solution.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.article.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.fAQ.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  return {
    services: services.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "خدمة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    solutions: solutions.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "حل بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    projects: projects.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مشروع بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    articles: articles.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مقال بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    faqs: faqs.map((item) => ({ id: item.id, label: item.draftVersion?.question ?? item.publishedVersion?.question ?? "سؤال بدون عنوان", description: item.draftVersion?.answer ?? item.publishedVersion?.answer ?? undefined, status: item.status })),
  };
}
