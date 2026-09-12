"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { solutionDraftSchema, solutionIdSchema, solutionPublishSchema, type SolutionDraftInput, type SolutionPublishInput } from "./validation";

export async function createSolutionAction() {
  await requireAdmin();

  const solution = await prisma.$transaction(async (tx) => {
    const created = await tx.solution.create({ data: { status: ContentStatus.DRAFT, versions: { create: {} } }, include: { versions: { select: { id: true }, take: 1 } } });
    return tx.solution.update({ where: { id: created.id }, data: { draftVersionId: created.versions[0]?.id } });
  });

  revalidatePath("/dashboard/solutions");
  redirect(`/dashboard/solutions/${solution.id}?success=${encodeURIComponent("تم إنشاء مسودة حل جديدة.")}`);
}

export async function saveSolutionDraftAction(formData: FormData) {
  await requireAdmin();

  const parsed = solutionDraftSchema.safeParse(readSolutionFormData(formData));
  if (!parsed.success || !parsed.data.solutionId) {
    redirectWithMessage(parsed.data?.solutionId, "error", "تعذر حفظ المسودة. راجع الحقول المدخلة.");
  }

  await saveDraft(parsed.data.solutionId, parsed.data);
  revalidateSolutionDraftPaths(parsed.data.solutionId);
  redirectWithMessage(parsed.data.solutionId, "success", "تم حفظ مسودة الحل دون تغيير النسخة المنشورة.");
}

export async function publishSolutionAction(formData: FormData) {
  await requireAdmin();

  const parsed = solutionPublishSchema.safeParse(readSolutionFormData(formData));
  if (!parsed.success || !parsed.data.solutionId) {
    redirectWithMessage(parsed.data?.solutionId, "error", "تعذر النشر. أكمل العنوان والوصف والمحتوى.");
  }

  try {
    const { oldPath, slug } = await publishSolution(parsed.data.solutionId, parsed.data);
    revalidateSolutionPaths(parsed.data.solutionId, slug, oldPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل نشر الحل. بقيت النسخة المنشورة الحالية كما هي.";
    redirectWithMessage(parsed.data.solutionId, "error", message);
  }

  redirectWithMessage(parsed.data.solutionId, "success", "تم نشر الحل وتحديث الصفحة العامة.");
}

export async function archiveSolutionAction(formData: FormData) {
  await requireAdmin();

  const parsed = solutionIdSchema.safeParse({ solutionId: formData.get("solutionId") });
  if (!parsed.success) {
    redirect("/dashboard/solutions?error=تعذر تحديد الحل المطلوب أرشفته.");
  }

  const solution = await prisma.solution.update({ where: { id: parsed.data.solutionId }, data: { status: ContentStatus.ARCHIVED }, select: { publishedVersion: { select: { slug: true } } } });

  revalidateSolutionPaths(parsed.data.solutionId, undefined, solution.publishedVersion?.slug ? cmsContentPath("/solutions", solution.publishedVersion.slug) : undefined);
  redirectWithMessage(parsed.data.solutionId, "success", "تمت أرشفة الحل وإزالته من العرض العام.");
}

function readSolutionFormData(formData: FormData) {
  return {
    solutionId: formData.get("solutionId") || undefined,
    title: formData.get("title") ?? "",
    shortDescription: formData.get("shortDescription") ?? "",
    content: formData.get("content") ?? "",
    heroMediaId: formData.get("heroMediaId") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    canonicalUrl: formData.get("canonicalUrl") ?? "",
    noIndex: formData.get("noIndex") === "on",
    openGraphTitle: formData.get("openGraphTitle") ?? "",
    openGraphDescription: formData.get("openGraphDescription") ?? "",
    openGraphImageId: formData.get("openGraphImageId") ?? "",
    relatedServiceIds: readStringArray(formData, "relatedServiceIds"),
    relatedMaterialIds: readStringArray(formData, "relatedMaterialIds"),
    relatedProjectIds: readStringArray(formData, "relatedProjectIds"),
    relatedArticleIds: readStringArray(formData, "relatedArticleIds"),
    relatedFaqIds: readStringArray(formData, "relatedFaqIds"),
  };
}

async function saveDraft(solutionId: string, input: SolutionDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "solutions");
    await saveDraftInTransaction(tx, solutionId, input);
  });
}

