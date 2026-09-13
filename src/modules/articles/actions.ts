"use server";

import { ContentStatus, Prisma, type ArticleType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { cmsContentPath, generateUniqueCmsSlug } from "@/modules/cms/slugs";
import { readStringArray } from "@/modules/cms/validation";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { articleDraftSchema, articleIdSchema, articlePublishSchema, type ArticleDraftInput, type ArticlePublishInput } from "./validation";

export type ArticleFormValues = {
  articleId?: string;
  title: string;
  excerpt: string;
  content: string;
  heroMediaId: string;
  articleType: ArticleType | "";
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImageId: string;
  relatedServiceIds: string[];
  relatedSolutionIds: string[];
  relatedMaterialIds: string[];
  relatedProjectIds: string[];
  relatedFaqIds: string[];
};

export type ArticleFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: ArticleFormValues;
  revision: number;
};

export async function submitArticleAction(previousState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();

  const input = readArticleFormData(formData);
  const intent = formData.get("intent") === "publish" ? "publish" : "saveDraft";
  const parsed = (intent === "publish" ? articlePublishSchema : articleDraftSchema).safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: intent === "publish" ? "تعذر نشر المقال. راجع الحقول المحددة أدناه." : "تعذر حفظ المسودة. راجع الحقول المحددة أدناه.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: input,
      revision: previousState.revision + 1,
    };
  }

  if (intent === "saveDraft") {
    let articleId: string;
    try {
      articleId = parsed.data.articleId ?? await createArticleDraft(parsed.data);
      if (parsed.data.articleId) await saveDraft(parsed.data.articleId, parsed.data);
    } catch (error) {
      return mutationErrorState(previousState, input, error, "saveDraft");
    }
    revalidateArticleDraftPaths(articleId);
    redirect(`/dashboard/articles/${articleId}?success=${encodeURIComponent("تم حفظ مسودة المقال.")}`);
  }

  let published: Awaited<ReturnType<typeof publishArticle>>;
  try {
    published = await publishArticle(parsed.data.articleId, parsed.data as ArticlePublishInput);
  } catch (error) {
    return mutationErrorState(previousState, input, error, "publish");
  }
  revalidateArticlePaths(published.articleId, published.slug, published.oldPath);
  redirect(cmsContentPath("/guides", published.slug));
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();

  const parsed = articleIdSchema.safeParse({ articleId: formData.get("articleId") });
  if (!parsed.success) redirect("/dashboard/articles?error=تعذر تحديد المقال المطلوب حذفه.");

  let result: { blocked: boolean; deleted: boolean; slug?: string | null };
  try {
    result = await prisma.$transaction(async (tx) => {
      const article = await tx.article.findUnique({ where: { id: parsed.data.articleId }, select: { publishedVersion: { select: { slug: true } } } });
      if (!article) return { blocked: false, deleted: false, slug: null };

      const pricesVersions = await tx.pageVersion.findMany({ where: { page: { key: "PRICES" } }, select: { data: true } });
      if (pricesVersions.some(({ data }) => pricesPageReferencesArticle(data, parsed.data.articleId))) {
        return { blocked: true, deleted: false, slug: article.publishedVersion?.slug };
      }

      await Promise.all([
        tx.serviceVersionArticle.deleteMany({ where: { articleId: parsed.data.articleId } }),
        tx.solutionVersionArticle.deleteMany({ where: { articleId: parsed.data.articleId } }),
        tx.materialVersionArticle.deleteMany({ where: { articleId: parsed.data.articleId } }),
        tx.projectVersionArticle.deleteMany({ where: { articleId: parsed.data.articleId } }),
      ]);
      await tx.article.delete({ where: { id: parsed.data.articleId } });
      return { blocked: false, deleted: true, slug: article.publishedVersion?.slug };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    console.error("Article delete failed", error);
    redirect("/dashboard/articles?error=تعذر حذف المقال. حاول مرة أخرى.");
  }

  if (result.blocked) {
    redirect(`/dashboard/articles?error=${encodeURIComponent("لا يمكن حذف المقال لأنه مستخدم في بيانات صفحة الأسعار. أزله من صفحة الأسعار أولاً ثم أعد المحاولة.")}`);
  }
  if (!result.deleted) redirect("/dashboard/articles?error=المقال غير موجود أو حُذف مسبقاً.");

  revalidatePath("/dashboard/articles");
  revalidatePath("/guides");
  if (result.slug) revalidatePath(cmsContentPath("/guides", result.slug));
  revalidatePath("/sitemap.xml");
  redirect(`/dashboard/articles?success=${encodeURIComponent("تم حذف المقال نهائياً.")}`);
}

function readArticleFormData(formData: FormData): ArticleFormValues {
  const articleType = readText(formData, "articleType");
  return {
    articleId: readText(formData, "articleId") || undefined,
    title: readText(formData, "title"),
    excerpt: readText(formData, "excerpt"),
    content: readText(formData, "content"),
    heroMediaId: readText(formData, "heroMediaId"),
    articleType: (articleType === "NONE" ? "" : articleType) as ArticleFormValues["articleType"],
    seoTitle: readText(formData, "seoTitle"),
    seoDescription: readText(formData, "seoDescription"),
    canonicalUrl: readText(formData, "canonicalUrl"),
    noIndex: formData.get("noIndex") === "on",
    openGraphTitle: readText(formData, "openGraphTitle"),
    openGraphDescription: readText(formData, "openGraphDescription"),
    openGraphImageId: readText(formData, "openGraphImageId"),
    relatedServiceIds: readStringArray(formData, "relatedServiceIds"),
    relatedSolutionIds: readStringArray(formData, "relatedSolutionIds"),
    relatedMaterialIds: readStringArray(formData, "relatedMaterialIds"),
    relatedProjectIds: readStringArray(formData, "relatedProjectIds"),
    relatedFaqIds: readStringArray(formData, "relatedFaqIds"),
  };
}

function readText(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}

function mutationErrorState(previousState: ArticleFormState, values: ArticleFormValues, error: unknown, intent: "saveDraft" | "publish"): ArticleFormState {
  console.error(`Article ${intent} failed`, error);
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
  let message = intent === "publish"
    ? "تعذر نشر المقال بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج والنسخة المنشورة الحالية كما هي."
    : "تعذر حفظ المسودة بسبب خطأ في قاعدة البيانات. بقيت بيانات النموذج كما هي.";
  if (error instanceof Error && /^[\u0600-\u06ff]/u.test(error.message)) message = error.message;
  if (code === "P2003") message = "تعذر الحفظ لأن أحد العناصر المرتبطة أو الصور لم يعد موجوداً. حدّث اختياراتك ثم حاول مرة أخرى.";
  if (code === "P2025") message = "المقال لم يعد موجوداً. ارجع إلى قائمة المقالات وحدّث الصفحة.";
  return { status: "error", message, values, revision: previousState.revision + 1 };
}

async function createArticleDraft(input: ArticleDraftInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "articles");
    await assertImageMedia(tx, input);
    const article = await tx.article.create({ data: { status: ContentStatus.DRAFT } });
    const slug = input.title ? await resolveArticleSlug(tx, article.id, input) : null;
    const draft = await tx.articleVersion.create({ data: { articleId: article.id, ...toVersionData({ ...input, slug: slug ?? undefined }) } });
    await replaceVersionRelations(tx, draft.id, input);
    await tx.article.update({ where: { id: article.id }, data: { draftVersionId: draft.id } });
    return article.id;
  });
}

