"use server";

import { ContentStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { articleDraftSchema, articleIdSchema, articlePublishSchema, type ArticleDraftInput, type ArticlePublishInput } from "./validation";

export async function createArticleAction() {
  await requireAdmin();
  const article = await prisma.$transaction(async (tx) => {
    const created = await tx.article.create({ data: { status: ContentStatus.DRAFT, versions: { create: {} } }, include: { versions: { select: { id: true }, take: 1 } } });
    return tx.article.update({ where: { id: created.id }, data: { draftVersionId: created.versions[0]?.id } });
  });
  revalidatePath("/dashboard/articles");
  redirect(`/dashboard/articles/${article.id}?success=${encodeURIComponent("تم إنشاء مسودة مقال جديدة.")}`);
}

export async function saveArticleDraftAction(formData: FormData) {
  await requireAdmin();
  const parsed = articleDraftSchema.safeParse(readArticleFormData(formData));
  if (!parsed.success || !parsed.data.articleId) redirectWithMessage(parsed.data?.articleId, "error", "تعذر حفظ المسودة. راجع محتوى المقال والحقول المدخلة.");
  await saveDraft(parsed.data.articleId, parsed.data);
  revalidateArticleDraftPaths(parsed.data.articleId);
  redirectWithMessage(parsed.data.articleId, "success", "تم حفظ مسودة المقال دون تغيير النسخة المنشورة.");
}

export async function publishArticleAction(formData: FormData) {
  await requireAdmin();
  const parsed = articlePublishSchema.safeParse(readArticleFormData(formData));
  if (!parsed.success || !parsed.data.articleId) redirectWithMessage(parsed.data?.articleId, "error", "تعذر النشر. أكمل العنوان والمقتطف والمحتوى.");
  try {
    const { oldPath, slug } = await publishArticle(parsed.data.articleId, parsed.data);
    revalidateArticlePaths(parsed.data.articleId, slug, oldPath);
  } catch (error) {
    redirectWithMessage(parsed.data.articleId, "error", error instanceof Error ? error.message : "فشل نشر المقال. بقيت النسخة المنشورة الحالية كما هي.");
  }
  redirectWithMessage(parsed.data.articleId, "success", "تم نشر المقال وتحديث الدليل العام.");
}

export async function archiveArticleAction(formData: FormData) {
  await requireAdmin();
  const parsed = articleIdSchema.safeParse({ articleId: formData.get("articleId") });
  if (!parsed.success) redirect("/dashboard/articles?error=تعذر تحديد المقال المطلوب أرشفته.");
  const article = await prisma.article.update({ where: { id: parsed.data.articleId }, data: { status: ContentStatus.ARCHIVED }, select: { publishedVersion: { select: { slug: true } } } });
  revalidateArticlePaths(parsed.data.articleId, undefined, article.publishedVersion?.slug ? cmsContentPath("/guides", article.publishedVersion.slug) : undefined);
  redirectWithMessage(parsed.data.articleId, "success", "تمت أرشفة المقال وإزالته من الأدلة العامة.");
}

function readArticleFormData(formData: FormData) {
  return {
    articleId: formData.get("articleId") || undefined,
    title: formData.get("title") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    heroMediaId: formData.get("heroMediaId") ?? "",
    articleType: formData.get("articleType") === "NONE" ? "" : formData.get("articleType") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    canonicalUrl: formData.get("canonicalUrl") ?? "",
    noIndex: formData.get("noIndex") === "on",
    openGraphTitle: formData.get("openGraphTitle") ?? "",
    openGraphDescription: formData.get("openGraphDescription") ?? "",
    openGraphImageId: formData.get("openGraphImageId") ?? "",
    relatedServiceIds: readStringArray(formData, "relatedServiceIds"),
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
    relatedMaterialIds: readStringArray(formData, "relatedMaterialIds"),
    relatedProjectIds: readStringArray(formData, "relatedProjectIds"),
    relatedFaqIds: readStringArray(formData, "relatedFaqIds"),
  };
}

async function saveDraft(articleId: string, input: ArticleDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "articles");
    const article = await tx.article.findUnique({ where: { id: articleId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!article) throw new Error("المقال غير موجود.");
    const slug = input.title ? await resolveArticleSlug(tx, articleId, input, article.publishedVersion?.slug) : article.publishedVersion?.slug ?? null;
    const versionData = toVersionData({ ...input, slug: slug ?? undefined });
    let versionId = article.draftVersionId;
    if (!versionId) {
      const draft = await tx.articleVersion.create({ data: { articleId, ...versionData } });
      versionId = draft.id;
      await tx.article.update({ where: { id: articleId }, data: { draftVersionId: draft.id } });
    } else await tx.articleVersion.update({ where: { id: versionId }, data: versionData });
    await replaceVersionRelations(tx, versionId, input);
  });
}

