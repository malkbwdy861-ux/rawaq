import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedSolutions } from "@/modules/solutions/queries";

export const metadata: Metadata = {
  title: "الحلول | Jeddah Shading",
  description: "تصفح حلول جده شيدنج المنشورة لاحتياجات التظليل والاستخدامات الخارجية.",
};

export const dynamic = "force-dynamic";

export default async function SolutionsIndexPage() {
  const solutions = await getPublishedSolutions();

  return (
    <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold text-[oklch(37%_0.075_155)]">الحلول</p>
          <h1 className="max-w-3xl text-3xl font-bold leading-[1.35] md:text-5xl">حلول منشورة حسب احتياجات العملاء</h1>
          <p className="max-w-2xl text-base leading-[1.8] text-[oklch(42%_0.018_150)]">تعرض هذه الصفحة الحلول المنشورة فقط. أي تعديلات مسودة في لوحة التحكم لا تظهر هنا قبل النشر.</p>
        </header>
        {solutions.length === 0 ? (
          <section className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-6"><h2 className="text-xl font-semibold">لا توجد حلول منشورة بعد</h2><p className="mt-2 text-[oklch(42%_0.018_150)]">ستظهر الحلول هنا بعد نشرها من لوحة التحكم.</p></section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="قائمة الحلول">
            {solutions.map((solution) => {
              const version = solution.publishedVersion;
              if (!version) return null;
              return (
                <Link className="group overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] transition-colors hover:border-[oklch(37%_0.075_155)]" href={`/solutions/${version.slug}`} key={solution.id}>
                  {version.heroMedia ? <div className="relative aspect-[4/3] bg-[oklch(95%_0.012_110)]"><Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover" fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" src={version.heroMedia.url} /></div> : null}
                  <div className="space-y-3 p-5"><h2 className="text-xl font-bold leading-[1.45] group-hover:text-[oklch(37%_0.075_155)]">{version.title}</h2><p className="text-sm leading-[1.8] text-[oklch(42%_0.018_150)]">{version.shortDescription}</p></div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
