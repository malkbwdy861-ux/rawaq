import type { Metadata } from "next";
import Link from "next/link";

import { FaqList } from "@/modules/faqs/components/faq-list";
import { getFaqPreview } from "@/modules/faqs/queries";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "معاينة سؤال شائع", robots: { index: false, follow: false } };
type FaqPreviewPageProps = { params: Promise<{ faqId: string }> };

export default async function FaqPreviewPage({ params }: FaqPreviewPageProps) {
  await requireAdmin();
  const { faqId } = await params;
  const faq = await getFaqPreview(faqId);
  const draft = faq.draftVersion!;
  return <main className="min-h-screen bg-background px-4 py-10 md:px-8"><div className="mx-auto max-w-3xl space-y-12">
    <div className="rounded-[8px] border border-warning bg-warning-soft p-4 text-warning"><p className="font-semibold">معاينة محمية لمسودة غير منشورة</p><Link className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline" href="/dashboard/faqs">العودة إلى الأسئلة</Link></div>
    <section className="space-y-6"><h1 className="text-4xl font-bold leading-[1.24]">معاينة السؤال</h1><FaqList items={[{ id: draft.id, question: draft.question ?? "سؤال بدون عنوان", answer: draft.answer ?? "لم تضف إجابة بعد." }]} /></section>
  </div></main>;
}
