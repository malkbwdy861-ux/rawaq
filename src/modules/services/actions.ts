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

export async function createServiceAction() {
  await requireAdmin();

  const service = await prisma.$transaction(async (tx) => {
    const created = await tx.service.create({
      data: { status: ContentStatus.DRAFT, versions: { create: {} } },
      include: { versions: { select: { id: true }, take: 1 } },
    });
    return tx.service.update({ where: { id: created.id }, data: { draftVersionId: created.versions[0]?.id } });
  });

  revalidatePath("/dashboard/services");
  redirect(`/dashboard/services/${service.id}?success=${encodeURIComponent("تم إنشاء مسودة خدمة جديدة.")}`);
}

export async function saveServiceDraftAction(formData: FormData) {
  await requireAdmin();

  const parsed = serviceDraftSchema.safeParse(readServiceFormData(formData));
  if (!parsed.success || !parsed.data.serviceId) {
    redirectWithMessage(parsed.data?.serviceId, "error", "تعذر حفظ المسودة. راجع الحقول المدخلة.");
  }

  await saveDraft(parsed.data.serviceId, parsed.data);
  revalidateServiceDraftPaths(parsed.data.serviceId);
  redirectWithMessage(parsed.data.serviceId, "success", "تم حفظ مسودة الخدمة دون تغيير النسخة المنشورة.");
}

export async function publishServiceAction(formData: FormData) {
  await requireAdmin();

  const parsed = servicePublishSchema.safeParse(readServiceFormData(formData));
  if (!parsed.success || !parsed.data.serviceId) {
    redirectWithMessage(parsed.data?.serviceId, "error", "تعذر النشر. أكمل العنوان والوصف والمحتوى.");
  }

  try {
    const { oldPath, slug } = await publishService(parsed.data.serviceId, parsed.data);
    revalidateServicePaths(parsed.data.serviceId, slug, oldPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل نشر الخدمة. بقيت النسخة المنشورة الحالية كما هي.";
    redirectWithMessage(parsed.data.serviceId, "error", message);
  }

  redirectWithMessage(parsed.data.serviceId, "success", "تم نشر الخدمة وتحديث الصفحة العامة.");
}

export async function archiveServiceAction(formData: FormData) {
  await requireAdmin();

  const parsed = serviceIdSchema.safeParse({ serviceId: formData.get("serviceId") });
  if (!parsed.success) {
    redirect("/dashboard/services?error=تعذر تحديد الخدمة المطلوب أرشفتها.");
  }

  const service = await prisma.service.update({
    where: { id: parsed.data.serviceId },
    data: { status: ContentStatus.ARCHIVED },
    select: { publishedVersion: { select: { slug: true } } },
  });

  revalidateServicePaths(parsed.data.serviceId, undefined, service.publishedVersion?.slug ? cmsContentPath("/services", service.publishedVersion.slug) : undefined);
  redirectWithMessage(parsed.data.serviceId, "success", "تمت أرشفة الخدمة وإزالتها من العرض العام.");
}

function readServiceFormData(formData: FormData) {
  return {
    serviceId: formData.get("serviceId") || undefined,
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
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
    relatedMaterialIds: readStringArray(formData, "relatedMaterialIds"),
    relatedProjectIds: readStringArray(formData, "relatedProjectIds"),
    relatedArticleIds: readStringArray(formData, "relatedArticleIds"),
    relatedFaqIds: readStringArray(formData, "relatedFaqIds"),
  };
}

async function saveDraft(serviceId: string, input: ServiceDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "services");
    await saveDraftInTransaction(tx, serviceId, input);
  });
}

async function publishService(serviceId: string, input: ServicePublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "services");
    const service = await tx.service.findUnique({
      where: { id: serviceId },
      include: { publishedVersion: { select: { slug: true } } },
    });

    if (!service?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");

    const slug = await resolveServiceSlug(tx, serviceId, input, service.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });

    await tx.serviceVersion.update({ where: { id: service.draftVersionId }, data: versionData });
    await replaceRelations(tx, service.draftVersionId, input);

    const published = await tx.serviceVersion.create({ data: { serviceId, ...versionData } });
    await replaceRelations(tx, published.id, input);

    const oldPath = service.publishedVersion?.slug ? cmsContentPath("/services", service.publishedVersion.slug) : undefined;

    await tx.service.update({
      where: { id: serviceId },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedVersionId: published.id,
        publishedAt: new Date(),
      },
    });
    return { oldPath, slug };
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
  const target = serviceId ? `/dashboard/services/${serviceId}` : "/dashboard/services";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
