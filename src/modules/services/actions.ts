"use server";

import { ContentStatus, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readStringArray } from "@/modules/cms/validation";
import { savePublishedSlugRedirect } from "@/modules/redirects/service";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth";

import { serviceDraftSchema, serviceIdSchema, servicePublishSchema, type ServiceDraftInput, type ServicePublishInput } from "./validation";

export async function createServiceAction() {
  await requireAdmin();

  const service = await prisma.service.create({
    data: {
      status: ContentStatus.DRAFT,
      versions: { create: {} },
    },
    include: { versions: { select: { id: true }, take: 1 } },
  });

  await prisma.service.update({
    where: { id: service.id },
    data: { draftVersionId: service.versions[0]?.id },
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
  revalidateServicePaths(parsed.data.serviceId);
  redirectWithMessage(parsed.data.serviceId, "success", "تم حفظ مسودة الخدمة دون تغيير النسخة المنشورة.");
}

export async function publishServiceAction(formData: FormData) {
  await requireAdmin();

  const parsed = servicePublishSchema.safeParse(readServiceFormData(formData));
  if (!parsed.success || !parsed.data.serviceId) {
    redirectWithMessage(parsed.data?.serviceId, "error", "تعذر النشر. أكمل العنوان والرابط والوصف والمحتوى.");
  }

  try {
    await saveDraft(parsed.data.serviceId, parsed.data);
    const oldPath = await publishService(parsed.data.serviceId, parsed.data);
    revalidateServicePaths(parsed.data.serviceId, parsed.data.slug, oldPath);
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

  await prisma.service.update({
    where: { id: parsed.data.serviceId },
    data: { status: ContentStatus.ARCHIVED },
  });

  revalidateServicePaths(parsed.data.serviceId);
  redirectWithMessage(parsed.data.serviceId, "success", "تمت أرشفة الخدمة وإزالتها من العرض العام.");
}

function readServiceFormData(formData: FormData) {
  return {
    serviceId: formData.get("serviceId") || undefined,
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
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
    relatedMaterialIds: readStringArray(formData, "relatedMaterialIds"),
    relatedProjectIds: readStringArray(formData, "relatedProjectIds"),
    relatedArticleIds: readStringArray(formData, "relatedArticleIds"),
    relatedFaqIds: readStringArray(formData, "relatedFaqIds"),
  };
}

async function saveDraft(serviceId: string, input: ServiceDraftInput) {
  const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { draftVersionId: true } });
  if (!service) throw new Error("الخدمة غير موجودة.");

  const versionData = toVersionData(input);

  if (!service.draftVersionId) {
    const draft = await prisma.serviceVersion.create({ data: { serviceId, ...versionData } });
    await prisma.service.update({ where: { id: serviceId }, data: { draftVersionId: draft.id } });
    await replaceRelations(prisma, draft.id, input);
    return;
  }

  await prisma.serviceVersion.update({ where: { id: service.draftVersionId }, data: versionData });
  await replaceRelations(prisma, service.draftVersionId, input);
}

async function publishService(serviceId: string, input: ServicePublishInput) {
  return prisma.$transaction(async (tx) => {
    const service = await tx.service.findUnique({
      where: { id: serviceId },
      include: { publishedVersion: { select: { slug: true } } },
    });

    if (!service?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");

    await assertSlugAvailable(tx, serviceId, input.slug);

    const published = await tx.serviceVersion.create({ data: { serviceId, ...toVersionData(input) } });
    await replaceRelations(tx, published.id, input);

    const oldPath = service.publishedVersion?.slug ? `/services/${service.publishedVersion.slug}` : undefined;
    if (oldPath && service.publishedVersion?.slug !== input.slug) await savePublishedSlugRedirect(tx, oldPath, `/services/${input.slug}`);

    await tx.service.update({
      where: { id: serviceId },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedVersionId: published.id,
        publishedAt: new Date(),
      },
    });
    return oldPath;
  });
}

async function assertSlugAvailable(tx: Prisma.TransactionClient, serviceId: string, slug: string) {
  const collision = await tx.service.findFirst({
    where: {
      id: { not: serviceId },
      OR: [
        { publishedVersion: { slug } },
        { draftVersion: { slug } },
      ],
    },
    select: { id: true },
  });

  if (collision) throw new Error("الرابط المختصر مستخدم في خدمة أخرى.");
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

async function replaceRelations(tx: Prisma.TransactionClient | typeof prisma, serviceVersionId: string, input: ServiceDraftInput) {
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

function revalidateServicePaths(serviceId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/services");
  if (slug) revalidatePath(`/services/${slug}`);
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(serviceId: string | undefined, type: "success" | "error", message: string): never {
  const target = serviceId ? `/dashboard/services/${serviceId}` : "/dashboard/services";
  redirect(`${target}?${type}=${encodeURIComponent(message)}`);
}
