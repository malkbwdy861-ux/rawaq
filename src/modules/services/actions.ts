"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth";

import { serviceDraftSchema, serviceIdSchema, servicePublishSchema, type ServiceDraftInput, type ServicePublishInput } from "./validation";

export type ServiceFormValues = {
  serviceId?: string;
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
  relatedSolutionIds: string[];
  relatedMaterialIds: string[];
  relatedProjectIds: string[];
  relatedArticleIds: string[];
  relatedFaqIds: string[];
};

export type ServiceFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: ServiceFormValues;
  revision: number;
};

export async function submitServiceAction(previousState: ServiceFormState, formData: FormData): Promise<ServiceFormState> {
  await requireAdmin();

  const input = readServiceFormData(formData);
  const intent = formData.get("intent") === "publish" ? "publish" : "saveDraft";
  const parsed = (intent === "publish" ? servicePublishSchema : serviceDraftSchema).safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: intent === "publish" ? "تعذر نشر الخدمة. راجع الحقول المحددة أدناه." : "تعذر حفظ المسودة. راجع الحقول المحددة أدناه.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: input,
      revision: previousState.revision + 1,
    };
  }

  if (intent === "saveDraft") {
    let serviceId: string;
    try {
      serviceId = parsed.data.serviceId ?? await createServiceDraft(parsed.data);
      if (parsed.data.serviceId) await saveDraft(serviceId, parsed.data);
    } catch (error) {
      return mutationErrorState(previousState, input, error, "saveDraft");
    }
    revalidateServiceDraftPaths(serviceId);
    redirectWithMessage(serviceId, "success", "تم حفظ مسودة الخدمة.");
  }

  let published: Awaited<ReturnType<typeof publishService>>;
  try {
    published = await publishService(parsed.data.serviceId, parsed.data as ServicePublishInput);
  } catch (error) {
    return mutationErrorState(previousState, input, error, "publish");
  }
  revalidateServicePaths(published.serviceId, published.slug, published.oldPath);
  redirectWithMessage(published.serviceId, "success", "تم نشر الخدمة وتحديث الصفحة العامة.");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();

  const parsed = serviceIdSchema.safeParse({ serviceId: formData.get("serviceId") });
  if (!parsed.success) redirect("/dashboard/services?error=تعذر تحديد الخدمة المطلوب حذفها.");

  const service = await prisma.service.findUnique({
    where: { id: parsed.data.serviceId },
    select: { publishedVersion: { select: { slug: true } } },
  });
  if (!service) redirect("/dashboard/services?error=الخدمة غير موجودة أو حُذفت مسبقاً.");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.solutionVersionService.deleteMany({ where: { serviceId: parsed.data.serviceId } });
      await tx.materialVersionService.deleteMany({ where: { serviceId: parsed.data.serviceId } });
      await tx.projectVersionService.deleteMany({ where: { serviceId: parsed.data.serviceId } });
      await tx.articleVersionService.deleteMany({ where: { serviceId: parsed.data.serviceId } });
      await tx.service.delete({ where: { id: parsed.data.serviceId } });
    });
  } catch {
    redirect("/dashboard/services?error=تعذر حذف الخدمة. حاول مرة أخرى.");
  }

  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
  revalidatePath("/services");
  if (service.publishedVersion?.slug) revalidatePath(cmsContentPath("/services", service.publishedVersion.slug));
  revalidatePath("/sitemap.xml");
  redirect(`/dashboard/services?success=${encodeURIComponent("تم حذف الخدمة نهائياً.")}`);
}

function readServiceFormData(formData: FormData): ServiceFormValues {
  return {
    serviceId: readText(formData, "serviceId") || undefined,
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
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
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

function mutationErrorState(previousState: ServiceFormState, values: ServiceFormValues, error: unknown, intent: "saveDraft" | "publish"): ServiceFormState {
  console.error(`Service ${intent} failed`, error);
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
  let message = intent === "publish"
    ? "تعذر نشر الخدمة بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج والنسخة المنشورة الحالية كما هي."
    : "تعذر حفظ المسودة بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج كما هي.";

  if (error instanceof Error && /^[\u0600-\u06ff]/u.test(error.message)) message = error.message;
  if (code === "P2003") message = "تعذر الحفظ لأن أحد العناصر المرتبطة أو الصور لم يعد موجوداً. حدّث اختياراتك ثم حاول مرة أخرى.";
  if (code === "P2025") message = "الخدمة لم تعد موجودة. ارجع إلى قائمة الخدمات وحدّث الصفحة.";

  return { status: "error", message, values, revision: previousState.revision + 1 };
}

async function saveDraft(serviceId: string, input: ServiceDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "services");
    await saveDraftInTransaction(tx, serviceId, input);
  });
}

async function createServiceDraft(input: ServiceDraftInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "services");
    const service = await tx.service.create({ data: { status: ContentStatus.DRAFT } });
    const slug = input.title ? await resolveServiceSlug(tx, service.id, input) : null;
    const draft = await tx.serviceVersion.create({ data: { serviceId: service.id, ...toVersionData({ ...input, slug: slug ?? undefined }) } });
    await replaceRelations(tx, draft.id, input);
    await tx.service.update({ where: { id: service.id }, data: { draftVersionId: draft.id } });
    return service.id;
  });
}