async function saveDraft(articleId: string, input: ArticleDraftInput) {
  await prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "articles");
    await assertImageMedia(tx, input);
    const article = await tx.article.findUnique({ where: { id: articleId }, include: { publishedVersion: { select: { slug: true } } } });
    if (!article) throw new Error("المقال غير موجود.");
    const slug = input.title ? await resolveArticleSlug(tx, articleId, input, article.publishedVersion?.slug) : article.publishedVersion?.slug ?? null;
    const versionData = toVersionData({ ...input, slug: slug ?? undefined });
    let versionId = article.draftVersionId;
    if (versionId) await tx.articleVersion.update({ where: { id: versionId }, data: versionData });
    else {
      const draft = await tx.articleVersion.create({ data: { articleId, ...versionData } });
      versionId = draft.id;
      await tx.article.update({ where: { id: articleId }, data: { draftVersionId: draft.id } });
    }
    if (article.status === ContentStatus.ARCHIVED) await tx.article.update({ where: { id: articleId }, data: { status: ContentStatus.DRAFT } });
    await replaceVersionRelations(tx, versionId, input);
  });
}

async function publishArticle(existingArticleId: string | undefined, input: ArticlePublishInput) {
  return prisma.$transaction(async (tx) => {
    await lockPublishingNamespace(tx, "articles");
    await assertImageMedia(tx, input);
    const article = existingArticleId
      ? await tx.article.findUnique({ where: { id: existingArticleId }, include: { publishedVersion: { select: { slug: true } } } })
      : await tx.article.create({ data: { status: ContentStatus.DRAFT }, include: { publishedVersion: { select: { slug: true } } } });
    if (!article) throw new Error("المقال غير موجود.");

    const slug = await resolveArticleSlug(tx, article.id, input, article.publishedVersion?.slug);
    const versionData = toVersionData({ ...input, slug });
    let draftVersionId = article.draftVersionId;
    if (draftVersionId) await tx.articleVersion.update({ where: { id: draftVersionId }, data: versionData });
    else {
      const draft = await tx.articleVersion.create({ data: { articleId: article.id, ...versionData } });
      draftVersionId = draft.id;
    }
    await replaceVersionRelations(tx, draftVersionId, input);
    const published = await tx.articleVersion.create({ data: { articleId: article.id, ...versionData } });
    await replaceVersionRelations(tx, published.id, input);
    const oldPath = article.publishedVersion?.slug ? cmsContentPath("/guides", article.publishedVersion.slug) : undefined;
    await tx.article.update({ where: { id: article.id }, data: { status: ContentStatus.PUBLISHED, draftVersionId, publishedVersionId: published.id, publishedAt: new Date() } });
    return { articleId: article.id, oldPath, slug };
  });
}

