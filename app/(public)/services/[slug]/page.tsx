import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cmsContentPath, decodeCmsSlug } from "@/modules/cms/slugs";
import { getPublishedServiceBySlug } from "@/modules/services/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { JsonLd } from "@/modules/seo/components/json-ld";
import { contentMetadata } from "@/modules/seo/metadata";
import { absoluteUrl } from "@/modules/seo/site-url";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const service = await getPublishedServiceBySlug(slug);
  const version = service.publishedVersion;

  if (!version) notFound();

  return contentMetadata({ version, path: cmsContentPath("/services", slug), title: version.title ?? "خدمة", description: version.shortDescription, image: version.heroMedia?.url });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const service = await getPublishedServiceBySlug(slug);
  const version = service.publishedVersion;

  if (!version) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-8 md:py-16">
      <article className="mx-auto max-w-7xl space-y-14 md:space-y-20">
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "الخدمات", href: "/services" }, { label: version.title ?? "خدمة", href: cmsContentPath("/services", slug) }]} />
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: version.title, description: version.shortDescription, url: absoluteUrl(cmsContentPath("/services", slug)), image: version.heroMedia?.url || undefined }} />

        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="space-y-5 lg:col-span-6 lg:pb-8">
            <p className="text-sm font-semibold text-clay-strong">خدمة تنفيذ</p>
            <h1 className="text-4xl font-bold leading-[1.24] text-balance md:text-6xl">{version.title}</h1>
            <p className="max-w-[52ch] text-xl leading-[1.75] text-text-secondary">{version.shortDescription}</p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row"><Link className="inline-flex min-h-12 items-center justify-center rounded-[4px] bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary-hover" href="/contact">ناقش تفاصيل الموقع</Link><Link className="inline-flex min-h-12 items-center justify-center rounded-[4px] border border-border-strong px-5 font-semibold text-primary hover:bg-primary-soft" href="/prices">عوامل تحديد السعر</Link></div>
          </div>
          {version.heroMedia ? (
            <div className="relative aspect-[4/3] overflow-hidden bg-muted lg:col-span-6">
              <Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1024px) 50vw, 100vw" src={version.heroMedia.url} />
            </div>
          ) : <div aria-hidden="true" className="hidden aspect-[4/3] grid-cols-8 gap-2 border-y border-primary/30 bg-primary-soft p-6 lg:col-span-5 lg:col-start-8 lg:grid">{Array.from({ length: 40 }, (_, index) => <span className="border border-primary/20" key={index} />)}</div>}
        </header>

        <section className="grid gap-7 border-t border-border pt-10 md:grid-cols-12">
          <h2 className="text-2xl font-bold leading-[1.4] md:col-span-4">عن هذه الخدمة</h2>
          <div className="max-w-[72ch] whitespace-pre-line text-lg leading-[1.95] text-text-secondary md:col-span-7 md:col-start-6">{version.content}</div>
        </section>

        <RelatedContent title="حلول مرتبطة" items={version.solutions.map((item) => ({ label: item.solution.publishedVersion?.title, href: item.solution.publishedVersion?.slug ? cmsContentPath("/solutions", item.solution.publishedVersion.slug) : "" })).filter(isRelated)} />
        <RelatedContent title="مواد مرتبطة" items={version.materials.map((item) => ({ label: item.material.publishedVersion?.name, href: item.material.publishedVersion?.slug ? cmsContentPath("/materials", item.material.publishedVersion.slug) : "" })).filter(isRelated)} />
        <RelatedContent title="مشاريع مرتبطة" items={version.projects.map((item) => ({ label: item.project.publishedVersion?.title, href: item.project.publishedVersion?.slug ? cmsContentPath("/projects", item.project.publishedVersion.slug) : "" })).filter(isRelated)} />
        <RelatedContent title="أدلة مرتبطة" items={version.articles.map((item) => ({ label: item.article.publishedVersion?.title, href: item.article.publishedVersion?.slug ? cmsContentPath("/guides", item.article.publishedVersion.slug) : "" })).filter(isRelated)} />
        <RelatedContent title="أسئلة شائعة" items={version.faqs.map((item) => ({ label: item.faq.publishedVersion?.question, href: "" })).filter((item): item is { label: string; href: string } => Boolean(item.label))} />

        <section className="bg-primary p-7 text-primary-foreground md:p-10">
          <h2 className="text-3xl font-bold">هل تناسب الخدمة موقعك؟</h2>
          <p className="mt-3 max-w-[52ch] leading-8 text-primary-soft">أرسل نوع الموقع والأبعاد التقريبية عبر نموذج التواصل لبدء مناقشة واضحة.</p>
          <Link className="mt-6 inline-flex min-h-12 items-center rounded-[4px] bg-card px-5 font-semibold text-primary" href="/contact">ابدأ المحادثة</Link>
        </section>
      </article>
    </main>
  );
}

function isRelated(item: { label: string | null | undefined; href: string }): item is { label: string; href: string } {
  return Boolean(item.label && !item.href.endsWith("undefined"));
}

function RelatedContent({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  if (!items.length) return null;

  return (
    <section className="grid gap-5 border-t border-border pt-8 md:grid-cols-[240px_minmax(0,1fr)]">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="grid gap-1 text-text-secondary">
        {items.map((item) => <li className="border-b border-border py-2 last:border-b-0" key={`${item.href}-${item.label}`}>{item.href ? <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4" href={item.href}>{item.label}</Link> : item.label}</li>)}
      </ul>
    </section>
  );
}
