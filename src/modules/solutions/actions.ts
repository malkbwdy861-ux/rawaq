"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readStringArray } from "@/modules/cms/validation";
import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { savePublishedSlugRedirect } from "@/modules/redirects/service";
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
    redirectWithMessage(parsed.data?.solutionId, "error", "تعذر النشر. أكمل العنوان والرابط والوصف والمحتوى.");
  }

  try {
    const oldPath = await publishSolution(parsed.data.solutionId, parsed.data);
    revalidateSolutionPaths(parsed.data.solutionId, parsed.data.slug, oldPath);
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

  revalidateSolutionPaths(parsed.data.solutionId, undefined, solution.publishedVersion?.slug ? `/solutions/${solution.publishedVersion.slug}` : undefined);
  redirectWithMessage(parsed.data.solutionId, "success", "تمت أرشفة الحل وإزالته من العرض العام.");
}

function readSolutionFormData(formData: FormData) {
  return {
    solutionId: formData.get("solutionId") || undefined,
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
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
  await prisma.$transaction(async (tx) => saveDraftInTransaction(tx, solutionId, input));
}

async function publishSolution(solutionId: string, input: SolutionPublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "solutions");
    const solution = await tx.solution.findUnique({ where: { id: solutionId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!solution?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");

    await tx.solutionVersion.update({ where: { id: solution.draftVersionId }, data: toVersionData(input) });
    await replaceRelations(tx, solution.draftVersionId, input);
    await assertSlugAvailable(tx, solutionId, input.slug);
    const published = await tx.solutionVersion.create({ data: { solutionId, ...toVersionData(input) } });
    await replaceRelations(tx, published.id, input);

    const oldPath = solution.publishedVersion?.slug ? `/solutions/${solution.publishedVersion.slug}` : undefined;
    if (oldPath && solution.publishedVersion?.slug !== input.slug) await savePublishedSlugRedirect(tx, oldPath, `/solutions/${input.slug}`);

    await tx.solution.update({ where: { id: solutionId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
    return oldPath;
  });
}

async function saveDraftInTransaction(tx: Prisma.TransactionClient, solutionId: string, input: SolutionDraftInput) {
  const solution = await tx.solution.findUnique({ where: { id: solutionId }, select: { draftVersionId: true } });
  if (!solution) throw new Error("الحل غير موجود.");
  let versionId = solution.draftVersionId;
  if (!versionId) {
    const draft = await tx.solutionVersion.create({ data: { solutionId, ...toVersionData(input) } });
    versionId = draft.id;
    await tx.solution.update({ where: { id: solutionId }, data: { draftVersionId: draft.id } });
  } else {
    await tx.solutionVersion.update({ where: { id: versionId }, data: toVersionData(input) });
  }
  await replaceRelations(tx, versionId, input);
}

async function assertSlugAvailable(tx: Prisma.TransactionClient, solutionId: string, slug: string) {
  const collision = await tx.solution.findFirst({
    where: { id: { not: solutionId }, OR: [{ publishedVersion: { slug } }, { draftVersion: { slug } }] },
    select: { id: true },
  });

  if (collision) throw new Error("الرابط المختصر مستخدم في حل آخر.");
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
  if (slug) revalidatePath(`/solutions/${slug}`);
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(solutionId: string | undefined, type: "success" | "error", message: string): never {
  const target = solutionId ? `/dashboard/solutions/${solutionId}` : "/dashboard/solutions";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
