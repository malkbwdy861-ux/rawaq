import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedServiceBySlug } from "@/modules/services/queries";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  const version = service.publishedVersion;

  if (!version) notFound();

  return {
    title: version.seoTitle ?? version.title ?? "خدمة",
    description: version.seoDescription ?? version.shortDescription ?? undefined,
    alternates: version.canonicalUrl ? { canonical: version.canonicalUrl } : undefined,
    robots: version.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: version.openGraphTitle ?? version.seoTitle ?? version.title ?? undefined,
      description: version.openGraphDescription ?? version.seoDescription ?? version.shortDescription ?? undefined,
      images: version.openGraphImage?.url ? [version.openGraphImage.url] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  const version = service.publishedVersion;

  if (!version) notFound();

  return (
    <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-12 md:px-8">
      <article className="mx-auto max-w-5xl space-y-10">
        <Link className="inline-flex text-sm font-semibold text-[oklch(37%_0.075_155)]" href="/services">العودة إلى الخدمات</Link>

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

        <RelatedContent title="حلول مرتبطة" items={version.solutions.map((item) => item.solution.publishedVersion?.title).filter(isPresent)} />
        <RelatedContent title="مواد مرتبطة" items={version.materials.map((item) => item.material.publishedVersion?.name).filter(isPresent)} />
        <RelatedContent title="مشاريع مرتبطة" items={version.projects.map((item) => item.project.publishedVersion?.title).filter(isPresent)} />
        <RelatedContent title="مقالات مرتبطة" items={version.articles.map((item) => item.article.publishedVersion?.title).filter(isPresent)} />
        <RelatedContent title="أسئلة شائعة" items={version.faqs.map((item) => item.faq.publishedVersion?.question).filter(isPresent)} />

        <section className="rounded-[8px] bg-[oklch(37%_0.075_155)] p-6 text-[oklch(99%_0.004_100)]">
          <h2 className="text-2xl font-bold">هل تحتاج هذه الخدمة؟</h2>
          <p className="mt-2 leading-[1.8]">تواصل معنا عبر واتساب أو الهاتف لمناقشة التفاصيل والأسعار المناسبة للموقع.</p>
          <Link className="mt-4 inline-flex min-h-10 items-center rounded-[4px] bg-[oklch(99%_0.004_100)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href="/prices">عرض إرشادات الأسعار</Link>
        </section>
      </article>
    </main>
  );
}

function isPresent(value: string | null | undefined): value is string {
  return Boolean(value);
}

function RelatedContent({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-3 grid gap-2 text-[oklch(42%_0.018_150)]">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
