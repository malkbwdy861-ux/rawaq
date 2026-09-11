import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isTipTapDocument } from "@/modules/articles/content";
import { RichTextRenderer } from "@/modules/articles/components/rich-text-renderer";
import { getPublishedArticleBySlug } from "@/modules/articles/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { JsonLd } from "@/modules/seo/components/json-ld";
import { contentMetadata } from "@/modules/seo/metadata";
import { absoluteUrl } from "@/modules/seo/site-url";

type GuidePageProps = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
const typeLabels = { GUIDE: "دليل", PRICING: "دليل أسعار", COMPARISON: "مقارنة", MAINTENANCE: "صيانة", GENERAL: "مقال" } as const;

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  const version = article.publishedVersion;
  if (!version) notFound();
  return contentMetadata({ version, path: `/guides/${slug}`, title: version.title ?? "دليل", description: version.excerpt, image: version.heroMedia?.url, type: "article" });
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  const version = article.publishedVersion;
  if (!version || !isTipTapDocument(version.content)) notFound();
  return <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-12 md:px-8 md:py-20">
    <article className="mx-auto max-w-7xl space-y-14">
      <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "الأدلة", href: "/guides" }, { label: version.title ?? "دليل", href: `/guides/${slug}` }]} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: version.title, description: version.excerpt, url: absoluteUrl(`/guides/${slug}`), image: version.heroMedia?.url || undefined, datePublished: article.publishedAt?.toISOString(), dateModified: version.updatedAt.toISOString() }} />
      {version.faqs.length ? <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: version.faqs.flatMap((item) => item.faq.publishedVersion ? [{ "@type": "Question", name: item.faq.publishedVersion.question, acceptedAnswer: { "@type": "Answer", text: item.faq.publishedVersion.answer } }] : []) }} /> : null}
      <header className="max-w-4xl space-y-5"><p className="text-sm font-semibold text-[oklch(58%_0.11_45)]">{version.articleType ? typeLabels[version.articleType] : "دليل"}</p><h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">{version.title}</h1><p className="max-w-[62ch] text-xl leading-[1.7] text-[oklch(42%_0.018_150)] md:text-2xl">{version.excerpt}</p></header>
      {version.heroMedia ? <figure className="max-w-6xl"><div className="relative aspect-video overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)]"><Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1280px) 1152px, 100vw" src={version.heroMedia.url} /></div>{version.heroMedia.caption ? <figcaption className="mt-3 text-sm leading-[1.7] text-[oklch(42%_0.018_150)]">{version.heroMedia.caption}</figcaption> : null}</figure> : null}
      <RichTextRenderer content={version.content} />
      <RelatedSection title="الخدمات المرتبطة" items={version.services.map((item) => ({ label: item.service.publishedVersion?.title, slug: item.service.publishedVersion?.slug, prefix: "/services" }))} />
      <RelatedSection title="الحلول المرتبطة" items={version.solutions.map((item) => ({ label: item.solution.publishedVersion?.title, slug: item.solution.publishedVersion?.slug, prefix: "/solutions" }))} />
      <RelatedSection title="المواد المرتبطة" items={version.materials.map((item) => ({ label: item.material.publishedVersion?.name, slug: item.material.publishedVersion?.slug, prefix: "/materials" }))} />
      <RelatedSection title="المشاريع المرتبطة" items={version.projects.map((item) => ({ label: item.project.publishedVersion?.title, slug: item.project.publishedVersion?.slug, prefix: "/projects" }))} />
      {version.faqs.length ? <section className="max-w-[72ch] space-y-6 border-t border-[oklch(82%_0.012_145)] pt-8"><h2 className="text-3xl font-bold leading-[1.35]">أسئلة مرتبطة</h2><div className="divide-y divide-[oklch(82%_0.012_145)]">{version.faqs.map((item) => item.faq.publishedVersion ? <details className="py-4" key={item.faqId}><summary className="min-h-11 cursor-pointer py-2 text-lg font-semibold">{item.faq.publishedVersion.question}</summary><p className="pt-3 leading-[1.8] text-[oklch(42%_0.018_150)]">{item.faq.publishedVersion.answer}</p></details> : null)}</div></section> : null}
    </article>
  </main>;
}

function RelatedSection({ title, items }: { title: string; items: { label: string | null | undefined; slug: string | null | undefined; prefix: string }[] }) {
  const visible = items.filter((item): item is { label: string; slug: string; prefix: string } => Boolean(item.label && item.slug));
  if (!visible.length) return null;
  return <section className="grid gap-6 border-t border-[oklch(82%_0.012_145)] pt-8 md:grid-cols-[280px_minmax(0,1fr)]"><h2 className="text-2xl font-bold leading-[1.4]">{title}</h2><ul className="grid gap-3">{visible.map((item) => <li key={`${item.prefix}/${item.slug}`}><Link className="inline-flex min-h-11 items-center text-lg font-semibold text-[oklch(37%_0.075_155)] underline" href={`${item.prefix}/${item.slug}`}>{item.label}</Link></li>)}</ul></section>;
}