async function publishArticle(articleId: string, input: ArticlePublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "articles");
    const article = await tx.article.findUnique({ where: { id: articleId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!article?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");
    const slug = await resolveArticleSlug(tx, articleId, input, article.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });
    await tx.articleVersion.update({ where: { id: article.draftVersionId }, data: versionData });
    await replaceVersionRelations(tx, article.draftVersionId, input);
    const published = await tx.articleVersion.create({ data: { articleId, ...versionData } });
    await replaceVersionRelations(tx, published.id, input);
    const oldPath = article.publishedVersion?.slug ? cmsContentPath("/guides", article.publishedVersion.slug) : undefined;
    await tx.article.update({ where: { id: articleId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
    return { oldPath, slug };
  });
}

function revalidateArticleDraftPaths(articleId: string) {
  revalidatePath("/dashboard/articles");
  revalidatePath(`/dashboard/articles/${articleId}`);
  revalidatePath(`/preview/articles/${articleId}`);
}

async function resolveArticleSlug(tx: Prisma.TransactionClient, articleId: string, input: ArticleDraftInput, publishedSlug?: string | null) {
  if (publishedSlug) return publishedSlug;
  return generateUniqueCmsSlug({ tx, contentType: "articles", contentId: articleId, source: input.title ?? "" });
}

function toVersionData(input: ArticleDraftInput) {
  return {
    title: input.title || null,
    slug: input.slug || null,
    excerpt: input.excerpt || null,
    content: input.content ?? Prisma.JsonNull,
    heroMediaId: input.heroMediaId || null,
    articleType: input.articleType || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    noIndex: input.noIndex,
    openGraphTitle: input.openGraphTitle || null,
    openGraphDescription: input.openGraphDescription || null,
    openGraphImageId: input.openGraphImageId || null,
  };
}

async function replaceVersionRelations(tx: Prisma.TransactionClient, articleVersionId: string, input: ArticleDraftInput) {
  await Promise.all([
    tx.articleVersionService.deleteMany({ where: { articleVersionId } }),
    tx.articleVersionSolution.deleteMany({ where: { articleVersionId } }),
    tx.articleVersionMaterial.deleteMany({ where: { articleVersionId } }),
    tx.articleVersionProject.deleteMany({ where: { articleVersionId } }),
    tx.articleVersionFAQ.deleteMany({ where: { articleVersionId } }),
  ]);
  await Promise.all([
    input.relatedServiceIds.length ? tx.articleVersionService.createMany({ data: input.relatedServiceIds.map((serviceId) => ({ articleVersionId, serviceId })), skipDuplicates: true }) : null,
    input.relatedSolutionIds.length ? tx.articleVersionSolution.createMany({ data: input.relatedSolutionIds.map((solutionId) => ({ articleVersionId, solutionId })), skipDuplicates: true }) : null,
    input.relatedMaterialIds.length ? tx.articleVersionMaterial.createMany({ data: input.relatedMaterialIds.map((materialId) => ({ articleVersionId, materialId })), skipDuplicates: true }) : null,
    input.relatedProjectIds.length ? tx.articleVersionProject.createMany({ data: input.relatedProjectIds.map((projectId) => ({ articleVersionId, projectId })), skipDuplicates: true }) : null,
    input.relatedFaqIds.length ? tx.articleVersionFAQ.createMany({ data: input.relatedFaqIds.map((faqId) => ({ articleVersionId, faqId })), skipDuplicates: true }) : null,
  ]);
}

function revalidateArticlePaths(articleId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/articles");
  revalidatePath(`/dashboard/articles/${articleId}`);
  revalidatePath("/guides");
  if (slug) revalidatePath(cmsContentPath("/guides", slug));
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}

function redirectWithMessage(articleId: string | undefined, type: "success" | "error", message: string): never {
  redirect(`${articleId ? `/dashboard/articles/${articleId}` : "/dashboard/articles"}?${type}=${encodeURIComponent(message)}`);
}
