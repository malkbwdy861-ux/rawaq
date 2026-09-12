"use server";

import { ContentStatus, type PageKey, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readStringArray } from "@/modules/cms/validation";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { pageDraftSchemas, pageIdSchema, pageKeySchema, pagePublishSchemas, pageSeoSchema, type StaticPageData } from "./validation";

export async function createPageDraftAction(formData: FormData) {
  await requireAdmin();
  const parsed = pageKeySchema.safeParse(formData.get("key"));
  if (!parsed.success) redirect("/dashboard/pages?error=تعذر تحديد الصفحة المطلوبة.");
  const existing = await prisma.page.findUnique({ where: { key: parsed.data }, select: { id: true, draftVersionId: true } });
  if (existing) {
    if (!existing.draftVersionId) {
      await prisma.$transaction(async (tx) => {
        const draft = await tx.pageVersion.create({ data: { pageId: existing.id } });
        await tx.page.update({ where: { id: existing.id }, data: { draftVersionId: draft.id } });
      });
    }
    redirect(`/dashboard/pages/${parsed.data}`);
  }
  await prisma.$transaction(async (tx) => {
    const page = await tx.page.create({ data: { key: parsed.data, versions: { create: {} } }, include: { versions: { select: { id: true }, take: 1 } } });
    await tx.page.update({ where: { id: page.id }, data: { draftVersionId: page.versions[0]?.id } });
  });
  revalidatePath("/dashboard/pages");
  redirect(`/dashboard/pages/${parsed.data}?success=${encodeURIComponent("تم إنشاء مسودة الصفحة.")}`);
}

export async function savePageDraftAction(formData: FormData) {
  await requireAdmin();
  const identity = pageIdSchema.safeParse({ pageId: formData.get("pageId"), key: formData.get("key") });
  if (!identity.success) redirect("/dashboard/pages?error=تعذر تحديد الصفحة المطلوبة.");
  const parsed = parsePageForm(formData, identity.data.key, false);
  if (!parsed.success) redirectWithMessage(identity.data.key, "error", "تعذر حفظ المسودة. راجع الحقول المدخلة.");
  try {
    await saveDraft(identity.data.pageId, identity.data.key, parsed.data.data, parsed.data.seo);
  } catch (error) {
    redirectWithMessage(identity.data.key, "error", error instanceof Error ? error.message : "تعذر حفظ المسودة.");
  }
  revalidateDraftPagePaths(identity.data.key);
  redirectWithMessage(identity.data.key, "success", "تم حفظ مسودة الصفحة دون تغيير النسخة المنشورة.");
}