async function assertImageMedia(tx: Prisma.TransactionClient, input: Pick<ArticleDraftInput, "heroMediaId" | "openGraphImageId">) {
  const ids = [...new Set([input.heroMediaId, input.openGraphImageId].filter((id): id is string => Boolean(id)))];
  if (!ids.length) return;
  const count = await tx.media.count({ where: { id: { in: ids }, type: "IMAGE" } });
  if (count !== ids.length) throw new Error("اختر صوراً صالحة من مكتبة الصور للصورة الرئيسية وصورة المشاركة.");
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

function pricesPageReferencesArticle(data: Prisma.JsonValue, articleId: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const ids = (data as Record<string, Prisma.JsonValue>).selectedPricingArticleIds;
  return Array.isArray(ids) && ids.some((id) => id === articleId);
}

function revalidateArticleDraftPaths(articleId: string) {
  revalidatePath("/dashboard/articles");
  revalidatePath(`/dashboard/articles/${articleId}`);
  revalidatePath(`/preview/articles/${articleId}`);
}

function revalidateArticlePaths(articleId: string, slug?: string, oldPath?: string) {
  revalidatePath("/dashboard/articles");
  revalidatePath(`/dashboard/articles/${articleId}`);
  revalidatePath("/guides");
  if (slug) revalidatePath(cmsContentPath("/guides", slug));
  if (oldPath) revalidatePath(oldPath);
  revalidatePath("/sitemap.xml");
}
