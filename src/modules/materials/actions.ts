"use server";

import { ContentStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { materialDraftSchema, materialIdSchema, materialPublishSchema, type MaterialDraftInput, type MaterialPublishInput } from "./validation";

export async function createMaterialAction() {
  await requireAdmin();

  const material = await prisma.$transaction(async (tx) => {
    const created = await tx.material.create({ data: { status: ContentStatus.DRAFT, versions: { create: {} } }, include: { versions: { select: { id: true }, take: 1 } } });
    return tx.material.update({ where: { id: created.id }, data: { draftVersionId: created.versions[0]?.id } });
  });

  revalidatePath("/dashboard/materials");
  redirect(`/dashboard/materials/${material.id}?success=${encodeURIComponent("تم إنشاء مسودة مادة جديدة.")}`);
}

export async function saveMaterialDraftAction(formData: FormData) {
  await requireAdmin();

  const parsed = materialDraftSchema.safeParse(readMaterialFormData(formData));
  if (!parsed.success || !parsed.data.materialId) {
    redirectWithMessage(parsed.data?.materialId, "error", "تعذر حفظ المسودة. راجع الحقول المدخلة.");
  }

  await saveDraft(parsed.data.materialId, parsed.data);
  revalidateMaterialDraftPaths(parsed.data.materialId);
  redirectWithMessage(parsed.data.materialId, "success", "تم حفظ مسودة المادة دون تغيير النسخة المنشورة.");
}

export async function publishMaterialAction(formData: FormData) {
  await requireAdmin();

  const parsed = materialPublishSchema.safeParse(readMaterialFormData(formData));
  if (!parsed.success || !parsed.data.materialId) {
    redirectWithMessage(parsed.data?.materialId, "error", "تعذر النشر. أكمل الاسم والوصف والمحتوى.");
  }

  try {
    const { oldPath, slug } = await publishMaterial(parsed.data.materialId, parsed.data);
    revalidateMaterialPaths(parsed.data.materialId, slug, oldPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل نشر المادة. بقيت النسخة المنشورة الحالية كما هي.";
    redirectWithMessage(parsed.data.materialId, "error", message);
  }

  redirectWithMessage(parsed.data.materialId, "success", "تم نشر المادة وتحديث الصفحة العامة.");
}

export async function archiveMaterialAction(formData: FormData) {
  await requireAdmin();

  const parsed = materialIdSchema.safeParse({ materialId: formData.get("materialId") });
  if (!parsed.success) redirect("/dashboard/materials?error=تعذر تحديد المادة المطلوب أرشفتها.");

  const material = await prisma.material.update({ where: { id: parsed.data.materialId }, data: { status: ContentStatus.ARCHIVED }, select: { publishedVersion: { select: { slug: true } } } });
  revalidateMaterialPaths(parsed.data.materialId, undefined, material.publishedVersion?.slug ? cmsContentPath("/materials", material.publishedVersion.slug) : undefined);
  redirectWithMessage(parsed.data.materialId, "success", "تمت أرشفة المادة وإزالتها من العرض العام.");
}

function readMaterialFormData(formData: FormData) {
  return {
    materialId: formData.get("materialId") || undefined,
    name: formData.get("name") ?? "",
    shortDescription: formData.get("shortDescription") ?? "",
    content: formData.get("content") ?? "",
    advantages: readLines(formData.get("advantages")),
    limitations: readLines(formData.get("limitations")),
    maintenanceNotes: formData.get("maintenanceNotes") ?? "",
    recommendedUses: readLines(formData.get("recommendedUses")),
    heroMediaId: formData.get("heroMediaId") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    canonicalUrl: formData.get("canonicalUrl") ?? "",
    noIndex: formData.get("noIndex") === "on",
    openGraphTitle: formData.get("openGraphTitle") ?? "",
    openGraphDescription: formData.get("openGraphDescription") ?? "",
    openGraphImageId: formData.get("openGraphImageId") ?? "",
    relatedServiceIds: readStringArray(formData, "relatedServiceIds"),
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
    relatedProjectIds: readStringArray(formData, "relatedProjectIds"),
    relatedArticleIds: readStringArray(formData, "relatedArticleIds"),
    relatedFaqIds: readStringArray(formData, "relatedFaqIds"),
  };
}

async function saveDraft(materialId: string, input: MaterialDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "materials");
    await saveDraftInTransaction(tx, materialId, input);
  });
}