async function publishSolution(solutionId: string, input: SolutionPublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "solutions");
    const solution = await tx.solution.findUnique({ where: { id: solutionId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!solution?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");

    const slug = await resolveSolutionSlug(tx, solutionId, input, solution.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });
    await tx.solutionVersion.update({ where: { id: solution.draftVersionId }, data: versionData });
    await replaceRelations(tx, solution.draftVersionId, input);
    const published = await tx.solutionVersion.create({ data: { solutionId, ...versionData } });
    await replaceRelations(tx, published.id, input);

    const oldPath = solution.publishedVersion?.slug ? cmsContentPath("/solutions", solution.publishedVersion.slug) : undefined;
    await tx.solution.update({ where: { id: solutionId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
    return { oldPath, slug };
  });
}

async function saveDraftInTransaction(tx: Prisma.TransactionClient, solutionId: string, input: SolutionDraftInput) {
  const solution = await tx.solution.findUnique({ where: { id: solutionId }, include: { publishedVersion: { select: { slug: true } } } });
  if (!solution) throw new Error("الحل غير موجود.");
  const slug = input.title ? await resolveSolutionSlug(tx, solutionId, input, solution.publishedVersion?.slug) : solution.publishedVersion?.slug ?? null;
  const versionData = toVersionData({ ...input, slug: slug ?? undefined });
  let versionId = solution.draftVersionId;
  if (!versionId) {
    const draft = await tx.solutionVersion.create({ data: { solutionId, ...versionData } });
    versionId = draft.id;
    await tx.solution.update({ where: { id: solutionId }, data: { draftVersionId: draft.id } });
  } else {
    await tx.solutionVersion.update({ where: { id: versionId }, data: versionData });
  }
  await replaceRelations(tx, versionId, input);
}

async function resolveSolutionSlug(tx: Prisma.TransactionClient, solutionId: string, input: SolutionDraftInput, publishedSlug?: string | null) {
  if (publishedSlug) return publishedSlug;
  return generateUniqueCmsSlug({ tx, contentType: "solutions", contentId: solutionId, source: input.title ?? "" });
}

function toVersionData(input: SolutionDraftInput) {
  return {
    title: input.title || null,
    slug: input.slug || null,
    shortDescription: input.shortDescription || null,
    content: input.content || null,
    heroMediaId: input.heroMediaId || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    noIndex: input.noIndex,
    openGraphTitle: input.openGraphTitle || null,
    openGraphDescription: input.openGraphDescription || null,
    openGraphImageId: input.openGraphImageId || null,
  };
}

async function replaceRelations(tx: Prisma.TransactionClient, solutionVersionId: string, input: SolutionDraftInput) {
  await Promise.all([
    tx.solutionVersionService.deleteMany({ where: { solutionVersionId } }),
    tx.solutionVersionMaterial.deleteMany({ where: { solutionVersionId } }),
    tx.solutionVersionProject.deleteMany({ where: { solutionVersionId } }),
    tx.solutionVersionArticle.deleteMany({ where: { solutionVersionId } }),
    tx.solutionVersionFAQ.deleteMany({ where: { solutionVersionId } }),
  ]);

  await Promise.all([
    input.relatedServiceIds.length ? tx.solutionVersionService.createMany({ data: input.relatedServiceIds.map((serviceId) => ({ solutionVersionId, serviceId })), skipDuplicates: true }) : null,
    input.relatedMaterialIds.length ? tx.solutionVersionMaterial.createMany({ data: input.relatedMaterialIds.map((materialId) => ({ solutionVersionId, materialId })), skipDuplicates: true }) : null,
    input.relatedProjectIds.length ? tx.solutionVersionProject.createMany({ data: input.relatedProjectIds.map((projectId) => ({ solutionVersionId, projectId })), skipDuplicates: true }) : null,
    input.relatedArticleIds.length ? tx.solutionVersionArticle.createMany({ data: input.relatedArticleIds.map((articleId) => ({ solutionVersionId, articleId })), skipDuplicates: true }) : null,
    input.relatedFaqIds.length ? tx.solutionVersionFAQ.createMany({ data: input.relatedFaqIds.map((faqId) => ({ solutionVersionId, faqId })), skipDuplicates: true }) : null,
  ]);
}

function revalidateSolutionDraftPaths(solutionId: string) {
  revalidatePath("/dashboard/solutions");
  revalidatePath(`/dashboard/solutions/${solutionId}`);
  revalidatePath(`/preview/solutions/${solutionId}`);
}

function revalidateSolutionPaths(solutionId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/solutions");
  revalidatePath(`/dashboard/solutions/${solutionId}`);
  revalidatePath("/solutions");
  if (slug) revalidatePath(cmsContentPath("/solutions", slug));
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(solutionId: string | undefined, type: "success" | "error", message: string): never {
  const target = solutionId ? `/dashboard/solutions/${solutionId}` : "/dashboard/solutions";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