export async function publishPageAction(formData: FormData) {
  await requireAdmin();
  const identity = pageIdSchema.safeParse({ pageId: formData.get("pageId"), key: formData.get("key") });
  if (!identity.success) redirect("/dashboard/pages?error=تعذر تحديد الصفحة المطلوبة.");
  const parsed = parsePageForm(formData, identity.data.key, true);
  if (!parsed.success) redirectWithMessage(identity.data.key, "error", "تعذر النشر. أكمل الحقول المطلوبة وتحقق من القيم المدخلة.");
  try {
    await prisma.$transaction(async (tx) => {
      const page = await tx.page.findFirst({ where: { id: identity.data.pageId, key: identity.data.key }, select: { draftVersionId: true } });
      if (!page) throw new Error("الصفحة غير موجودة.");
      await validatePublishedSelections(tx, identity.data.key, parsed.data.data);
      const versionData = { data: parsed.data.data as Prisma.InputJsonValue, ...toSeoData(parsed.data.seo) };
      if (page.draftVersionId) await tx.pageVersion.update({ where: { id: page.draftVersionId }, data: versionData });
      else {
        const draft = await tx.pageVersion.create({ data: { pageId: identity.data.pageId, ...versionData } });
        await tx.page.update({ where: { id: identity.data.pageId }, data: { draftVersionId: draft.id } });
      }
      const published = await tx.pageVersion.create({ data: { pageId: identity.data.pageId, ...versionData } });
      await tx.page.update({ where: { id: identity.data.pageId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
    });
  } catch (error) {
    redirectWithMessage(identity.data.key, "error", error instanceof Error ? error.message : "فشل نشر الصفحة. بقيت النسخة المنشورة الحالية كما هي.");
  }
  revalidatePublishedPagePaths(identity.data.key);
  redirectWithMessage(identity.data.key, "success", "تم نشر الصفحة وتحديث العرض العام.");
}

function parsePageForm(formData: FormData, key: PageKey, publish: boolean) {
  const data = readPageData(formData, key);
  const dataResult = (publish ? pagePublishSchemas[key] : pageDraftSchemas[key]).safeParse(data);
  const seoResult = pageSeoSchema.safeParse(readSeo(formData));
  if (!dataResult.success || !seoResult.success) return { success: false as const };
  return { success: true as const, data: { data: dataResult.data as StaticPageData, seo: seoResult.data } };
}

async function saveDraft(pageId: string, key: PageKey, data: StaticPageData, seo: ReturnType<typeof pageSeoSchema.parse>) {
  await prisma.$transaction(async (tx) => {
    const page = await tx.page.findFirst({ where: { id: pageId, key }, select: { draftVersionId: true } });
    if (!page) throw new Error("الصفحة غير موجودة.");
    const versionData = { data: data as Prisma.InputJsonValue, ...toSeoData(seo) };
    if (page.draftVersionId) await tx.pageVersion.update({ where: { id: page.draftVersionId }, data: versionData });
    else {
      const draft = await tx.pageVersion.create({ data: { pageId, ...versionData } });
      await tx.page.update({ where: { id: pageId }, data: { draftVersionId: draft.id } });
    }
  });
}

async function validatePublishedSelections(tx: Prisma.TransactionClient, key: PageKey, data: StaticPageData) {
  const validCount = (ids: string[], found: { id: string }[]) => found.length === new Set(ids).size;
  if (key === "HOME") {
    const homeData = data as Extract<StaticPageData, { featuredServices: unknown }>;
    const [services, solutions, projects, faqs] = await Promise.all([
      tx.service.findMany({ where: { id: { in: homeData.featuredServices.selectedServiceIds }, status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, select: { id: true } }),
      tx.solution.findMany({ where: { id: { in: homeData.featuredSolutions.selectedSolutionIds }, status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, select: { id: true } }),
      tx.project.findMany({ where: { id: { in: homeData.featuredProjects.selectedProjectIds }, status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, select: { id: true } }),
      tx.fAQ.findMany({ where: { id: { in: homeData.faqSection.selectedFaqIds }, status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, select: { id: true } }),
    ]);
    if (!validCount(homeData.featuredServices.selectedServiceIds, services)) throw new Error("توجد خدمات مختارة غير منشورة.");
    if (!validCount(homeData.featuredSolutions.selectedSolutionIds, solutions)) throw new Error("توجد حلول مختارة غير منشورة.");
    if (!validCount(homeData.featuredProjects.selectedProjectIds, projects)) throw new Error("توجد مشاريع مختارة غير منشورة.");
    if (!validCount(homeData.faqSection.selectedFaqIds, faqs)) throw new Error("توجد أسئلة مختارة غير منشورة.");
  }
  if (key === "PRICES") {
    const pricesData = data as Extract<StaticPageData, { selectedPricingArticleIds: unknown }>;
    const [articles, faqs] = await Promise.all([
      tx.article.findMany({ where: { id: { in: pricesData.selectedPricingArticleIds }, status: ContentStatus.PUBLISHED, publishedVersionId: { not: null }, publishedVersion: { articleType: "PRICING" } }, select: { id: true } }),
      tx.fAQ.findMany({ where: { id: { in: pricesData.faqSection.selectedFaqIds }, status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } }, select: { id: true } }),
    ]);
    if (!validCount(pricesData.selectedPricingArticleIds, articles)) throw new Error("توجد مقالات أسعار مختارة غير منشورة.");
    if (!validCount(pricesData.faqSection.selectedFaqIds, faqs)) throw new Error("توجد أسئلة مختارة غير منشورة.");
  }
}

function readPageData(formData: FormData, key: PageKey): StaticPageData {
  const value = (name: string) => String(formData.get(name) ?? "");
  const items = (prefix: string) => {
    const titles = formData.getAll(`${prefix}Titles`);
    const descriptions = formData.getAll(`${prefix}Descriptions`);
    const icons = formData.getAll(`${prefix}Icons`);
    const supportedIcons = ["location", "shield", "team", "settings"] as const;
    return titles.map((title, index) => {
      const icon = String(icons[index] ?? "");
      return { title: String(title), description: String(descriptions[index] ?? ""), ...(supportedIcons.includes(icon as typeof supportedIcons[number]) ? { icon: icon as typeof supportedIcons[number] } : {}) };
    }).filter((item) => item.title || item.description);
  };
  if (key === "HOME") return {
    hero: { eyebrow: value("heroEyebrow"), title: value("heroTitle"), description: value("heroDescription"), primaryCtaText: value("primaryCtaText"), primaryCtaTarget: value("primaryCtaTarget"), secondaryCtaText: value("secondaryCtaText"), secondaryCtaTarget: value("secondaryCtaTarget"), mediaId: value("heroMediaId"), imageAlt: value("heroImageAlt") },
    featuredServices: { title: value("servicesTitle"), description: value("servicesDescription"), selectedServiceIds: readStringArray(formData, "selectedServiceIds") },
    featuredSolutions: { title: value("solutionsTitle"), description: value("solutionsDescription"), selectedSolutionIds: readStringArray(formData, "selectedSolutionIds") },
    featuredProjects: { title: value("projectsTitle"), description: value("projectsDescription"), selectedProjectIds: readStringArray(formData, "selectedProjectIds") },
    trustSection: { title: value("trustTitle"), description: value("trustDescription"), items: items("trustItem") },
    faqSection: { title: value("faqTitle"), selectedFaqIds: readStringArray(formData, "selectedFaqIds") },
    finalCta: { title: value("finalCtaTitle"), description: value("finalCtaDescription"), buttonText: value("finalCtaButtonText"), target: value("finalCtaTarget") },
  };
  if (key === "ABOUT") return {
    hero: { title: value("heroTitle"), description: value("heroDescription"), mediaId: value("heroMediaId") },
    companyStory: { title: value("storyTitle"), content: value("storyContent") },
    values: { title: value("valuesTitle"), items: items("valueItem") },
    capabilities: { title: value("capabilitiesTitle"), content: value("capabilitiesContent") },
    finalCta: { title: value("finalCtaTitle"), description: value("finalCtaDescription"), buttonText: value("finalCtaButtonText"), target: value("finalCtaTarget") },
  };
  if (key === "CONTACT") return {
    hero: { title: value("heroTitle"), description: value("heroDescription") },
    contactIntro: { title: value("contactIntroTitle"), description: value("contactIntroDescription") },
    showPhone: formData.get("showPhone") === "on", showWhatsapp: formData.get("showWhatsapp") === "on", showEmail: formData.get("showEmail") === "on", showAddress: formData.get("showAddress") === "on", showBusinessHours: formData.get("showBusinessHours") === "on",
    finalCta: { title: value("finalCtaTitle"), description: value("finalCtaDescription") },
  };
  return {
    hero: { title: value("heroTitle"), description: value("heroDescription") },
    intro: { title: value("introTitle"), content: value("introContent") },
    pricingFactors: { title: value("pricingFactorsTitle"), items: items("pricingFactor") },
    selectedPricingArticleIds: readStringArray(formData, "selectedPricingArticleIds"),
    faqSection: { selectedFaqIds: readStringArray(formData, "selectedFaqIds") },
    finalCta: { title: value("finalCtaTitle"), description: value("finalCtaDescription"), buttonText: value("finalCtaButtonText"), target: value("finalCtaTarget") },
  };
}

function readSeo(formData: FormData) { return { seoTitle: formData.get("seoTitle") ?? "", seoDescription: formData.get("seoDescription") ?? "", canonicalUrl: formData.get("canonicalUrl") ?? "", noIndex: formData.get("noIndex") === "on", openGraphTitle: formData.get("openGraphTitle") ?? "", openGraphDescription: formData.get("openGraphDescription") ?? "", openGraphImageId: formData.get("openGraphImageId") ?? "" }; }
function toSeoData(seo: ReturnType<typeof pageSeoSchema.parse>) { return { seoTitle: seo.seoTitle || null, seoDescription: seo.seoDescription || null, canonicalUrl: seo.canonicalUrl || null, noIndex: seo.noIndex, openGraphTitle: seo.openGraphTitle || null, openGraphDescription: seo.openGraphDescription || null, openGraphImageId: seo.openGraphImageId || null }; }
function pagePath(key: PageKey) { return key === "HOME" ? "/" : `/${key.toLowerCase()}`; }
function revalidateDraftPagePaths(key: PageKey) { revalidatePath("/dashboard/pages"); revalidatePath(`/dashboard/pages/${key}`); revalidatePath(`/preview/pages/${key}`); }
function revalidatePublishedPagePaths(key: PageKey) { revalidateDraftPagePaths(key); revalidatePath(pagePath(key)); revalidatePath("/sitemap.xml"); }
function redirectWithMessage(key: PageKey, type: "success" | "error", message: string): never { redirect(`/dashboard/pages/${key}?${type}=${encodeURIComponent(message)}`); }