async function publishService(existingServiceId: string | undefined, input: ServicePublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "services");
    const service = existingServiceId
      ? await tx.service.findUnique({ where: { id: existingServiceId }, include: { publishedVersion: { select: { slug: true } } } })
      : await tx.service.create({ data: { status: ContentStatus.DRAFT }, include: { publishedVersion: { select: { slug: true } } } });

    if (!service) throw new Error("الخدمة غير موجودة.");
    const serviceId = service.id;

    const slug = await resolveServiceSlug(tx, serviceId, input, service.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });

    let draftVersionId = service.draftVersionId;
    if (draftVersionId) {
      await tx.serviceVersion.update({ where: { id: draftVersionId }, data: versionData });
    } else {
      const draft = await tx.serviceVersion.create({ data: { serviceId, ...versionData } });
      draftVersionId = draft.id;
    }
    await replaceRelations(tx, draftVersionId, input);

    const published = await tx.serviceVersion.create({ data: { serviceId, ...versionData } });
    await replaceRelations(tx, published.id, input);

    const oldPath = service.publishedVersion?.slug ? cmsContentPath("/services", service.publishedVersion.slug) : undefined;

    await tx.service.update({
      where: { id: serviceId },
      data: {
        status: ContentStatus.PUBLISHED,
        draftVersionId,
        publishedVersionId: published.id,
        publishedAt: new Date(),
      },
    });
    return { serviceId, oldPath, slug };
  });
}

async function saveDraftInTransaction(tx: Prisma.TransactionClient, serviceId: string, input: ServiceDraftInput) {
  const service = await tx.service.findUnique({ where: { id: serviceId }, include: { publishedVersion: { select: { slug: true } } } });
  if (!service) throw new Error("الخدمة غير موجودة.");
  const slug = input.title ? await resolveServiceSlug(tx, serviceId, input, service.publishedVersion?.slug) : service.publishedVersion?.slug ?? null;
  const versionData = toVersionData({ ...input, slug: slug ?? undefined });
  let versionId = service.draftVersionId;
  if (!versionId) {
    const draft = await tx.serviceVersion.create({ data: { serviceId, ...versionData } });
    versionId = draft.id;
    await tx.service.update({ where: { id: serviceId }, data: { draftVersionId: draft.id } });
  } else {
    await tx.serviceVersion.update({ where: { id: versionId }, data: versionData });
  }
  if (service.status === ContentStatus.ARCHIVED) {
    await tx.service.update({ where: { id: serviceId }, data: { status: ContentStatus.DRAFT } });
  }
  await replaceRelations(tx, versionId, input);
}

async function resolveServiceSlug(tx: Prisma.TransactionClient, serviceId: string, input: ServiceDraftInput, publishedSlug?: string | null) {
  if (publishedSlug) return publishedSlug;
  return generateUniqueCmsSlug({ tx, contentType: "services", contentId: serviceId, source: input.title ?? "" });
}

function toVersionData(input: ServiceDraftInput) {
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

async function replaceRelations(tx: Prisma.TransactionClient, serviceVersionId: string, input: ServiceDraftInput) {
  await Promise.all([
    tx.serviceVersionSolution.deleteMany({ where: { serviceVersionId } }),
    tx.serviceVersionMaterial.deleteMany({ where: { serviceVersionId } }),
    tx.serviceVersionProject.deleteMany({ where: { serviceVersionId } }),
    tx.serviceVersionArticle.deleteMany({ where: { serviceVersionId } }),
    tx.serviceVersionFAQ.deleteMany({ where: { serviceVersionId } }),
  ]);

  await Promise.all([
    input.relatedSolutionIds.length ? tx.serviceVersionSolution.createMany({ data: input.relatedSolutionIds.map((solutionId) => ({ serviceVersionId, solutionId })), skipDuplicates: true }) : null,
    input.relatedMaterialIds.length ? tx.serviceVersionMaterial.createMany({ data: input.relatedMaterialIds.map((materialId) => ({ serviceVersionId, materialId })), skipDuplicates: true }) : null,
    input.relatedProjectIds.length ? tx.serviceVersionProject.createMany({ data: input.relatedProjectIds.map((projectId) => ({ serviceVersionId, projectId })), skipDuplicates: true }) : null,
    input.relatedArticleIds.length ? tx.serviceVersionArticle.createMany({ data: input.relatedArticleIds.map((articleId) => ({ serviceVersionId, articleId })), skipDuplicates: true }) : null,
    input.relatedFaqIds.length ? tx.serviceVersionFAQ.createMany({ data: input.relatedFaqIds.map((faqId) => ({ serviceVersionId, faqId })), skipDuplicates: true }) : null,
  ]);
}

function revalidateServiceDraftPaths(serviceId: string) {
  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath(`/preview/services/${serviceId}`);
}

function revalidateServicePaths(serviceId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/services");
  if (slug) revalidatePath(cmsContentPath("/services", slug));
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(serviceId: string | undefined, type: "success" | "error", message: string): never {
  const target = serviceId ? `/dashboard/services/${serviceId}` : "/dashboard/services/new";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
