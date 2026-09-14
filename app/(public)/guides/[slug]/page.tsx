import { ArrowLeft, BookOpenText } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getRichTextHeadings, RichTextRenderer } from "@/modules/articles/components/rich-text-renderer";
import { isTipTapDocument } from "@/modules/articles/content";
import { getPublishedArticleBySlug } from "@/modules/articles/queries";
import { cmsContentPath, decodeCmsSlug } from "@/modules/cms/slugs";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { JsonLd } from "@/modules/seo/components/json-ld";
import { contentMetadata } from "@/modules/seo/metadata";
import { absoluteUrl } from "@/modules/seo/site-url";

type GuidePageProps = { params: Promise<{ slug: string }> };
export const revalidate = 300;
const typeLabels = { GUIDE: "دليل", PRICING: "دليل أسعار", COMPARISON: "مقارنة", MAINTENANCE: "صيانة", GENERAL: "مقال" } as const;

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const article = await getPublishedArticleBySlug(slug);
  const version = article.publishedVersion;
  if (!version) notFound();
  return contentMetadata({ version, path: cmsContentPath("/guides", slug), title: version.title ?? "دليل", description: version.excerpt, image: version.heroMedia?.url, type: "article" });
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const article = await getPublishedArticleBySlug(slug);
  const version = article.publishedVersion;
  if (!version || !isTipTapDocument(version.content)) notFound();
  const headings = getRichTextHeadings(version.content);
  const relationshipGroups = [
    { title: "الخدمات", items: version.services.map((item) => ({ label: item.service.publishedVersion?.title, slug: item.service.publishedVersion?.slug, prefix: "/services" })) },
    { title: "الحلول", items: version.solutions.map((item) => ({ label: item.solution.publishedVersion?.title, slug: item.solution.publishedVersion?.slug, prefix: "/solutions" })) },
    { title: "المواد", items: version.materials.map((item) => ({ label: item.material.publishedVersion?.name, slug: item.material.publishedVersion?.slug, prefix: "/materials" })) },
    { title: "المشاريع", items: version.projects.map((item) => ({ label: item.project.publishedVersion?.title, slug: item.project.publishedVersion?.slug, prefix: "/projects" })) },
  ].map((group) => ({ ...group, items: group.items.filter((item): item is { label: string; slug: string; prefix: string } => Boolean(item.label && item.slug)) })).filter((group) => group.items.length);

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: version.title, description: version.excerpt, url: absoluteUrl(cmsContentPath("/guides", slug)), image: version.heroMedia?.url || undefined, datePublished: article.publishedAt?.toISOString(), dateModified: version.updatedAt.toISOString() }} />
      {version.faqs.length ? <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: version.faqs.flatMap((item) => item.faq.publishedVersion ? [{ "@type": "Question", name: item.faq.publishedVersion.question, acceptedAnswer: { "@type": "Answer", text: item.faq.publishedVersion.answer } }] : []) }} /> : null}

      <section className="relative isolate overflow-hidden bg-brand-secondary px-4 pb-20 pt-10 text-brand-secondary-foreground md:px-8 md:pb-28 md:pt-12">
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(90deg,color-mix(in_oklab,var(--brand-secondary-muted)_10%,transparent)_1px,transparent_1px)] [background-size:96px_100%] [mask-image:linear-gradient(90deg,transparent,black_25%,black_80%,transparent)]" />
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs className="text-brand-secondary-muted" items={[{ label: "الرئيسية", href: "/" }, { label: "الأدلة", href: "/guides" }, { label: version.title ?? "دليل", href: cmsContentPath("/guides", slug) }]} />
          <header className="mt-14 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-sm"><span className="font-semibold text-brand-secondary-muted">{version.articleType ? typeLabels[version.articleType] : "دليل"}</span>{article.publishedAt ? <><span aria-hidden="true" className="size-1 rounded-full bg-brand-secondary-muted/60" /><time className="text-brand-secondary-muted/80" dateTime={article.publishedAt.toISOString()}>{article.publishedAt.toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}</time></> : null}</div>
            <h1 className="mt-5 text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.18]">{version.title}</h1>
            <p className="mt-6 max-w-[62ch] text-xl leading-[1.8] text-brand-secondary-muted md:text-2xl">{version.excerpt}</p>
          </header>
        </div>
      </section>

      {version.heroMedia ? <figure className="mx-auto -mt-10 max-w-6xl px-4 md:-mt-14 md:px-8"><div className="relative aspect-[16/9] overflow-hidden bg-secondary shadow-[var(--shadow-project)]"><Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1280px) 1152px, 100vw" src={version.heroMedia.url} /></div>{version.heroMedia.caption ? <figcaption className="mt-3 text-sm leading-[1.7] text-text-secondary">{version.heroMedia.caption}</figcaption> : null}</figure> : null}

      <article className={`mx-auto grid max-w-6xl gap-12 px-4 py-16 md:px-8 md:py-20 ${headings.length >= 2 ? "lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-20" : ""}`}>
        <RichTextRenderer content={version.content} />
        {headings.length >= 2 ? <aside className="order-first border-y border-border py-5 lg:order-none lg:sticky lg:top-28 lg:self-start lg:border-b-0"><h2 className="flex items-center gap-2 text-sm font-semibold"><BookOpenText aria-hidden="true" className="size-4 text-primary" />في هذا الدليل</h2><nav aria-label="محتويات الدليل" className="mt-4"><ol className="grid gap-1">{headings.map((heading) => <li className={heading.level === 3 ? "pe-4" : ""} key={heading.id}><a className="block min-h-10 py-2 text-sm leading-6 text-text-secondary underline-offset-4 transition-colors hover:text-primary hover:underline" href={`#${heading.id}`}>{heading.label}</a></li>)}</ol></nav></aside> : null}
      </article>

      {relationshipGroups.length ? <section className="bg-secondary px-4 py-16 md:px-8 md:py-20"><div className="mx-auto max-w-6xl"><p className="text-sm font-semibold text-clay-strong">خطوتك التالية</p><h2 className="mt-2 text-3xl font-bold leading-[1.35] md:text-4xl">محتوى مرتبط بالدليل</h2><div className="mt-9 grid gap-x-10 gap-y-9 border-t border-border pt-8 sm:grid-cols-2">{relationshipGroups.map((group) => <section key={group.title}><h3 className="text-lg font-semibold">{group.title}</h3><ul className="mt-3 grid gap-2">{group.items.map((item) => <li key={`${item.prefix}/${item.slug}`}><Link className="inline-flex min-h-10 items-center gap-2 font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:text-primary-hover" href={cmsContentPath(item.prefix, item.slug)}>{item.label}<ArrowLeft aria-hidden="true" className="size-4" /></Link></li>)}</ul></section>)}</div></div></section> : null}

      {version.faqs.length ? <section className="px-4 py-16 md:px-8 md:py-20"><div className="mx-auto max-w-4xl"><p className="text-sm font-semibold text-clay-strong">إجابات مختصرة</p><h2 className="mt-2 text-3xl font-bold leading-[1.35] md:text-4xl">أسئلة مرتبطة</h2><div className="mt-8 divide-y divide-border border-y border-border">{version.faqs.map((item) => item.faq.publishedVersion ? <details className="group py-2" key={item.faqId}><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-3 text-lg font-semibold marker:content-none"><span>{item.faq.publishedVersion.question}</span><span aria-hidden="true" className="text-2xl font-normal text-primary transition-transform group-open:rotate-45">+</span></summary><p className="max-w-[62ch] pb-5 leading-[1.85] text-text-secondary">{item.faq.publishedVersion.answer}</p></details> : null)}</div></div></section> : null}

      <section className="px-4 pb-16 md:px-8 md:pb-20 lg:pb-24"><div className="mx-auto grid max-w-6xl gap-7 border-y border-border bg-primary-soft px-5 py-10 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-10"><div><h2 className="text-2xl font-bold leading-[1.4] md:text-3xl">هل تحتاج إلى تطبيق هذه المعلومات على موقعك؟</h2><p className="mt-3 max-w-[58ch] leading-8 text-text-secondary">شارك نوع الموقع والأبعاد التقريبية، وسنساعدك في تحديد الخطوة المناسبة.</p></div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover" href="/contact">تواصل معنا<ArrowLeft aria-hidden="true" className="size-4" /></Link></div></section>
    </main>
  );
}
