"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";
import { cleanupCmsEntityReferences } from "@/modules/cms/references";
import { revalidateCmsReferenceConsumers } from "@/modules/cms/reference-cache";
import { runSerializableCmsTransaction } from "@/modules/cms/transactions";

import { faqCreateSchema, faqDraftSchema, faqIdSchema, faqPublishSchema, type FaqDraftInput } from "./validation";

export type FaqDialogValues = { question: string; answer: string };
export type FaqDialogState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values: FaqDialogValues;
  revision: number;
};

export async function submitFaqDialogAction(previousState: FaqDialogState, formData: FormData): Promise<FaqDialogState> {
  await requireAdmin();
  const faqId = String(formData.get("faqId") ?? "") || undefined;
  const intent = formData.get("intent") === "publish" ? "publish" : "draft";
  const values = readCreateFaqFormData(formData);
  const parsed = (faqId ? intent === "publish" ? faqPublishSchema : faqDraftSchema : faqCreateSchema).safeParse({ ...values, faqId });
  if (!parsed.success) {
    return {
      status: "error",
      message: `${faqId ? "تعذر تحديث" : "تعذر إنشاء"} السؤال. راجع الحقول المحددة أدناه.`,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
      revision: previousState.revision + 1,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const versionData = toVersionData(parsed.data);
      const faq = faqId
        ? await tx.fAQ.findUnique({ where: { id: faqId }, select: { id: true, draftVersionId: true, status: true } })
        : await tx.fAQ.create({ data: { status: ContentStatus.DRAFT }, select: { id: true, draftVersionId: true, status: true } });
      if (!faq) throw new Error("السؤال غير موجود.");

      const draft = faq.draftVersionId
        ? await tx.fAQVersion.update({ where: { id: faq.draftVersionId }, data: versionData, select: { id: true } })
        : await tx.fAQVersion.create({ data: { faqId: faq.id, ...versionData }, select: { id: true } });

      if (intent === "publish") {
        const published = await tx.fAQVersion.create({ data: { faqId: faq.id, ...versionData }, select: { id: true } });
        await tx.fAQ.update({ where: { id: faq.id }, data: { draftVersionId: draft.id, publishedVersionId: published.id, publishedAt: new Date(), status: ContentStatus.PUBLISHED } });
        return;
      }

      await tx.fAQ.update({ where: { id: faq.id }, data: { draftVersionId: draft.id, status: faq.status === ContentStatus.PUBLISHED ? ContentStatus.PUBLISHED : ContentStatus.DRAFT } });
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "تعذر حفظ السؤال الآن. بقيت المدخلات محفوظة لتتمكن من المحاولة مرة أخرى.",
      values,
      revision: previousState.revision + 1,
    };
  }

  if (faqId) revalidateFaqPaths(faqId);
  else revalidatePath("/dashboard/faqs");
  const message = intent === "publish" ? "تم نشر السؤال وتحديث الصفحات المرتبطة." : `تم ${faqId ? "تحديث" : "إنشاء"} السؤال وحفظه كمسودة.`;
  redirect(`/dashboard/faqs?success=${encodeURIComponent(message)}`);
}

export async function deleteFaqAction(formData: FormData) {
  await requireAdmin();
  const parsed = faqIdSchema.safeParse({ faqId: formData.get("faqId") });
  if (!parsed.success) redirect("/dashboard/faqs?error=تعذر تحديد السؤال المطلوب حذفه.");

  let result: "missing" | "deleted";
  try {
    result = await runSerializableCmsTransaction(async (tx) => {
      const faq = await tx.fAQ.findUnique({ where: { id: parsed.data.faqId }, select: { id: true } });
      if (!faq) return "missing" as const;
      await cleanupCmsEntityReferences(tx, "faq", faq.id);
      await tx.fAQ.delete({ where: { id: faq.id } });
      return "deleted" as const;
    });

  } catch (error) {
    console.error("FAQ delete failed", error);
    redirect(`/dashboard/faqs?error=${encodeURIComponent("تعذر حذف السؤال. حاول مرة أخرى.")}`);
  }

  if (result === "missing") redirect(`/dashboard/faqs?error=${encodeURIComponent("السؤال غير موجود أو تم حذفه مسبقاً.")}`);
  revalidateFaqPaths(parsed.data.faqId);
  revalidateCmsReferenceConsumers();
  redirect(`/dashboard/faqs?success=${encodeURIComponent("تم حذف السؤال وإزالة روابطه من المحتوى.")}`);
}

function readCreateFaqFormData(formData: FormData): FaqDialogValues {
  return {
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
  };
}

function toVersionData(input: FaqDraftInput) {
  return { question: input.question || null, answer: input.answer || null };
}

function revalidateFaqPaths(faqId: string) {
  revalidatePath("/dashboard/faqs");
  revalidatePath(`/dashboard/faqs/${faqId}`);
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/faqs");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/solutions/[slug]", "page");
  revalidatePath("/materials/[slug]", "page");
  revalidatePath("/guides/[slug]", "page");
}
