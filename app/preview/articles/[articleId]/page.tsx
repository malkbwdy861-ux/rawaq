import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isTipTapDocument } from "@/modules/articles/content";
import { RichTextRenderer } from "@/modules/articles/components/rich-text-renderer";
import { getArticlePreview } from "@/modules/articles/queries";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "معاينة مقال", robots: { index: false, follow: false } };
type ArticlePreviewPageProps = { params: Promise<{ articleId: string }> };
const typeLabels = { GUIDE: "مقال إرشادي", PRICING: "مقال أسعار", COMPARISON: "مقارنة", MAINTENANCE: "صيانة", GENERAL: "مقال" } as const;

export default async function ArticlePreviewPage({ params }: ArticlePreviewPageProps) {
  await requireAdmin();
  const { articleId } = await params;
  const article = await getArticlePreview(articleId);
  const draft = article.draftVersion;
  if (!draft) notFound();
  return <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-10 md:px-8"><article className="mx-auto max-w-6xl space-y-12">
    <div className="rounded-[8px] border border-[oklch(47%_0.10_75)] bg-[oklch(94%_0.035_80)] p-4 text-[oklch(47%_0.10_75)]"><p className="font-semibold">معاينة محمية لمسودة غير منشورة</p><Link className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline" href={`/dashboard/articles/${article.id}`}>العودة للتحرير</Link></div>
    <header className="max-w-4xl space-y-5"><p className="text-sm font-semibold text-[oklch(58%_0.11_45)]">{draft.articleType ? typeLabels[draft.articleType] : "مقال"}</p><h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">{draft.title ?? "مقال بدون عنوان"}</h1>{draft.excerpt ? <p className="max-w-[62ch] text-xl leading-[1.7] text-[oklch(42%_0.018_150)]">{draft.excerpt}</p> : null}</header>
    {draft.heroMedia ? <figure><div className="relative aspect-video overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)]"><Image alt={draft.heroMedia.altText ?? draft.title ?? ""} className="object-cover" fill sizes="100vw" src={draft.heroMedia.url} /></div>{draft.heroMedia.caption ? <figcaption className="mt-3 text-sm text-[oklch(42%_0.018_150)]">{draft.heroMedia.caption}</figcaption> : null}</figure> : null}
    {isTipTapDocument(draft.content) ? <RichTextRenderer content={draft.content} /> : <p className="border-y border-[oklch(82%_0.012_145)] py-8 text-[oklch(42%_0.018_150)]">لم يضف محتوى منظم إلى المسودة بعد.</p>}
  </article></main>;
}
