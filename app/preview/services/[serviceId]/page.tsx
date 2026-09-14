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
    <main className="min-h-screen bg-background px-4 py-10 md:px-8">
      <article className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[8px] border border-warning bg-warning-soft p-4 text-warning">
          <p className="font-semibold">معاينة محمية لمسودة غير منشورة</p>
          <Link className="mt-2 inline-flex text-sm font-semibold underline" href={`/dashboard/services/${service.id}`}>العودة للتحرير</Link>
        </div>

        <header className="space-y-4">
          <p className="text-sm font-semibold text-success">خدمة</p>
          <h1 className="text-3xl font-bold leading-[1.35] md:text-5xl">{draft.title ?? "خدمة بدون عنوان"}</h1>
          {draft.shortDescription ? <p className="text-lg leading-[1.8] text-text-secondary">{draft.shortDescription}</p> : null}
        </header>

        {draft.heroMedia ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] border border-border bg-secondary">
            <Image alt={draft.heroMedia.altText ?? draft.title ?? ""} className="object-cover" fill sizes="100vw" src={draft.heroMedia.url} />
          </div>
        ) : null}

        <section className="rounded-[8px] border border-border bg-card p-6 text-base leading-[1.9] whitespace-pre-line">
          {draft.content || "لا يوجد محتوى في المسودة بعد."}
        </section>
      </article>
    </main>
  );
}
