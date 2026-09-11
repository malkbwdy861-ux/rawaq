"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readStringArray } from "@/modules/cms/validation";
import { savePublishedSlugRedirect } from "@/modules/redirects/service";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { materialDraftSchema, materialIdSchema, materialPublishSchema, type MaterialDraftInput, type MaterialPublishInput } from "./validation";

export async function createMaterialAction() {
  await requireAdmin();

  const material = await prisma.material.create({
    data: { status: ContentStatus.DRAFT, versions: { create: {} } },
    include: { versions: { select: { id: true }, take: 1 } },
  });

  await prisma.material.update({ where: { id: material.id }, data: { draftVersionId: material.versions[0]?.id } });

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
  revalidateMaterialPaths(parsed.data.materialId);
  redirectWithMessage(parsed.data.materialId, "success", "تم حفظ مسودة المادة دون تغيير النسخة المنشورة.");
}

export async function publishMaterialAction(formData: FormData) {
  await requireAdmin();

  const parsed = materialPublishSchema.safeParse(readMaterialFormData(formData));
  if (!parsed.success || !parsed.data.materialId) {
    redirectWithMessage(parsed.data?.materialId, "error", "تعذر النشر. أكمل الاسم والرابط والوصف والمحتوى.");
  }

  try {
    await saveDraft(parsed.data.materialId, parsed.data);
    const oldPath = await publishMaterial(parsed.data.materialId, parsed.data);
    revalidateMaterialPaths(parsed.data.materialId, parsed.data.slug, oldPath);
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

  await prisma.material.update({ where: { id: parsed.data.materialId }, data: { status: ContentStatus.ARCHIVED } });
  revalidateMaterialPaths(parsed.data.materialId);
  redirectWithMessage(parsed.data.materialId, "success", "تمت أرشفة المادة وإزالتها من العرض العام.");
}

function readMaterialFormData(formData: FormData) {
  return {
    materialId: formData.get("materialId") || undefined,
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
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
  const material = await prisma.material.findUnique({ where: { id: materialId }, select: { draftVersionId: true } });
  if (!material) throw new Error("المادة غير موجودة.");

  const versionData = toVersionData(input);
  if (!material.draftVersionId) {
    const draft = await prisma.materialVersion.create({ data: { materialId, ...versionData } });
    await prisma.material.update({ where: { id: materialId }, data: { draftVersionId: draft.id } });
    await replaceRelations(prisma, draft.id, input);
    return;
  }

  await prisma.materialVersion.update({ where: { id: material.draftVersionId }, data: versionData });
  await replaceRelations(prisma, material.draftVersionId, input);
}

async function publishMaterial(materialId: string, input: MaterialPublishInput) {
  return prisma.$transaction(async (tx) => {
    const material = await tx.material.findUnique({ where: { id: materialId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!material?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");

    await assertSlugAvailable(tx, materialId, input.slug);
    const published = await tx.materialVersion.create({ data: { materialId, ...toVersionData(input) } });
    await replaceRelations(tx, published.id, input);

    const oldPath = material.publishedVersion?.slug ? `/materials/${material.publishedVersion.slug}` : undefined;
    if (oldPath && material.publishedVersion?.slug !== input.slug) await savePublishedSlugRedirect(tx, oldPath, `/materials/${input.slug}`);

    await tx.material.update({ where: { id: materialId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
    return oldPath;
  });
}

async function assertSlugAvailable(tx: Prisma.TransactionClient, materialId: string, slug: string) {
  const collision = await tx.material.findFirst({
    where: { id: { not: materialId }, OR: [{ publishedVersion: { slug } }, { draftVersion: { slug } }] },
    select: { id: true },
  });

  if (collision) throw new Error("الرابط المختصر مستخدم في مادة أخرى.");
}

function toVersionData(input: MaterialDraftInput) {
  return {
    name: input.name || null,
    slug: input.slug || null,
    shortDescription: input.shortDescription || null,
    content: input.content || null,
    advantages: input.advantages.length ? input.advantages : undefined,
    limitations: input.limitations.length ? input.limitations : undefined,
    maintenanceNotes: input.maintenanceNotes || null,
    recommendedUses: input.recommendedUses.length ? input.recommendedUses : undefined,
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

async function replaceRelations(tx: Prisma.TransactionClient | typeof prisma, materialVersionId: string, input: MaterialDraftInput) {
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

function readLines(value: FormDataEntryValue | null) {
  return String(value ?? "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function revalidateMaterialPaths(materialId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/materials");
  revalidatePath(`/dashboard/materials/${materialId}`);
  revalidatePath("/materials");
  if (slug) revalidatePath(`/materials/${slug}`);
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(materialId: string | undefined, type: "success" | "error", message: string): never {
  const target = materialId ? `/dashboard/materials/${materialId}` : "/dashboard/materials";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
