import { ArrowUpLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedServices } from "@/modules/services/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { listingMetadata } from "@/modules/seo/metadata";

export const metadata: Metadata = listingMetadata("الخدمات", "خدمات التظليل والإنشاءات الخارجية المتاحة للمنازل والمواقع التجارية.", "/services");
export const dynamic = "force-dynamic";

export default async function ServicesIndexPage() {
  const services = await getPublishedServices();

  return (
    <main className="min-h-screen bg-background">
      <div className="public-container py-10 md:py-16">
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "الخدمات", href: "/services" }]} />
        <header className="grid gap-8 pb-14 pt-12 md:grid-cols-12 md:pb-20 md:pt-16">
          <div className="md:col-span-8"><p className="mb-4 text-sm font-semibold text-clay-strong">الخدمات</p><h1 className="max-w-[16ch] text-4xl font-bold leading-[1.24] text-balance md:text-6xl">تنفيذ خارجي يبدأ بفهم الموقع وينتهي بتفاصيل تدوم</h1></div>
          <p className="max-w-[48ch] self-end text-lg leading-8 text-text-secondary md:col-span-4">استكشف نطاقات العمل، ثم افتح تفاصيل الخدمة المناسبة لمعرفة ما يلزم قبل التواصل.</p>
        </header>

        {services.length === 0 ? (
          <section className="border-y border-border py-12"><h2 className="text-2xl font-semibold">نعمل على تحديث تفاصيل الخدمات</h2><p className="mt-3 text-text-secondary">يمكنك التواصل معنا مباشرة لمناقشة احتياج موقعك.</p><Link className="mt-5 inline-flex min-h-12 items-center rounded-[4px] bg-primary px-5 font-semibold text-primary-foreground" href="/contact">ابدأ المحادثة</Link></section>
        ) : (
          <section aria-label="قائمة الخدمات" className="border-t border-border">
            {services.map((service, index) => {
              const version = service.publishedVersion;
              if (!version) return null;
              return (
                <Link className="group grid gap-5 border-b border-border py-7 md:grid-cols-[56px_220px_minmax(0,1fr)_48px] md:items-center md:py-9" href={`/services/${version.slug}`} key={service.id}>
                  <span className="text-sm font-semibold tabular-nums text-clay-strong">{String(index + 1).padStart(2, "0")}</span>
                  {version.heroMedia ? <div className="relative aspect-[4/3] overflow-hidden bg-muted"><Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]" fill sizes="220px" src={version.heroMedia.url} /></div> : <div aria-hidden="true" className="hidden aspect-[4/3] grid-cols-5 gap-1 bg-primary-soft p-3 md:grid">{Array.from({ length: 20 }, (_, cell) => <span className="border border-primary/20" key={cell} />)}</div>}
                  <div><h2 className="text-2xl font-bold leading-[1.4] group-hover:text-primary md:text-3xl">{version.title}</h2><p className="mt-3 max-w-[60ch] leading-8 text-text-secondary">{version.shortDescription}</p></div>
                  <ArrowUpLeft aria-hidden="true" className="size-6 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:translate-y-[-2px] group-hover:text-primary" />
                </Link>
              );
            })}
          </section>
        )}
      </div>
      <section className="bg-primary px-4 py-14 text-primary-foreground md:py-20"><div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between"><div><h2 className="text-3xl font-bold md:text-4xl">لست متأكداً من الخدمة المناسبة؟</h2><p className="mt-3 max-w-[52ch] leading-8 text-primary-soft">صف لنا الموقع والنتيجة التي تريدها، وسنبدأ من الاحتياج لا من اسم المنتج.</p></div><Link className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-[4px] bg-card px-5 font-semibold text-primary" href="/contact">ناقش احتياجك</Link></div></section>
    </main>
  );
}
