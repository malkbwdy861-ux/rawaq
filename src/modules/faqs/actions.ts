"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { faqDraftSchema, faqIdSchema, faqPublishSchema, type FaqDraftInput } from "./validation";

export async function createFaqAction() {
  await requireAdmin();
  const faq = await prisma.fAQ.create({
    data: { status: ContentStatus.DRAFT, versions: { create: {} } },
    include: { versions: { select: { id: true }, take: 1 } },
  });
  await prisma.fAQ.update({ where: { id: faq.id }, data: { draftVersionId: faq.versions[0]?.id } });
  revalidatePath("/dashboard/faqs");
  redirect(`/dashboard/faqs/${faq.id}?success=${encodeURIComponent("تم إنشاء مسودة سؤال جديدة.")}`);
}

export async function saveFaqDraftAction(formData: FormData) {
  await requireAdmin();
  const parsed = faqDraftSchema.safeParse(readFaqFormData(formData));
  if (!parsed.success || !parsed.data.faqId) redirectWithMessage(parsed.data?.faqId, "error", "تعذر حفظ المسودة. راجع الحقول المدخلة.");
  await saveDraft(parsed.data.faqId, parsed.data);
  revalidateFaqPaths(parsed.data.faqId);
  redirectWithMessage(parsed.data.faqId, "success", "تم حفظ مسودة السؤال دون تغيير النسخة المنشورة.");
}

export async function publishFaqAction(formData: FormData) {
  await requireAdmin();
  const parsed = faqPublishSchema.safeParse(readFaqFormData(formData));
  if (!parsed.success || !parsed.data.faqId) redirectWithMessage(parsed.data?.faqId, "error", "تعذر النشر. أدخل السؤال والإجابة.");
  const faqId = parsed.data.faqId;
  try {
    await saveDraft(faqId, parsed.data);
    await prisma.$transaction(async (tx) => {
      const faq = await tx.fAQ.findUnique({ where: { id: faqId }, select: { draftVersionId: true } });
      if (!faq?.draftVersionId) throw new Error("لا توجد مسودة قابلة للنشر.");
      const published = await tx.fAQVersion.create({ data: { faqId, ...toVersionData(parsed.data) } });
      await tx.fAQ.update({ where: { id: faqId }, data: { status: ContentStatus.PUBLISHED, publishedVersionId: published.id, publishedAt: new Date() } });
    });
  } catch (error) {
    redirectWithMessage(faqId, "error", error instanceof Error ? error.message : "فشل نشر السؤال. بقيت النسخة المنشورة الحالية كما هي.");
  }
  revalidateFaqPaths(faqId);
  redirectWithMessage(faqId, "success", "تم نشر السؤال وتحديث الصفحات المرتبطة.");
}

export async function archiveFaqAction(formData: FormData) {
  await requireAdmin();
  const parsed = faqIdSchema.safeParse({ faqId: formData.get("faqId") });
  if (!parsed.success) redirect("/dashboard/faqs?error=تعذر تحديد السؤال المطلوب أرشفته.");
  await prisma.fAQ.update({ where: { id: parsed.data.faqId }, data: { status: ContentStatus.ARCHIVED } });
  revalidateFaqPaths(parsed.data.faqId);
  redirectWithMessage(parsed.data.faqId, "success", "تمت أرشفة السؤال وإزالته من الصفحات العامة.");
}

function readFaqFormData(formData: FormData) {
  return {
    faqId: formData.get("faqId") || undefined,
    question: formData.get("question") ?? "",
    answer: formData.get("answer") ?? "",
    sortOrder: formData.get("sortOrder") ?? "",
  };
}

async function saveDraft(faqId: string, input: FaqDraftInput) {
  await prisma.$transaction(async (tx) => {
    const faq = await tx.fAQ.findUnique({ where: { id: faqId }, select: { draftVersionId: true } });
    if (!faq) throw new Error("السؤال غير موجود.");
    if (faq.draftVersionId) {
      await tx.fAQVersion.update({ where: { id: faq.draftVersionId }, data: toVersionData(input) });
      return;
    }
    const draft = await tx.fAQVersion.create({ data: { faqId, ...toVersionData(input) } });
    await tx.fAQ.update({ where: { id: faqId }, data: { draftVersionId: draft.id } });
  });
}

function toVersionData(input: FaqDraftInput) {
  return { question: input.question || null, answer: input.answer || null, sortOrder: input.sortOrder ?? null };
}

function revalidateFaqPaths(faqId: string) {
  revalidatePath("/dashboard/faqs");
  revalidatePath(`/dashboard/faqs/${faqId}`);
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/solutions/[slug]", "page");
  revalidatePath("/materials/[slug]", "page");
  revalidatePath("/guides/[slug]", "page");
}

function redirectWithMessage(faqId: string | undefined, type: "success" | "error", message: string): never {
  redirect(`${faqId ? `/dashboard/faqs/${faqId}` : "/dashboard/faqs"}?${type}=${encodeURIComponent(message)}`);
}
