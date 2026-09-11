"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readStringArray } from "@/modules/cms/validation";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { solutionDraftSchema, solutionIdSchema, solutionPublishSchema, type SolutionDraftInput, type SolutionPublishInput } from "./validation";

export async function createSolutionAction() {
  await requireAdmin();

  const solution = await prisma.solution.create({
    data: {
      status: ContentStatus.DRAFT,
      versions: { create: {} },
    },
    include: { versions: { select: { id: true }, take: 1 } },
  });

  await prisma.solution.update({
    where: { id: solution.id },
    data: { draftVersionId: solution.versions[0]?.id },
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
  revalidateSolutionPaths(parsed.data.solutionId);
  redirectWithMessage(parsed.data.solutionId, "success", "تم حفظ مسودة الحل دون تغيير النسخة المنشورة.");
}

export async function publishSolutionAction(formData: FormData) {
  await requireAdmin();

  const parsed = solutionPublishSchema.safeParse(readSolutionFormData(formData));
  if (!parsed.success || !parsed.data.solutionId) {
    redirectWithMessage(parsed.data?.solutionId, "error", "تعذر النشر. أكمل العنوان والرابط والوصف والمحتوى.");
  }

  try {
    await saveDraft(parsed.data.solutionId, parsed.data);
    await publishSolution(parsed.data.solutionId, parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل نشر الحل. بقيت النسخة المنشورة الحالية كما هي.";
    redirectWithMessage(parsed.data.solutionId, "error", message);
  }

  revalidateSolutionPaths(parsed.data.solutionId, parsed.data.slug);
  redirectWithMessage(parsed.data.solutionId, "success", "تم نشر الحل وتحديث الصفحة العامة.");
}

export async function archiveSolutionAction(formData: FormData) {
  await requireAdmin();

  const parsed = solutionIdSchema.safeParse({ solutionId: formData.get("solutionId") });
  if (!parsed.success) {
    redirect("/dashboard/solutions?error=تعذر تحديد الحل المطلوب أرشفته.");
  }

  await prisma.solution.update({ where: { id: parsed.data.solutionId }, data: { status: ContentStatus.ARCHIVED } });

  revalidateSolutionPaths(parsed.data.solutionId);
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
  const solution = await prisma.solution.findUnique({ where: { id: solutionId }, select: { draftVersionId: true } });
  if (!solution) throw new Error("الحل غير موجود.");

  const versionData = toVersionData(input);
  if (!solution.draftVersionId) {
    const draft = await prisma.solutionVersion.create({ data: { solutionId, ...versionData } });
    await prisma.solution.update({ where: { id: solutionId }, data: { draftVersionId: draft.id } });
    await replaceRelations(prisma, draft.id, input);
    return;
  }

  await prisma.solutionVersion.update({ where: { id: solution.draftVersionId }, data: versionData });
  await replaceRelations(prisma, solution.draftVersionId, input);
}

async function publishSolution(solutionId: string, input: SolutionPublishInput) {
  await prisma.$transaction(async (tx) => {
    const solution = await tx.solution.findUnique({ where: { id: solutionId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!solution?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");

    await assertSlugAvailable(tx, solutionId, input.slug);
    const published = await tx.solutionVersion.create({ data: { solutionId, ...toVersionData(input) } });
    await replaceRelations(tx, published.id, input);

    if (solution.publishedVersion?.slug && solution.publishedVersion.slug !== input.slug) {
      await tx.redirect.upsert({
        where: { sourcePath: `/solutions/${solution.publishedVersion.slug}` },
        update: { destinationPath: `/solutions/${input.slug}`, statusCode: 301 },
        create: { sourcePath: `/solutions/${solution.publishedVersion.slug}`, destinationPath: `/solutions/${input.slug}`, statusCode: 301 },
      });
    }

    await tx.solution.update({ where: { id: solutionId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
  });
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

async function replaceRelations(tx: Prisma.TransactionClient | typeof prisma, solutionVersionId: string, input: SolutionDraftInput) {
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

function revalidateSolutionPaths(solutionId: string, slug?: string) {
  revalidatePath("/dashboard/solutions");
  revalidatePath(`/dashboard/solutions/${solutionId}`);
  revalidatePath("/solutions");
  if (slug) revalidatePath(`/solutions/${slug}`);
}

function redirectWithMessage(solutionId: string | undefined, type: "success" | "error", message: string): never {
  const target = solutionId ? `/dashboard/solutions/${solutionId}` : "/dashboard/solutions";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