async function publishMaterial(materialId: string, input: MaterialPublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "materials");
    const material = await tx.material.findUnique({ where: { id: materialId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!material?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");

    const slug = await resolveMaterialSlug(tx, materialId, input, material.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });
    await tx.materialVersion.update({ where: { id: material.draftVersionId }, data: versionData });
    await replaceRelations(tx, material.draftVersionId, input);
    const published = await tx.materialVersion.create({ data: { materialId, ...versionData } });
    await replaceRelations(tx, published.id, input);

    const oldPath = material.publishedVersion?.slug ? cmsContentPath("/materials", material.publishedVersion.slug) : undefined;
    await tx.material.update({ where: { id: materialId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
    return { oldPath, slug };
  });
}

async function saveDraftInTransaction(tx: Prisma.TransactionClient, materialId: string, input: MaterialDraftInput) {
  const material = await tx.material.findUnique({ where: { id: materialId }, include: { publishedVersion: { select: { slug: true } } } });
  if (!material) throw new Error("المادة غير موجودة.");
  const slug = input.name ? await resolveMaterialSlug(tx, materialId, input, material.publishedVersion?.slug) : material.publishedVersion?.slug ?? null;
  const versionData = toVersionData({ ...input, slug: slug ?? undefined });
  let versionId = material.draftVersionId;
  if (!versionId) {
    const draft = await tx.materialVersion.create({ data: { materialId, ...versionData } });
    versionId = draft.id;
    await tx.material.update({ where: { id: materialId }, data: { draftVersionId: draft.id } });
  } else {
    await tx.materialVersion.update({ where: { id: versionId }, data: versionData });
  }
  await replaceRelations(tx, versionId, input);
}

async function resolveMaterialSlug(tx: Prisma.TransactionClient, materialId: string, input: MaterialDraftInput, publishedSlug?: string | null) {
  if (publishedSlug) return publishedSlug;
  return generateUniqueCmsSlug({ tx, contentType: "materials", contentId: materialId, source: input.name ?? "" });
}

function toVersionData(input: MaterialDraftInput) {
  return {
    name: input.name || null,
    slug: input.slug || null,
    shortDescription: input.shortDescription || null,
    content: input.content || null,
    advantages: input.advantages.length ? input.advantages : Prisma.JsonNull,
    limitations: input.limitations.length ? input.limitations : Prisma.JsonNull,
    maintenanceNotes: input.maintenanceNotes || null,
    recommendedUses: input.recommendedUses.length ? input.recommendedUses : Prisma.JsonNull,
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

async function replaceRelations(tx: Prisma.TransactionClient, materialVersionId: string, input: MaterialDraftInput) {
  await Promise.all([
    tx.materialVersionService.deleteMany({ where: { materialVersionId } }),
    tx.materialVersionSolution.deleteMany({ where: { materialVersionId } }),
    tx.materialVersionProject.deleteMany({ where: { materialVersionId } }),
    tx.materialVersionArticle.deleteMany({ where: { materialVersionId } }),
    tx.materialVersionFAQ.deleteMany({ where: { materialVersionId } }),
  ]);

  await Promise.all([
    input.relatedServiceIds.length ? tx.materialVersionService.createMany({ data: input.relatedServiceIds.map((serviceId) => ({ materialVersionId, serviceId })), skipDuplicates: true }) : null,
    input.relatedSolutionIds.length ? tx.materialVersionSolution.createMany({ data: input.relatedSolutionIds.map((solutionId) => ({ materialVersionId, solutionId })), skipDuplicates: true }) : null,
    input.relatedProjectIds.length ? tx.materialVersionProject.createMany({ data: input.relatedProjectIds.map((projectId) => ({ materialVersionId, projectId })), skipDuplicates: true }) : null,
    input.relatedArticleIds.length ? tx.materialVersionArticle.createMany({ data: input.relatedArticleIds.map((articleId) => ({ materialVersionId, articleId })), skipDuplicates: true }) : null,
    input.relatedFaqIds.length ? tx.materialVersionFAQ.createMany({ data: input.relatedFaqIds.map((faqId) => ({ materialVersionId, faqId })), skipDuplicates: true }) : null,
  ]);
}

function revalidateMaterialDraftPaths(materialId: string) {
  revalidatePath("/dashboard/materials");
  revalidatePath(`/dashboard/materials/${materialId}`);
  revalidatePath(`/preview/materials/${materialId}`);
}

function readLines(value: FormDataEntryValue | null) {
  return String(value ?? "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function revalidateMaterialPaths(materialId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/materials");
  revalidatePath(`/dashboard/materials/${materialId}`);
  revalidatePath("/materials");
  if (slug) revalidatePath(cmsContentPath("/materials", slug));
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(materialId: string | undefined, type: "success" | "error", message: string): never {
  const target = materialId ? `/dashboard/materials/${materialId}` : "/dashboard/materials";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
