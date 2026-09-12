"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { projectDraftSchema, projectIdSchema, projectPublishSchema, type ProjectDraftInput, type ProjectPublishInput } from "./validation";

export async function createProjectAction() {
  await requireAdmin();
  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({ data: { status: ContentStatus.DRAFT, versions: { create: {} } }, include: { versions: { select: { id: true }, take: 1 } } });
    return tx.project.update({ where: { id: created.id }, data: { draftVersionId: created.versions[0]?.id } });
  });
  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${project.id}?success=${encodeURIComponent("تم إنشاء مسودة مشروع جديدة.")}`);
}

export async function saveProjectDraftAction(formData: FormData) {
  await requireAdmin();
  const parsed = projectDraftSchema.safeParse(readProjectFormData(formData));
  if (!parsed.success || !parsed.data.projectId) {
    redirectWithMessage(parsed.data?.projectId, "error", "تعذر حفظ المسودة. راجع الحقول المدخلة.");
  }
  await saveDraft(parsed.data.projectId, parsed.data);
  revalidateProjectDraftPaths(parsed.data.projectId);
  redirectWithMessage(parsed.data.projectId, "success", "تم حفظ مسودة المشروع دون تغيير النسخة المنشورة.");
}

export async function publishProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = projectPublishSchema.safeParse(readProjectFormData(formData));
  if (!parsed.success || !parsed.data.projectId) {
    redirectWithMessage(parsed.data?.projectId, "error", "تعذر النشر. أكمل العنوان والوصف المختصر.");
  }
  try {
    const { oldPath, slug } = await publishProject(parsed.data.projectId, parsed.data);
    revalidateProjectPaths(parsed.data.projectId, slug, oldPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل نشر المشروع. بقيت النسخة المنشورة الحالية كما هي.";
    redirectWithMessage(parsed.data.projectId, "error", message);
  }
  redirectWithMessage(parsed.data.projectId, "success", "تم نشر المشروع وتحديث الصفحة العامة.");
}

export async function archiveProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = projectIdSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) redirect("/dashboard/projects?error=تعذر تحديد المشروع المطلوب أرشفته.");
  const project = await prisma.project.update({ where: { id: parsed.data.projectId }, data: { status: ContentStatus.ARCHIVED }, select: { publishedVersion: { select: { slug: true } } } });
  revalidateProjectPaths(parsed.data.projectId, undefined, project.publishedVersion?.slug ? cmsContentPath("/projects", project.publishedVersion.slug) : undefined);
  redirectWithMessage(parsed.data.projectId, "success", "تمت أرشفة المشروع وإزالته من العرض العام.");
}

function readProjectFormData(formData: FormData) {
  const galleryCaptions = formData.getAll("galleryCaptions");
  return {
    projectId: formData.get("projectId") || undefined,
    title: formData.get("title") ?? "",
    shortDescription: formData.get("shortDescription") ?? "",
    content: formData.get("content") ?? "",
    challenge: formData.get("challenge") ?? "",
    solutionSummary: formData.get("solutionSummary") ?? "",
    technicalDetails: formData.get("technicalDetails") ?? "",
    completedAt: formData.get("completedAt") ?? "",
    city: formData.get("city") ?? "",
    district: formData.get("district") ?? "",
    coverMediaId: formData.get("coverMediaId") ?? "",
    gallery: formData.getAll("galleryMediaIds").map((mediaId, index) => ({
      mediaId: String(mediaId),
      caption: String(galleryCaptions[index] ?? ""),
    })),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    canonicalUrl: formData.get("canonicalUrl") ?? "",
    noIndex: formData.get("noIndex") === "on",
    openGraphTitle: formData.get("openGraphTitle") ?? "",
    openGraphDescription: formData.get("openGraphDescription") ?? "",
    openGraphImageId: formData.get("openGraphImageId") ?? "",
    relatedServiceIds: readStringArray(formData, "relatedServiceIds"),
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
    relatedMaterialIds: readStringArray(formData, "relatedMaterialIds"),
    relatedArticleIds: readStringArray(formData, "relatedArticleIds"),
  };
}

async function saveDraft(projectId: string, input: ProjectDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "projects");
    const project = await tx.project.findUnique({ where: { id: projectId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!project) throw new Error("المشروع غير موجود.");
    const slug = input.title ? await resolveProjectSlug(tx, projectId, input, project.publishedVersion?.slug) : project.publishedVersion?.slug ?? null;
    const versionData = toVersionData({ ...input, slug: slug ?? undefined });
    let versionId = project.draftVersionId;
    if (!versionId) {
      const draft = await tx.projectVersion.create({ data: { projectId, ...versionData } });
      versionId = draft.id;
      await tx.project.update({ where: { id: projectId }, data: { draftVersionId: draft.id } });
    } else {
      await tx.projectVersion.update({ where: { id: versionId }, data: versionData });
    }
    await replaceVersionCollections(tx, versionId, input);
  });
}

async function publishProject(projectId: string, input: ProjectPublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "projects");
    const project = await tx.project.findUnique({ where: { id: projectId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!project?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");
    const slug = await resolveProjectSlug(tx, projectId, input, project.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });
    await tx.projectVersion.update({ where: { id: project.draftVersionId }, data: versionData });
    await replaceVersionCollections(tx, project.draftVersionId, input);
    const published = await tx.projectVersion.create({ data: { projectId, ...versionData } });
    await replaceVersionCollections(tx, published.id, input);
    const oldPath = project.publishedVersion?.slug ? cmsContentPath("/projects", project.publishedVersion.slug) : undefined;
    await tx.project.update({ where: { id: projectId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
    return { oldPath, slug };
  });
}

function revalidateProjectDraftPaths(projectId: string) {
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/preview/projects/${projectId}`);
}

