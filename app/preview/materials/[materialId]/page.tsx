import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaterialPreview, jsonStringArray } from "@/modules/materials/queries";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = {
  title: "معاينة مادة",
  robots: { index: false, follow: false },
};

type MaterialPreviewPageProps = {
  params: Promise<{ materialId: string }>;
};

export default async function MaterialPreviewPage({ params }: MaterialPreviewPageProps) {
  await requireAdmin();
  const { materialId } = await params;
  const material = await getMaterialPreview(materialId);
  const draft = material.draftVersion;

  if (!draft) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-8">
      <article className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[8px] border border-warning bg-warning-soft p-4 text-warning">
          <p className="font-semibold">معاينة محمية لمسودة غير منشورة</p>
          <Link className="mt-2 inline-flex text-sm font-semibold underline" href={`/dashboard/materials/${material.id}`}>العودة للتحرير</Link>
        </div>
        <header className="space-y-4">
          <p className="text-sm font-semibold text-success">مادة</p>
          <h1 className="text-3xl font-bold leading-[1.35] md:text-5xl">{draft.name ?? "مادة بدون عنوان"}</h1>
          {draft.shortDescription ? <p className="text-lg leading-[1.8] text-text-secondary">{draft.shortDescription}</p> : null}
        </header>
        {draft.heroMedia ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] border border-border bg-secondary">
            <Image alt={draft.heroMedia.altText ?? draft.name ?? ""} className="object-cover" fill sizes="100vw" src={draft.heroMedia.url} />
          </div>
        ) : null}
        <section className="rounded-[8px] border border-border bg-card p-6 text-base leading-[1.9] whitespace-pre-line">
          {draft.content || "لا يوجد محتوى في المسودة بعد."}
        </section>
        <FactList title="المزايا" items={jsonStringArray(draft.advantages)} />
        <FactList title="القيود" items={jsonStringArray(draft.limitations)} />
        <FactList title="الاستخدامات الموصى بها" items={jsonStringArray(draft.recommendedUses)} />
        {draft.maintenanceNotes ? <section className="rounded-[8px] border border-border bg-card p-5"><h2 className="text-xl font-semibold">ملاحظات الصيانة</h2><p className="mt-3 whitespace-pre-line leading-[1.9]">{draft.maintenanceNotes}</p></section> : null}
      </article>
    </main>
  );
}

function FactList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <section className="rounded-[8px] border border-border bg-card p-5"><h2 className="text-xl font-semibold">{title}</h2><ul className="mt-3 grid gap-2 text-text-secondary">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
