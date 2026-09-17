"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { assertCmsEntityIdsExist, cleanupCmsEntityReferences } from "@/modules/cms/references";
import { revalidateCmsReferenceConsumers } from "@/modules/cms/reference-cache";
import { runSerializableCmsTransaction } from "@/modules/cms/transactions";
import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { solutionDraftSchema, solutionIdSchema, solutionPublishSchema, type SolutionDraftInput, type SolutionPublishInput } from "./validation";

export type SolutionFormValues = {
  solutionId?: string;
  title: string;
  shortDescription: string;
  content: string;
  heroMediaId: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImageId: string;
  relatedServiceIds: string[];
  relatedMaterialIds: string[];
  relatedProjectIds: string[];
  relatedArticleIds: string[];
  relatedFaqIds: string[];
};

export type SolutionFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: SolutionFormValues;
  revision: number;
};

export async function submitSolutionAction(previousState: SolutionFormState, formData: FormData): Promise<SolutionFormState> {
  await requireAdmin();

  const input = readSolutionFormData(formData);
  const intent = formData.get("intent") === "publish" ? "publish" : "saveDraft";
  const parsed = (intent === "publish" ? solutionPublishSchema : solutionDraftSchema).safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: intent === "publish" ? "تعذر نشر الحل. راجع الحقول المحددة أدناه." : "تعذر حفظ المسودة. راجع الحقول المحددة أدناه.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: input,
      revision: previousState.revision + 1,
    };
  }

  if (intent === "saveDraft") {
    let solutionId: string;
    try {
      solutionId = parsed.data.solutionId ?? await createSolutionDraft(parsed.data);
      if (parsed.data.solutionId) await saveDraft(parsed.data.solutionId, parsed.data);
    } catch (error) {
      return mutationErrorState(previousState, input, error, "saveDraft");
    }
    revalidateSolutionDraftPaths(solutionId);
    redirectWithMessage(solutionId, "success", "تم حفظ مسودة الحل.");
  }

  let published: Awaited<ReturnType<typeof publishSolution>>;
  try {
    published = await publishSolution(parsed.data.solutionId, parsed.data as SolutionPublishInput);
  } catch (error) {
    return mutationErrorState(previousState, input, error, "publish");
  }
  revalidateSolutionPaths(published.solutionId, published.slug, published.oldPath);
  redirect(cmsContentPath("/solutions", published.slug));
}

export async function deleteSolutionAction(formData: FormData) {
  await requireAdmin();

  const parsed = solutionIdSchema.safeParse({ solutionId: formData.get("solutionId") });
  if (!parsed.success) redirect("/dashboard/solutions?error=تعذر تحديد الحل المطلوب حذفه.");

  let solution: { publishedVersion: { slug: string | null } | null } | null;
  try {
    solution = await prisma.solution.findUnique({
      where: { id: parsed.data.solutionId },
      select: { publishedVersion: { select: { slug: true } } },
    });
  } catch (error) {
    console.error("Solution lookup before delete failed", error);
    redirect("/dashboard/solutions?error=تعذر حذف الحل. حاول مرة أخرى.");
  }
  if (!solution) redirect("/dashboard/solutions?error=الحل غير موجود أو حُذف مسبقاً.");
  const publishedSlug = solution.publishedVersion?.slug;

  try {
    await runSerializableCmsTransaction(async (tx) => {
      await cleanupCmsEntityReferences(tx, "solution", parsed.data.solutionId);
      await tx.solution.delete({ where: { id: parsed.data.solutionId } });
    });
  } catch (error) {
    console.error("Solution delete failed", error);
    redirect("/dashboard/solutions?error=تعذر حذف الحل. حاول مرة أخرى.");
  }

  revalidatePath("/dashboard/solutions");
  revalidatePath("/dashboard");
  revalidatePath("/solutions");
  revalidatePath("/");
  revalidateCmsReferenceConsumers();
  if (publishedSlug) revalidatePath(cmsContentPath("/solutions", publishedSlug));
  revalidatePath("/sitemap.xml");
  redirect(`/dashboard/solutions?success=${encodeURIComponent("تم حذف الحل نهائياً.")}`);
}

