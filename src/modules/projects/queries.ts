import { ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

import { decodeCmsSlug } from "@/modules/cms/slugs";
import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { getProjectCategoryOptions } from "@/modules/project-categories/queries";
import { getRecentImageMedia } from "@/modules/media/queries";
import { prisma } from "@/server/db/prisma";

const projectCategoryPublicSelect = { id: true, name: true, slug: true, iconKey: true, isActive: true } as const;

export async function getProjectList(searchParams: Record<string, string | string[] | undefined>) {
  const parsedParams = parseCmsSearchParams(searchParams);
  const categoryOptions = await getProjectCategoryOptions();
  const categoryId = firstParam(searchParams.categoryId);
  const selectedCategoryId = categoryOptions.some((category) => category.id === categoryId) ? categoryId : "ALL";
  const params = {
    ...parsedParams,
    status: parsedParams.status === "DRAFT" || parsedParams.status === "PUBLISHED" ? parsedParams.status : "ALL",
    categoryId: selectedCategoryId,
    pageSize: 10,
  } as const;
  const where = {
    AND: [
      params.status === "ALL" ? {} : params.status === "PUBLISHED" ? { status: ContentStatus.PUBLISHED } : { status: { not: ContentStatus.PUBLISHED } },
      params.categoryId === "ALL" ? {} : { OR: [{ draftVersion: { categoryId: params.categoryId } }, { publishedVersion: { categoryId: params.categoryId } }] },
      params.q ? { OR: [
        { draftVersion: { title: { contains: params.q, mode: "insensitive" as const } } },
        { publishedVersion: { title: { contains: params.q, mode: "insensitive" as const } } },
        { draftVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
        { publishedVersion: { slug: { contains: params.q, mode: "insensitive" as const } } },
        { draftVersion: { city: { contains: params.q, mode: "insensitive" as const } } },
        { draftVersion: { district: { contains: params.q, mode: "insensitive" as const } } },
      ] } : {},
    ],
  };
  const [totalItems, groupedStatuses] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const pagination = getCmsPagination({ page: params.page ?? 1, pageSize: 10, totalItems });
  const projects = await prisma.project.findMany({
    where,
    select: {
      id: true, status: true, updatedAt: true,
      draftVersion: { select: { title: true, slug: true, shortDescription: true, city: true, district: true, coverMedia: { select: { url: true } }, category: { select: { name: true } } } },
      publishedVersion: { select: { title: true, slug: true, shortDescription: true, city: true, district: true, coverMedia: { select: { url: true } }, category: { select: { name: true } } } },
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
  return { params, pagination, projects, statusCounts, categoryOptions };
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function getProjectEditorData(projectId: string) {
  const [project, recentMedia, relationOptions, categoryOptions] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        draftVersion: { include: { coverMedia: true, openGraphImage: true, gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } }, services: true, solutions: true, materials: true, articles: true } },
        publishedVersion: true,
      },
    }),
    getRecentImageMedia(),
    getRelationOptions(),
    getProjectCategoryOptions(),
  ]);
  if (!project) notFound();

  const selectedMedia = [project.draftVersion?.coverMedia, project.draftVersion?.openGraphImage, ...(project.draftVersion?.gallery.map((item) => item.media) ?? [])]
    .flatMap((item) => item?.type === "IMAGE" ? [item] : []);
  const media = Array.from(new Map([...recentMedia, ...selectedMedia].map((item) => [item.id, item])).values());
  return { project, media, relationOptions, categoryOptions };
}

export async function getNewProjectEditorData() {
  const [media, relationOptions, categoryOptions] = await Promise.all([
    getRecentImageMedia(),
    getRelationOptions(),
    getProjectCategoryOptions(),
  ]);
  return { media, relationOptions, categoryOptions };
}

export async function getPublishedProjects(page = 1, pageSize = 12, categoryId?: string) {
  const where = { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null }, ...(categoryId ? { publishedVersion: { categoryId } } : {}) };
  const totalItems = await prisma.project.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const items = await prisma.project.findMany({
    where,
    select: { id: true, publishedVersion: { select: { title: true, slug: true, shortDescription: true, city: true, district: true, coverMedia: { select: { url: true, altText: true } }, category: { select: projectCategoryPublicSelect } } } },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }], skip: pagination.skip, take: pagination.take,
  });
  return { items, pagination };
}

export const getPublishedProjectBySlug = cache(async (slug: string) => {
  const decodedSlug = decodeCmsSlug(slug);
  const project = await prisma.project.findFirst({
    where: { status: ContentStatus.PUBLISHED, publishedVersion: { slug: decodedSlug } },
    include: { publishedVersion: { include: {
      coverMedia: { select: { url: true, altText: true, caption: true } },
      category: { select: projectCategoryPublicSelect },
      openGraphImage: { select: { url: true } },
      gallery: { select: { id: true, caption: true, media: { select: { url: true, altText: true, caption: true } } }, orderBy: { sortOrder: "asc" } },
      services: { where: { service: { status: ContentStatus.PUBLISHED } }, select: { service: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
      solutions: { where: { solution: { status: ContentStatus.PUBLISHED } }, select: { solution: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
      materials: { where: { material: { status: ContentStatus.PUBLISHED } }, select: { material: { select: { publishedVersion: { select: { name: true, slug: true } } } } } },
      articles: { where: { article: { status: ContentStatus.PUBLISHED } }, select: { article: { select: { publishedVersion: { select: { title: true, slug: true } } } } } },
    } } },
  });
  if (!project?.publishedVersion) notFound();
  return project;
});

export async function getProjectPreview(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { draftVersion: { include: {
    coverMedia: true,
    category: { select: projectCategoryPublicSelect },
    gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
    services: { include: { service: { include: { draftVersion: true, publishedVersion: true } } } },
    solutions: { include: { solution: { include: { draftVersion: true, publishedVersion: true } } } },
    materials: { include: { material: { include: { draftVersion: true, publishedVersion: true } } } },
    articles: { include: { article: { include: { draftVersion: true, publishedVersion: true } } } },
  } } } });
  if (!project?.draftVersion) notFound();
  return project;
}

async function getRelationOptions() {
  const [services, solutions, materials, articles] = await Promise.all([
    prisma.service.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.solution.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.material.findMany({ select: { id: true, status: true, draftVersion: { select: { name: true, slug: true } }, publishedVersion: { select: { name: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.article.findMany({ select: { id: true, status: true, draftVersion: { select: { title: true, slug: true } }, publishedVersion: { select: { title: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
  ]);
  return {
    services: services.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "خدمة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    solutions: solutions.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "حل بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    materials: materials.map((item) => ({ id: item.id, label: item.draftVersion?.name ?? item.publishedVersion?.name ?? "مادة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    articles: articles.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مقال بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
  };
}
