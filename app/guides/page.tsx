import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedArticles } from "@/modules/articles/queries";

export const metadata: Metadata = { title: "الأدلة | Jeddah Shading", description: "أدلة عملية منشورة حول التظليل والمواد والأسعار والصيانة." };
export const dynamic = "force-dynamic";

const typeLabels = { GUIDE: "دليل", PRICING: "دليل أسعار", COMPARISON: "مقارنة", MAINTENANCE: "صيانة", GENERAL: "مقال" } as const;

export default async function GuidesIndexPage() {
  const articles = await getPublishedArticles();
  return <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-16 md:px-8 md:py-20 lg:py-24">
    <div className="mx-auto max-w-7xl space-y-12">
      <nav aria-label="مسار التنقل" className="text-sm text-[oklch(42%_0.018_150)]"><Link className="font-semibold underline" href="/">الرئيسية</Link><span aria-hidden="true"> / </span><span aria-current="page">الأدلة</span></nav>
      <header className="max-w-3xl space-y-4"><p className="text-sm font-semibold text-[oklch(58%_0.11_45)]">معرفة عملية</p><h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">أدلة تساعدك على اتخاذ قرار واضح</h1><p className="max-w-[62ch] text-lg leading-[1.78] text-[oklch(42%_0.018_150)]">معلومات منشورة عن الخيارات والمواد وعوامل الأسعار والصيانة، منظمة للقراءة والرجوع إليها.</p></header>
      {articles.length === 0 ? <section className="border-y border-[oklch(82%_0.012_145)] py-10"><h2 className="text-2xl font-semibold">لا توجد أدلة منشورة بعد</h2><p className="mt-2 text-[oklch(42%_0.018_150)]">ستظهر الأدلة هنا بعد نشرها من لوحة التحكم.</p></section> : <section aria-label="قائمة الأدلة" className="divide-y divide-[oklch(82%_0.012_145)] border-y border-[oklch(82%_0.012_145)]">
        {articles.map((article, index) => { const version = article.publishedVersion; if (!version) return null; return <article className="grid gap-6 py-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,360px)] md:items-center md:py-10" key={article.id}>
          <div className="space-y-3"><p className="text-sm font-semibold text-[oklch(34%_0.065_42)]">{version.articleType ? typeLabels[version.articleType] : "دليل"}</p><h2 className="text-2xl font-bold leading-[1.4] md:text-3xl"><Link className="hover:text-[oklch(37%_0.075_155)]" href={`/guides/${version.slug}`}>{version.title}</Link></h2><p className="max-w-[62ch] leading-[1.8] text-[oklch(42%_0.018_150)]">{version.excerpt}</p><Link className="inline-flex min-h-11 items-center text-sm font-semibold text-[oklch(37%_0.075_155)] underline" href={`/guides/${version.slug}`}>قراءة الدليل</Link></div>
          {version.heroMedia ? <Link className="relative order-first aspect-video overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)] md:order-none" href={`/guides/${version.slug}`}><Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover" fill priority={index === 0} sizes="(min-width: 768px) 360px, 100vw" src={version.heroMedia.url} /></Link> : null}
        </article>; })}
      </section>}
    </div>
  </main>;
}