function readSolutionFormData(formData: FormData): SolutionFormValues {
  return {
    solutionId: readText(formData, "solutionId") || undefined,
    title: readText(formData, "title"),
    shortDescription: readText(formData, "shortDescription"),
    content: readText(formData, "content"),
    heroMediaId: readText(formData, "heroMediaId"),
    seoTitle: readText(formData, "seoTitle"),
    seoDescription: readText(formData, "seoDescription"),
    canonicalUrl: readText(formData, "canonicalUrl"),
    noIndex: formData.get("noIndex") === "on",
    openGraphTitle: readText(formData, "openGraphTitle"),
    openGraphDescription: readText(formData, "openGraphDescription"),
    openGraphImageId: readText(formData, "openGraphImageId"),
    relatedServiceIds: readStringArray(formData, "relatedServiceIds"),
    relatedMaterialIds: readStringArray(formData, "relatedMaterialIds"),
    relatedProjectIds: readStringArray(formData, "relatedProjectIds"),
    relatedArticleIds: readStringArray(formData, "relatedArticleIds"),
    relatedFaqIds: readStringArray(formData, "relatedFaqIds"),
  };
}

function readText(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}

function mutationErrorState(previousState: SolutionFormState, values: SolutionFormValues, error: unknown, intent: "saveDraft" | "publish"): SolutionFormState {
  console.error(`Solution ${intent} failed`, error);
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
  let message = intent === "publish"
    ? "تعذر نشر الحل بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج والنسخة المنشورة الحالية كما هي."
    : "تعذر حفظ المسودة بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج كما هي.";

  if (error instanceof SolutionMutationError) message = error.message;
  if (code === "P2003") message = "تعذر الحفظ لأن أحد العناصر المرتبطة أو الصور لم يعد موجوداً. حدّث اختياراتك ثم حاول مرة أخرى.";
  if (code === "P2025") message = "الحل لم يعد موجوداً. ارجع إلى قائمة الحلول وحدّث الصفحة.";

  return { status: "error", message, values, revision: previousState.revision + 1 };
}

async function saveDraft(solutionId: string, input: SolutionDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "solutions");
    await saveDraftInTransaction(tx, solutionId, input);
  });
}

async function createSolutionDraft(input: SolutionDraftInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "solutions");
    const solution = await tx.solution.create({ data: { status: ContentStatus.DRAFT } });
    const slug = input.title ? await resolveSolutionSlug(tx, solution.id, input) : null;
    const draft = await tx.solutionVersion.create({ data: { solutionId: solution.id, ...toVersionData({ ...input, slug: slug ?? undefined }) } });
    await replaceRelations(tx, draft.id, input);
    await tx.solution.update({ where: { id: solution.id }, data: { draftVersionId: draft.id } });
    return solution.id;
  });
}

async function publishSolution(existingSolutionId: string | undefined, input: SolutionPublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "solutions");
    const solution = existingSolutionId
      ? await tx.solution.findUnique({ where: { id: existingSolutionId }, include: { publishedVersion: { select: { slug: true } } } })
      : await tx.solution.create({ data: { status: ContentStatus.DRAFT }, include: { publishedVersion: { select: { slug: true } } } });
    if (!solution) throw new SolutionMutationError("الحل غير موجود.");

    const solutionId = solution.id;
    const slug = await resolveSolutionSlug(tx, solutionId, input, solution.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });
    let draftVersionId = solution.draftVersionId;
    if (draftVersionId) {
      await tx.solutionVersion.update({ where: { id: draftVersionId }, data: versionData });
    } else {
      const draft = await tx.solutionVersion.create({ data: { solutionId, ...versionData } });
      draftVersionId = draft.id;
    }
    await replaceRelations(tx, draftVersionId, input);

    const published = await tx.solutionVersion.create({ data: { solutionId, ...versionData } });
    await replaceRelations(tx, published.id, input);
    const oldPath = solution.publishedVersion?.slug ? cmsContentPath("/solutions", solution.publishedVersion.slug) : undefined;
    await tx.solution.update({
      where: { id: solutionId },
      data: { status: ContentStatus.PUBLISHED, draftVersionId, publishedVersionId: published.id, publishedAt: new Date() },
    });
    return { solutionId, oldPath, slug };
  });
}

async function saveDraftInTransaction(tx: Prisma.TransactionClient, solutionId: string, input: SolutionDraftInput) {
  const solution = await tx.solution.findUnique({ where: { id: solutionId }, include: { publishedVersion: { select: { slug: true } } } });
  if (!solution) throw new SolutionMutationError("الحل غير موجود.");
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
  if (solution.status === ContentStatus.ARCHIVED) {
    await tx.solution.update({ where: { id: solutionId }, data: { status: ContentStatus.DRAFT } });
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
  await assertCmsEntityIdsExist(tx, { service: input.relatedServiceIds, material: input.relatedMaterialIds, project: input.relatedProjectIds, article: input.relatedArticleIds, faq: input.relatedFaqIds });
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

function redirectWithMessage(solutionId: string, type: "success" | "error", message: string): never {
  redirect(`/dashboard/solutions/${solutionId}?${type}=${encodeURIComponent(message)}`);
}

class SolutionMutationError extends Error {}
