import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cmsContentPath } from "@/modules/cms/slugs";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { parsePublicPage } from "@/modules/cms/validation";
import { getPublishedMaterials } from "@/modules/materials/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { listingMetadata } from "@/modules/seo/metadata";

export const metadata: Metadata = listingMetadata("المواد", "تصفح المواد والخيارات المنشورة والمدعومة في أعمال جده شيدنج.", "/materials");

export const revalidate = 300;

export default async function MaterialsIndexPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await getPublishedMaterials(parsePublicPage((await searchParams).page));
  const materials = result.items;

  return (
    <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المواد", href: "/materials" }]} />
        <header className="space-y-4">
          <p className="text-sm font-semibold text-[oklch(37%_0.075_155)]">المواد</p>
          <h1 className="max-w-3xl text-3xl font-bold leading-[1.35] md:text-5xl">مواد وخيارات منشورة ومدعومة فعليًا</h1>
          <p className="max-w-2xl text-base leading-[1.8] text-[oklch(42%_0.018_150)]">قارن خصائص المواد واستخداماتها وحدودها قبل اختيار ما يلائم الموقع وظروفه.</p>
        </header>
        {materials.length === 0 ? (
          <section className="border-y border-border py-10"><h2 className="text-xl font-semibold">نعمل على توثيق المواد المتاحة</h2><p className="mt-2 text-text-secondary">يمكنك التواصل معنا للسؤال عن مادة أو استخدام محدد.</p></section>
        ) : (
          <><section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="قائمة المواد">
            {materials.map((material) => {
              const version = material.publishedVersion;
              if (!version) return null;
              return (
                <Link className="group overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] transition-colors hover:border-[oklch(37%_0.075_155)]" href={cmsContentPath("/materials", version.slug ?? "")} key={material.id}>
                  {version.heroMedia ? <div className="relative aspect-[4/3] bg-[oklch(95%_0.012_110)]"><Image alt={version.heroMedia.altText ?? version.name ?? ""} className="object-cover" fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" src={version.heroMedia.url} /></div> : null}
                  <div className="space-y-3 p-5"><h2 className="text-xl font-bold leading-[1.45] group-hover:text-[oklch(37%_0.075_155)]">{version.name}</h2><p className="text-sm leading-[1.8] text-[oklch(42%_0.018_150)]">{version.shortDescription}</p></div>
                </Link>
              );
            })}
          </section><CmsPaginationControls basePath="/materials" pagination={result.pagination} /></>
        )}
      </div>
    </main>
  );
}
