"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { projectDraftSchema, projectIdSchema, projectPublishSchema, type ProjectDraftInput, type ProjectPublishInput } from "./validation";

export type ProjectGalleryValue = { mediaId: string; caption: string };

export type ProjectFormValues = {
  projectId?: string;
  title: string;
  shortDescription: string;
  content: string;
  challenge: string;
  solutionSummary: string;
  technicalDetails: string;
  completedAt: string;
  city: string;
  district: string;
  categoryId: string;
  coverMediaId: string;
  gallery: ProjectGalleryValue[];
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImageId: string;
  relatedServiceIds: string[];
  relatedSolutionIds: string[];
  relatedMaterialIds: string[];
  relatedArticleIds: string[];
};

export type ProjectFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: ProjectFormValues;
  revision: number;
};

export async function submitProjectAction(previousState: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  await requireAdmin();

  const input = readProjectFormData(formData);
  const intent = formData.get("intent") === "publish" ? "publish" : "saveDraft";
  const parsed = (intent === "publish" ? projectPublishSchema : projectDraftSchema).safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: intent === "publish" ? "تعذر نشر المشروع. راجع الحقول المحددة أدناه." : "تعذر حفظ المسودة. راجع الحقول المحددة أدناه.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: input,
      revision: previousState.revision + 1,
    };
  }

  if (intent === "saveDraft") {
    let projectId: string;
    try {
      projectId = parsed.data.projectId ?? await createProjectDraft(parsed.data);
      if (parsed.data.projectId) await saveDraft(parsed.data.projectId, parsed.data);
    } catch (error) {
      return mutationErrorState(previousState, input, error, "saveDraft");
    }
    revalidateProjectDraftPaths(projectId);
    redirect(`/dashboard/projects/${projectId}?success=${encodeURIComponent("تم حفظ مسودة المشروع.")}`);
  }

  let published: Awaited<ReturnType<typeof publishProject>>;
  try {
    published = await publishProject(parsed.data.projectId, parsed.data as ProjectPublishInput);
  } catch (error) {
    return mutationErrorState(previousState, input, error, "publish");
  }
  revalidateProjectPaths(published.projectId, published.slug, published.oldPath);
  redirect(cmsContentPath("/projects", published.slug));
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();

  const parsed = projectIdSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) redirect("/dashboard/projects?error=تعذر تحديد المشروع المطلوب حذفه.");

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { publishedVersion: { select: { slug: true } } },
  });
  if (!project) redirect("/dashboard/projects?error=المشروع غير موجود أو حُذف مسبقاً.");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.serviceVersionProject.deleteMany({ where: { projectId: parsed.data.projectId } });
      await tx.solutionVersionProject.deleteMany({ where: { projectId: parsed.data.projectId } });
      await tx.materialVersionProject.deleteMany({ where: { projectId: parsed.data.projectId } });
      await tx.articleVersionProject.deleteMany({ where: { projectId: parsed.data.projectId } });
      await tx.project.delete({ where: { id: parsed.data.projectId } });
    });
  } catch {
    redirect("/dashboard/projects?error=تعذر حذف المشروع. حاول مرة أخرى.");
  }

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  if (project.publishedVersion?.slug) revalidatePath(cmsContentPath("/projects", project.publishedVersion.slug));
  revalidatePath("/sitemap.xml");
  redirect(`/dashboard/projects?success=${encodeURIComponent("تم حذف المشروع نهائياً.")}`);
}

function readProjectFormData(formData: FormData): ProjectFormValues {
  const galleryCaptions = formData.getAll("galleryCaptions");
  return {
    projectId: readText(formData, "projectId") || undefined,
    title: readText(formData, "title"),
    shortDescription: readText(formData, "shortDescription"),
    content: readText(formData, "content"),
    challenge: readText(formData, "challenge"),
    solutionSummary: readText(formData, "solutionSummary"),
    technicalDetails: readText(formData, "technicalDetails"),
    completedAt: readText(formData, "completedAt"),
    city: readText(formData, "city"),
    district: readText(formData, "district"),
    categoryId: readText(formData, "categoryId") === "NONE" ? "" : readText(formData, "categoryId"),
    coverMediaId: readText(formData, "coverMediaId"),
    gallery: formData.getAll("galleryMediaIds").map((mediaId, index) => ({ mediaId: String(mediaId), caption: String(galleryCaptions[index] ?? "") })),
    seoTitle: readText(formData, "seoTitle"),
    seoDescription: readText(formData, "seoDescription"),
    canonicalUrl: readText(formData, "canonicalUrl"),
    noIndex: formData.get("noIndex") === "on",
    openGraphTitle: readText(formData, "openGraphTitle"),
    openGraphDescription: readText(formData, "openGraphDescription"),
    openGraphImageId: readText(formData, "openGraphImageId"),
    relatedServiceIds: readStringArray(formData, "relatedServiceIds"),
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
    relatedMaterialIds: readStringArray(formData, "relatedMaterialIds"),
    relatedArticleIds: readStringArray(formData, "relatedArticleIds"),
  };
}

