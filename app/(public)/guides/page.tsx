import { ArrowLeft, BookOpenText } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedArticles } from "@/modules/articles/queries";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { cmsContentPath } from "@/modules/cms/slugs";
import { parsePublicPage } from "@/modules/cms/validation";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { listingMetadata } from "@/modules/seo/metadata";

export const metadata: Metadata = listingMetadata("الأدلة", "أدلة عملية منشورة حول التظليل والمواد والأسعار والصيانة.", "/guides");
export const revalidate = 300;

const typeLabels = { GUIDE: "دليل", PRICING: "دليل أسعار", COMPARISON: "مقارنة", MAINTENANCE: "صيانة", GENERAL: "مقال" } as const;

export default async function GuidesIndexPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await getPublishedArticles(parsePublicPage((await searchParams).page));
  const [featured, ...articles] = result.items;

  return (
    <main className="min-h-screen bg-background">
      <section className="relative isolate overflow-hidden bg-primary-active px-4 pb-20 pt-10 text-primary-foreground md:px-8 md:pb-28 md:pt-12 lg:pb-32">
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-35 [background-image:linear-gradient(90deg,color-mix(in_oklch,var(--primary-soft)_10%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_oklch,var(--primary-soft)_10%,transparent)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(90deg,transparent,black_25%,black_75%,transparent)]" />
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs className="text-primary-soft" items={[{ label: "الرئيسية", href: "/" }, { label: "الأدلة", href: "/guides" }]} />
          <header className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(260px,0.28fr)] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-primary-soft">معرفة عملية، قبل قرار التنفيذ</p>
              <h1 className="mt-4 max-w-[14ch] text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.16]">أدلة واضحة لاختيار ما يناسب موقعك</h1>
            </div>
            <p className="max-w-[42ch] border-t border-primary-soft/25 pt-5 text-lg leading-[1.85] text-primary-soft">معلومات عملية عن المواد والأسعار والصيانة والمقارنات، مرتبة لتصل إلى القرار بثقة.</p>
          </header>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20 lg:py-24">
        {!featured ? (
          <section className="border-y border-border py-14 text-center">
            <BookOpenText className="mx-auto size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold">نعمل على إعداد الأدلة</h2>
            <p className="mt-2 text-text-secondary">يمكنك العودة لاحقاً أو التواصل معنا بسؤالك مباشرة.</p>
            <Link className="mt-6 inline-flex min-h-12 items-center font-semibold text-primary underline underline-offset-4" href="/contact">تواصل معنا</Link>
          </section>
        ) : (
          <>
            <FeaturedGuide article={featured} />
            {articles.length ? (
              <section aria-labelledby="latest-guides-title" className="mt-20 lg:mt-24">
                <div className="flex items-end justify-between gap-6 border-b border-border pb-5">
                  <div><p className="text-sm font-semibold text-clay-strong">المكتبة</p><h2 className="mt-2 text-3xl font-bold leading-[1.35] md:text-4xl" id="latest-guides-title">المزيد من الأدلة</h2></div>
                  <span className="hidden text-sm text-text-secondary sm:block">مرتبة من الأحدث</span>
                </div>
                <div className="divide-y divide-border">{articles.map((article) => <GuideRow article={article} key={article.id} />)}</div>
              </section>
            ) : null}
            <div className="mt-12 border-t border-border pt-7"><CmsPaginationControls basePath="/guides" pagination={result.pagination} /></div>
          </>
        )}
      </div>
    </main>
  );
}

type PublishedGuide = Awaited<ReturnType<typeof getPublishedArticles>>["items"][number];

function FeaturedGuide({ article }: { article: PublishedGuide }) {
  const version = article.publishedVersion;
  if (!version) return null;
  const href = cmsContentPath("/guides", version.slug ?? "");
  return (
    <article className={`grid overflow-hidden border-y border-border bg-card ${version.heroMedia ? "lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]" : ""}`}>
      {version.heroMedia ? <Link className="relative min-h-64 overflow-hidden bg-secondary sm:min-h-80 lg:min-h-[430px]" href={href}><Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]" fill priority sizes="(min-width: 1024px) 55vw, 100vw" src={version.heroMedia.url} /></Link> : null}
      <div className="flex flex-col justify-center px-1 py-9 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold"><span className="text-clay-strong">{version.articleType ? typeLabels[version.articleType] : "دليل"}</span>{article.publishedAt ? <><span aria-hidden="true" className="size-1 rounded-full bg-border-strong" /><time className="font-normal text-text-secondary" dateTime={article.publishedAt.toISOString()}>{article.publishedAt.toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}</time></> : null}</div>
        <h2 className="mt-5 text-3xl font-bold leading-[1.35] md:text-4xl"><Link className="transition-colors hover:text-primary" href={href}>{version.title}</Link></h2>
        <p className="mt-5 max-w-[52ch] text-lg leading-[1.85] text-text-secondary">{version.excerpt}</p>
        <Link className="mt-8 inline-flex min-h-12 w-fit items-center gap-2 font-semibold text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:text-primary-hover" href={href}>قراءة الدليل<ArrowLeft aria-hidden="true" className="size-4" /></Link>
      </div>
    </article>
  );
}

function GuideRow({ article }: { article: PublishedGuide }) {
  const version = article.publishedVersion;
  if (!version) return null;
  const href = cmsContentPath("/guides", version.slug ?? "");
  return (
    <article className="grid gap-6 py-8 md:grid-cols-[minmax(180px,280px)_minmax(0,1fr)_auto] md:items-center md:py-10">
      {version.heroMedia ? <Link className="relative aspect-video overflow-hidden bg-secondary" href={href}><Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover transition-transform duration-300 ease-out hover:scale-[1.025]" fill sizes="(min-width: 768px) 280px, 100vw" src={version.heroMedia.url} /></Link> : <div className="hidden aspect-video place-items-center bg-primary-soft text-primary md:grid"><BookOpenText aria-hidden="true" className="size-7" /></div>}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 text-sm"><span className="font-semibold text-clay-strong">{version.articleType ? typeLabels[version.articleType] : "دليل"}</span>{article.publishedAt ? <time className="text-text-secondary" dateTime={article.publishedAt.toISOString()}>{article.publishedAt.toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}</time> : null}</div>
        <h3 className="mt-3 text-2xl font-bold leading-[1.45]"><Link className="transition-colors hover:text-primary" href={href}>{version.title}</Link></h3>
        <p className="mt-3 line-clamp-2 max-w-[62ch] leading-[1.8] text-text-secondary">{version.excerpt}</p>
      </div>
      <Link aria-label={`قراءة: ${version.title}`} className="inline-flex size-12 items-center justify-center rounded-full border border-border-strong text-primary transition-colors hover:border-primary hover:bg-primary-soft" href={href}><ArrowLeft aria-hidden="true" className="size-5" /></Link>
    </article>
  );
}
