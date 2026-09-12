"use server";

import { ContentStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { materialDraftSchema, materialIdSchema, materialPublishSchema, type MaterialDraftInput, type MaterialPublishInput } from "./validation";

export type MaterialFormValues = {
  materialId?: string;
  name: string;
  shortDescription: string;
  content: string;
  advantages: string[];
  limitations: string[];
  maintenanceNotes: string;
  recommendedUses: string[];
  heroMediaId: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImageId: string;
  relatedServiceIds: string[];
  relatedSolutionIds: string[];
  relatedProjectIds: string[];
  relatedArticleIds: string[];
  relatedFaqIds: string[];
};

export type MaterialFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: MaterialFormValues;
  revision: number;
};

export async function submitMaterialAction(previousState: MaterialFormState, formData: FormData): Promise<MaterialFormState> {
  await requireAdmin();

  const input = readMaterialFormData(formData);
  const intent = formData.get("intent") === "publish" ? "publish" : "saveDraft";
  const parsed = (intent === "publish" ? materialPublishSchema : materialDraftSchema).safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: intent === "publish" ? "تعذر نشر المادة. راجع الحقول المحددة أدناه." : "تعذر حفظ المسودة. راجع الحقول المحددة أدناه.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: input,
      revision: previousState.revision + 1,
    };
  }

  if (intent === "saveDraft") {
    let materialId: string;
    try {
      materialId = parsed.data.materialId ?? await createMaterialDraft(parsed.data);
      if (parsed.data.materialId) await saveDraft(materialId, parsed.data);
    } catch (error) {
      return mutationErrorState(previousState, input, error, "saveDraft");
    }
    revalidateMaterialDraftPaths(materialId);
    redirectWithMessage(materialId, "success", "تم حفظ مسودة المادة.");
  }

  let published: Awaited<ReturnType<typeof publishMaterial>>;
  try {
    published = await publishMaterial(parsed.data.materialId, parsed.data as MaterialPublishInput);
  } catch (error) {
    return mutationErrorState(previousState, input, error, "publish");
  }
  revalidateMaterialPaths(published.materialId, published.slug, published.oldPath);
  redirect(cmsContentPath("/materials", published.slug));
}

export async function deleteMaterialAction(formData: FormData) {
  await requireAdmin();

  const parsed = materialIdSchema.safeParse({ materialId: formData.get("materialId") });
  if (!parsed.success) redirect("/dashboard/materials?error=تعذر تحديد المادة المطلوب حذفها.");

  const material = await prisma.material.findUnique({
    where: { id: parsed.data.materialId },
    select: { publishedVersion: { select: { slug: true } } },
  });
  if (!material) redirect("/dashboard/materials?error=المادة غير موجودة أو حُذفت مسبقاً.");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.serviceVersionMaterial.deleteMany({ where: { materialId: parsed.data.materialId } });
      await tx.solutionVersionMaterial.deleteMany({ where: { materialId: parsed.data.materialId } });
      await tx.projectVersionMaterial.deleteMany({ where: { materialId: parsed.data.materialId } });
      await tx.articleVersionMaterial.deleteMany({ where: { materialId: parsed.data.materialId } });
      await tx.material.delete({ where: { id: parsed.data.materialId } });
    });
  } catch {
    redirect("/dashboard/materials?error=تعذر حذف المادة. حاول مرة أخرى.");
  }

  revalidatePath("/dashboard/materials");
  revalidatePath("/dashboard");
  revalidatePath("/materials");
  if (material.publishedVersion?.slug) revalidatePath(cmsContentPath("/materials", material.publishedVersion.slug));
  revalidatePath("/sitemap.xml");
  redirect(`/dashboard/materials?success=${encodeURIComponent("تم حذف المادة نهائياً.")}`);
}

