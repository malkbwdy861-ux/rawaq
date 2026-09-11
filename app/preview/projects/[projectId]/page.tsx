import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectPreview } from "@/modules/projects/queries";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "معاينة مشروع", robots: { index: false, follow: false } };
type ProjectPreviewPageProps = { params: Promise<{ projectId: string }> };

export default async function ProjectPreviewPage({ params }: ProjectPreviewPageProps) {
  await requireAdmin();
  const { projectId } = await params;
  const project = await getProjectPreview(projectId);
  const draft = project.draftVersion;
  if (!draft) notFound();
  return <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-10 md:px-8"><article className="mx-auto max-w-6xl space-y-10">
    <div className="rounded-[8px] border border-[oklch(47%_0.10_75)] bg-[oklch(94%_0.035_80)] p-4 text-[oklch(47%_0.10_75)]"><p className="font-semibold">معاينة محمية لمسودة غير منشورة</p><Link className="mt-2 inline-flex text-sm font-semibold underline" href={`/dashboard/projects/${project.id}`}>العودة للتحرير</Link></div>
    <header className="space-y-4"><p className="text-sm font-semibold text-[oklch(58%_0.11_45)]">دراسة حالة</p><h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">{draft.title ?? "مشروع بدون عنوان"}</h1>{draft.shortDescription ? <p className="max-w-[62ch] text-lg leading-[1.78] text-[oklch(42%_0.018_150)]">{draft.shortDescription}</p> : null}<p className="text-sm text-[oklch(34%_0.065_42)]">{[draft.city, draft.district].filter(Boolean).join("، ")}</p></header>
    {draft.coverMedia ? <div className="relative aspect-[3/2] overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)]"><Image alt={draft.coverMedia.altText ?? draft.title ?? ""} className="object-cover" fill sizes="100vw" src={draft.coverMedia.url} /></div> : null}
    {draft.content ? <PreviewSection title="تفاصيل المشروع" content={draft.content} /> : null}
    {draft.challenge ? <PreviewSection title="التحدي" content={draft.challenge} /> : null}
    {draft.solutionSummary ? <PreviewSection title="الحل المنفذ" content={draft.solutionSummary} /> : null}
    {draft.technicalDetails ? <PreviewSection title="التفاصيل الفنية" content={draft.technicalDetails} /> : null}
    {draft.gallery.length ? <section className="space-y-6"><h2 className="text-3xl font-bold">معرض المشروع</h2><div className="grid gap-6 md:grid-cols-2">{draft.gallery.map((item) => <figure key={item.id}><div className="relative aspect-[3/2] overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)]"><Image alt={item.media.altText ?? item.caption ?? ""} className="object-cover" fill sizes="(min-width: 768px) 50vw, 100vw" src={item.media.url} /></div>{item.caption ? <figcaption className="mt-2 text-sm text-[oklch(42%_0.018_150)]">{item.caption}</figcaption> : null}</figure>)}</div></section> : null}
  </article></main>;
}

function PreviewSection({ title, content }: { title: string; content: string }) {
  return <section className="max-w-[72ch] border-t border-[oklch(82%_0.012_145)] pt-8"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-4 whitespace-pre-line text-lg leading-[1.9] text-[oklch(42%_0.018_150)]">{content}</p></section>;
}
