import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/server/auth";
import { getServicePreview } from "@/modules/services/queries";

export const metadata: Metadata = {
  title: "معاينة خدمة",
  robots: { index: false, follow: false },
};

type ServicePreviewPageProps = {
  params: Promise<{ serviceId: string }>;
};

export default async function ServicePreviewPage({ params }: ServicePreviewPageProps) {
  await requireAdmin();
  const { serviceId } = await params;
  const service = await getServicePreview(serviceId);
  const draft = service.draftVersion;

  if (!draft) notFound();

  return (
    <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-10 md:px-8">
      <article className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[8px] border border-[oklch(47%_0.10_75)] bg-[oklch(94%_0.035_80)] p-4 text-[oklch(47%_0.10_75)]">
          <p className="font-semibold">معاينة محمية لمسودة غير منشورة</p>
          <Link className="mt-2 inline-flex text-sm font-semibold underline" href={`/dashboard/services/${service.id}`}>العودة للتحرير</Link>
        </div>

        <header className="space-y-4">
          <p className="text-sm font-semibold text-[oklch(37%_0.075_155)]">خدمة</p>
          <h1 className="text-3xl font-bold leading-[1.35] md:text-5xl">{draft.title ?? "خدمة بدون عنوان"}</h1>
          {draft.shortDescription ? <p className="text-lg leading-[1.8] text-[oklch(42%_0.018_150)]">{draft.shortDescription}</p> : null}
        </header>

        {draft.heroMedia ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(95%_0.012_110)]">
            <Image alt={draft.heroMedia.altText ?? draft.title ?? ""} className="object-cover" fill sizes="100vw" src={draft.heroMedia.url} />
          </div>
        ) : null}

        <section className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-6 text-base leading-[1.9] whitespace-pre-line">
          {draft.content || "لا يوجد محتوى في المسودة بعد."}
        </section>
      </article>
    </main>
  );
}