function readText(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}

function mutationErrorState(previousState: ProjectFormState, values: ProjectFormValues, error: unknown, intent: "saveDraft" | "publish"): ProjectFormState {
  console.error(`Project ${intent} failed`, error);
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
  let message = intent === "publish"
    ? "تعذر نشر المشروع بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج والنسخة المنشورة الحالية كما هي."
    : "تعذر حفظ المسودة بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج كما هي.";

  if (error instanceof Error && /^[\u0600-\u06ff]/u.test(error.message)) message = error.message;
  if (code === "P2003") message = "تعذر الحفظ لأن أحد العناصر المرتبطة أو الصور لم يعد موجوداً. حدّث اختياراتك ثم حاول مرة أخرى.";
  if (code === "P2025") message = "المشروع لم يعد موجوداً. ارجع إلى قائمة المشاريع وحدّث الصفحة.";
  return { status: "error", message, values, revision: previousState.revision + 1 };
}

async function createProjectDraft(input: ProjectDraftInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "projects");
    await validateProjectCategory(tx, input.categoryId);
    const project = await tx.project.create({ data: { status: ContentStatus.DRAFT } });
    const slug = input.title ? await resolveProjectSlug(tx, project.id, input) : null;
    const draft = await tx.projectVersion.create({ data: { projectId: project.id, ...toVersionData({ ...input, slug: slug ?? undefined }) } });
    await replaceVersionCollections(tx, draft.id, input);
    await tx.project.update({ where: { id: project.id }, data: { draftVersionId: draft.id } });
    return project.id;
  });
}

async function saveDraft(projectId: string, input: ProjectDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "projects");
    await saveDraftInTransaction(tx, projectId, input);
  });
}

async function saveDraftInTransaction(tx: Prisma.TransactionClient, projectId: string, input: ProjectDraftInput) {
  await validateProjectCategory(tx, input.categoryId);
  const project = await tx.project.findUnique({ where: { id: projectId }, include: { publishedVersion: { select: { slug: true } } } });
  if (!project) throw new Error("المشروع غير موجود.");
  const slug = input.title ? await resolveProjectSlug(tx, projectId, input, project.publishedVersion?.slug) : project.publishedVersion?.slug ?? null;
  const versionData = toVersionData({ ...input, slug: slug ?? undefined });
  let versionId = project.draftVersionId;
  if (versionId) {
    await tx.projectVersion.update({ where: { id: versionId }, data: versionData });
  } else {
    const draft = await tx.projectVersion.create({ data: { projectId, ...versionData } });
    versionId = draft.id;
    await tx.project.update({ where: { id: projectId }, data: { draftVersionId: draft.id } });
  }
  if (project.status === ContentStatus.ARCHIVED) await tx.project.update({ where: { id: projectId }, data: { status: ContentStatus.DRAFT } });
  await replaceVersionCollections(tx, versionId, input);
}

async function publishProject(existingProjectId: string | undefined, input: ProjectPublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "projects");
    await validateProjectCategory(tx, input.categoryId);
    const project = existingProjectId
      ? await tx.project.findUnique({ where: { id: existingProjectId }, include: { publishedVersion: { select: { slug: true } } } })
      : await tx.project.create({ data: { status: ContentStatus.DRAFT }, include: { publishedVersion: { select: { slug: true } } } });
    if (!project) throw new Error("المشروع غير موجود.");

    const slug = await resolveProjectSlug(tx, project.id, input, project.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });
    let draftVersionId = project.draftVersionId;
    if (draftVersionId) await tx.projectVersion.update({ where: { id: draftVersionId }, data: versionData });
    else {
      const draft = await tx.projectVersion.create({ data: { projectId: project.id, ...versionData } });
      draftVersionId = draft.id;
    }
    await replaceVersionCollections(tx, draftVersionId, input);

    const published = await tx.projectVersion.create({ data: { projectId: project.id, ...versionData } });
    await replaceVersionCollections(tx, published.id, input);
    const oldPath = project.publishedVersion?.slug ? cmsContentPath("/projects", project.publishedVersion.slug) : undefined;
    await tx.project.update({
      where: { id: project.id },
      data: { status: ContentStatus.PUBLISHED, draftVersionId, publishedVersionId: published.id, publishedAt: new Date() },
    });
    return { projectId: project.id, oldPath, slug };
  });
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
    categoryId: input.categoryId || null,
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

async function validateProjectCategory(tx: Prisma.TransactionClient, categoryId?: string) {
  if (!categoryId) return;
  const category = await tx.projectCategory.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw new Error("تصنيف المشروع المحدد لم يعد موجوداً.");
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

function revalidateProjectDraftPaths(projectId: string) {
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/preview/projects/${projectId}`);
}

function revalidateProjectPaths(projectId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/projects");
  if (slug) revalidatePath(cmsContentPath("/projects", slug));
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}