function readMaterialFormData(formData: FormData): MaterialFormValues {
  return {
    materialId: readText(formData, "materialId") || undefined,
    name: readText(formData, "name"),
    shortDescription: readText(formData, "shortDescription"),
    content: readText(formData, "content"),
    advantages: readLines(formData, "advantages"),
    limitations: readLines(formData, "limitations"),
    maintenanceNotes: readText(formData, "maintenanceNotes"),
    recommendedUses: readLines(formData, "recommendedUses"),
    heroMediaId: readText(formData, "heroMediaId"),
    seoTitle: readText(formData, "seoTitle"),
    seoDescription: readText(formData, "seoDescription"),
    canonicalUrl: readText(formData, "canonicalUrl"),
    noIndex: formData.get("noIndex") === "on",
    openGraphTitle: readText(formData, "openGraphTitle"),
    openGraphDescription: readText(formData, "openGraphDescription"),
    openGraphImageId: readText(formData, "openGraphImageId"),
    relatedServiceIds: readStringArray(formData, "relatedServiceIds"),
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
    relatedProjectIds: readStringArray(formData, "relatedProjectIds"),
    relatedArticleIds: readStringArray(formData, "relatedArticleIds"),
    relatedFaqIds: readStringArray(formData, "relatedFaqIds"),
  };
}

function readText(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}

function readLines(formData: FormData, fieldName: string) {
  return readText(formData, fieldName).split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function mutationErrorState(previousState: MaterialFormState, values: MaterialFormValues, error: unknown, intent: "saveDraft" | "publish"): MaterialFormState {
  console.error(`Material ${intent} failed`, error);
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
  let message = intent === "publish"
    ? "تعذر نشر المادة بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج والنسخة المنشورة الحالية كما هي."
    : "تعذر حفظ المسودة بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج كما هي.";

  if (error instanceof Error && /^[\u0600-\u06ff]/u.test(error.message)) message = error.message;
  if (code === "P2003") message = "تعذر الحفظ لأن أحد العناصر المرتبطة أو الصور لم يعد موجوداً. حدّث اختياراتك ثم حاول مرة أخرى.";
  if (code === "P2025") message = "المادة لم تعد موجودة. ارجع إلى قائمة المواد وحدّث الصفحة.";

  return { status: "error", message, values, revision: previousState.revision + 1 };
}

async function saveDraft(materialId: string, input: MaterialDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "materials");
    await saveDraftInTransaction(tx, materialId, input);
  });
}

async function createMaterialDraft(input: MaterialDraftInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "materials");
    const material = await tx.material.create({ data: { status: ContentStatus.DRAFT } });
    const slug = input.name ? await resolveMaterialSlug(tx, material.id, input) : null;
    const draft = await tx.materialVersion.create({ data: { materialId: material.id, ...toVersionData({ ...input, slug: slug ?? undefined }) } });
    await replaceRelations(tx, draft.id, input);
    await tx.material.update({ where: { id: material.id }, data: { draftVersionId: draft.id } });
    return material.id;
  });
}

async function publishMaterial(existingMaterialId: string | undefined, input: MaterialPublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "materials");
    const material = existingMaterialId
      ? await tx.material.findUnique({ where: { id: existingMaterialId }, include: { publishedVersion: { select: { slug: true } } } })
      : await tx.material.create({ data: { status: ContentStatus.DRAFT }, include: { publishedVersion: { select: { slug: true } } } });

    if (!material) throw new Error("المادة غير موجودة.");
    const materialId = material.id;
    const slug = await resolveMaterialSlug(tx, materialId, input, material.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });

    let draftVersionId = material.draftVersionId;
    if (draftVersionId) {
      await tx.materialVersion.update({ where: { id: draftVersionId }, data: versionData });
    } else {
      const draft = await tx.materialVersion.create({ data: { materialId, ...versionData } });
      draftVersionId = draft.id;
    }
    await replaceRelations(tx, draftVersionId, input);

    const published = await tx.materialVersion.create({ data: { materialId, ...versionData } });
    await replaceRelations(tx, published.id, input);
    const oldPath = material.publishedVersion?.slug ? cmsContentPath("/materials", material.publishedVersion.slug) : undefined;

    await tx.material.update({
      where: { id: materialId },
      data: { status: ContentStatus.PUBLISHED, draftVersionId, publishedVersionId: published.id, publishedAt: new Date() },
    });
    return { materialId, oldPath, slug };
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
  if (material.status === ContentStatus.ARCHIVED) {
    await tx.material.update({ where: { id: materialId }, data: { status: ContentStatus.DRAFT } });
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

function revalidateMaterialPaths(materialId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/materials");
  revalidatePath(`/dashboard/materials/${materialId}`);
  revalidatePath("/materials");
  if (slug) revalidatePath(cmsContentPath("/materials", slug));
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(materialId: string | undefined, type: "success" | "error", message: string): never {
  const target = materialId ? `/dashboard/materials/${materialId}` : "/dashboard/materials/new";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
