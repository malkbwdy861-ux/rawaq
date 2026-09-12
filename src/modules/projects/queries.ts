import { ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { decodeCmsSlug } from "@/modules/cms/slugs";
import { prisma } from "@/server/db/prisma";

export async function getProjectList(searchParams: Record<string, string | string[] | undefined>) {
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
        { draftVersion: { city: { contains: params.q, mode: "insensitive" as const } } },
      ] } : {},
      params.status === "UNPUBLISHED_CHANGES" ? { publishedVersionId: { not: null }, draftVersionId: { not: null } } : {},
    ],
  };
  const totalItems = await prisma.project.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const projects = await prisma.project.findMany({
    where,
    include: { draftVersion: true, publishedVersion: true },
    orderBy: { updatedAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  });
  return { params, pagination, projects };
}

export async function getProjectEditorData(projectId: string) {
  const [project, media, relationOptions] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        draftVersion: { include: { gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } }, services: true, solutions: true, materials: true, articles: true } },
        publishedVersion: true,
      },
    }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
    getRelationOptions(),
  ]);
  if (!project) notFound();
  return { project, media, relationOptions };
}

export async function getPublishedProjects() {
  return prisma.project.findMany({
    where: { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } },
    include: { publishedVersion: { include: { coverMedia: true } } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedProjectBySlug(slug: string) {
  const decodedSlug = decodeCmsSlug(slug);
  const project = await prisma.project.findFirst({
    where: { status: ContentStatus.PUBLISHED, publishedVersion: { slug: decodedSlug } },
    include: { publishedVersion: { include: {
      coverMedia: true,
      openGraphImage: true,
      gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      services: { where: { service: { status: ContentStatus.PUBLISHED } }, include: { service: { include: { publishedVersion: true } } } },
      solutions: { where: { solution: { status: ContentStatus.PUBLISHED } }, include: { solution: { include: { publishedVersion: true } } } },
      materials: { where: { material: { status: ContentStatus.PUBLISHED } }, include: { material: { include: { publishedVersion: true } } } },
      articles: { where: { article: { status: ContentStatus.PUBLISHED } }, include: { article: { include: { publishedVersion: true } } } },
    } } },
  });
  if (!project?.publishedVersion) notFound();
  return project;
}

export async function getProjectPreview(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { draftVersion: { include: {
    coverMedia: true,
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
    prisma.service.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.solution.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.material.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.article.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" } }),
  ]);
  return {
    services: services.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "خدمة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    solutions: solutions.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "حل بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    materials: materials.map((item) => ({ id: item.id, label: item.draftVersion?.name ?? item.publishedVersion?.name ?? "مادة بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
    articles: articles.map((item) => ({ id: item.id, label: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مقال بدون عنوان", description: item.draftVersion?.slug ?? item.publishedVersion?.slug ?? undefined, status: item.status })),
  };
}