async function resolveProjectSlug(tx: Prisma.TransactionClient, projectId: string, input: ProjectDraftInput, publishedSlug?: string | null) {
  if (publishedSlug) return publishedSlug;
  return generateUniqueCmsSlug({ tx, contentType: "projects", contentId: projectId, source: input.title ?? "" });
}

function toVersionData(input: ProjectDraftInput) {
  return {
    title: input.title || null,
    slug: input.slug || null,
    shortDescription: input.shortDescription || null,
    content: input.content || null,
    challenge: input.challenge || null,
    solutionSummary: input.solutionSummary || null,
    technicalDetails: input.technicalDetails || null,
    completedAt: input.completedAt ?? null,
    city: input.city || null,
    district: input.district || null,
    coverMediaId: input.coverMediaId || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    noIndex: input.noIndex,
    openGraphTitle: input.openGraphTitle || null,
    openGraphDescription: input.openGraphDescription || null,
    openGraphImageId: input.openGraphImageId || null,
  };
}

async function replaceVersionCollections(tx: Prisma.TransactionClient, projectVersionId: string, input: ProjectDraftInput) {
  await Promise.all([
    tx.projectVersionGallery.deleteMany({ where: { projectVersionId } }),
    tx.projectVersionService.deleteMany({ where: { projectVersionId } }),
    tx.projectVersionSolution.deleteMany({ where: { projectVersionId } }),
    tx.projectVersionMaterial.deleteMany({ where: { projectVersionId } }),
    tx.projectVersionArticle.deleteMany({ where: { projectVersionId } }),
  ]);
  await Promise.all([
    input.gallery.length ? tx.projectVersionGallery.createMany({ data: input.gallery.map((item, sortOrder) => ({ projectVersionId, mediaId: item.mediaId, sortOrder, caption: item.caption || null })) }) : null,
    input.relatedServiceIds.length ? tx.projectVersionService.createMany({ data: input.relatedServiceIds.map((serviceId) => ({ projectVersionId, serviceId })), skipDuplicates: true }) : null,
    input.relatedSolutionIds.length ? tx.projectVersionSolution.createMany({ data: input.relatedSolutionIds.map((solutionId) => ({ projectVersionId, solutionId })), skipDuplicates: true }) : null,
    input.relatedMaterialIds.length ? tx.projectVersionMaterial.createMany({ data: input.relatedMaterialIds.map((materialId) => ({ projectVersionId, materialId })), skipDuplicates: true }) : null,
    input.relatedArticleIds.length ? tx.projectVersionArticle.createMany({ data: input.relatedArticleIds.map((articleId) => ({ projectVersionId, articleId })), skipDuplicates: true }) : null,
  ]);
}

function revalidateProjectPaths(projectId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/projects");
  if (slug) revalidatePath(cmsContentPath("/projects", slug));
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(projectId: string | undefined, type: "success" | "error", message: string): never {
  const target = projectId ? `/dashboard/projects/${projectId}` : "/dashboard/projects";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
