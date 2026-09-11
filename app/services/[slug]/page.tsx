import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedServiceBySlug } from "@/modules/services/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { JsonLd } from "@/modules/seo/components/json-ld";
import { contentMetadata } from "@/modules/seo/metadata";
import { absoluteUrl } from "@/modules/seo/site-url";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  const version = service.publishedVersion;

  if (!version) notFound();

  return contentMetadata({ version, path: `/services/${slug}`, title: version.title ?? "خدمة", description: version.shortDescription, image: version.heroMedia?.url });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  const version = service.publishedVersion;

  if (!version) notFound();

  return (
    <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-12 md:px-8">
      <article className="mx-auto max-w-5xl space-y-10">
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "الخدمات", href: "/services" }, { label: version.title ?? "خدمة", href: `/services/${slug}` }]} />
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: version.title, description: version.shortDescription, url: absoluteUrl(`/services/${slug}`), image: version.heroMedia?.url || undefined }} />

        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[oklch(37%_0.075_155)]">خدمة</p>
            <h1 className="text-3xl font-bold leading-[1.35] md:text-5xl">{version.title}</h1>
            <p className="text-lg leading-[1.8] text-[oklch(42%_0.018_150)]">{version.shortDescription}</p>
          </div>
          {version.heroMedia ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(95%_0.012_110)]">
              <Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1024px) 360px, 100vw" src={version.heroMedia.url} />
            </div>
          ) : null}
        </header>

        <section className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-6 text-base leading-[1.9] text-[oklch(22%_0.018_155)] whitespace-pre-line">
          {version.content}
        </section>

        <RelatedContent title="حلول مرتبطة" items={version.solutions.map((item) => ({ label: item.solution.publishedVersion?.title, href: `/solutions/${item.solution.publishedVersion?.slug}` })).filter(isRelated)} />
        <RelatedContent title="مواد مرتبطة" items={version.materials.map((item) => ({ label: item.material.publishedVersion?.name, href: `/materials/${item.material.publishedVersion?.slug}` })).filter(isRelated)} />
        <RelatedContent title="مشاريع مرتبطة" items={version.projects.map((item) => ({ label: item.project.publishedVersion?.title, href: `/projects/${item.project.publishedVersion?.slug}` })).filter(isRelated)} />
        <RelatedContent title="أدلة مرتبطة" items={version.articles.map((item) => ({ label: item.article.publishedVersion?.title, href: `/guides/${item.article.publishedVersion?.slug}` })).filter(isRelated)} />
        <RelatedContent title="أسئلة شائعة" items={version.faqs.map((item) => ({ label: item.faq.publishedVersion?.question, href: "" })).filter((item): item is { label: string; href: string } => Boolean(item.label))} />

        <section className="rounded-[8px] bg-[oklch(37%_0.075_155)] p-6 text-[oklch(99%_0.004_100)]">
          <h2 className="text-2xl font-bold">هل تحتاج هذه الخدمة؟</h2>
          <p className="mt-2 leading-[1.8]">تواصل معنا عبر واتساب أو الهاتف لمناقشة التفاصيل والأسعار المناسبة للموقع.</p>
          <Link className="mt-4 inline-flex min-h-10 items-center rounded-[4px] bg-[oklch(99%_0.004_100)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href="/prices">عرض إرشادات الأسعار</Link>
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
    <section className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-3 grid gap-2 text-[oklch(42%_0.018_150)]">
        {items.map((item) => <li key={`${item.href}-${item.label}`}>{item.href ? <Link className="inline-flex min-h-11 items-center font-semibold text-[oklch(37%_0.075_155)] underline" href={item.href}>{item.label}</Link> : item.label}</li>)}
      </ul>
    </section>
  );
}
