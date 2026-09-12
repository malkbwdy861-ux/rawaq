import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cmsContentPath, decodeCmsSlug } from "@/modules/cms/slugs";
import { getPublishedProjectBySlug } from "@/modules/projects/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { contentMetadata } from "@/modules/seo/metadata";

type ProjectPageProps = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const project = await getPublishedProjectBySlug(slug);
  const version = project.publishedVersion;
  if (!version) notFound();
  return contentMetadata({ version, path: cmsContentPath("/projects", slug), title: version.title ?? "مشروع", description: version.shortDescription, image: version.coverMedia?.url });
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const project = await getPublishedProjectBySlug(slug);
  const version = project.publishedVersion;
  if (!version) notFound();
  const location = [version.city, version.district].filter(Boolean).join("، ");
  return <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-12 md:px-8 md:py-20">
    <article className="mx-auto max-w-7xl space-y-16">
      <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المشاريع", href: "/projects" }, { label: version.title ?? "مشروع", href: cmsContentPath("/projects", slug) }]} />
      <header className="grid gap-8 lg:grid-cols-12 lg:items-end"><div className="space-y-5 lg:col-span-7"><p className="text-sm font-semibold text-[oklch(58%_0.11_45)]">دراسة حالة</p><h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">{version.title}</h1><p className="max-w-[62ch] text-lg leading-[1.78] text-[oklch(42%_0.018_150)]">{version.shortDescription}</p></div>{location || version.completedAt ? <dl className="grid gap-4 border-y border-[oklch(82%_0.012_145)] py-5 lg:col-span-4 lg:col-start-9">{location ? <div><dt className="text-sm font-semibold text-[oklch(34%_0.065_42)]">الموقع</dt><dd className="mt-1 text-lg">{location}</dd></div> : null}{version.completedAt ? <div><dt className="text-sm font-semibold text-[oklch(34%_0.065_42)]">الإنجاز</dt><dd className="mt-1 text-lg tabular-nums">{version.completedAt.toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}</dd></div> : null}</dl> : null}</header>
      {version.coverMedia ? <figure><div className="relative aspect-[3/2] overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)]"><Image alt={version.coverMedia.altText ?? version.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1440px) 1280px, 100vw" src={version.coverMedia.url} /></div>{version.coverMedia.caption ? <figcaption className="mt-3 text-sm leading-[1.7] text-[oklch(42%_0.018_150)]">{version.coverMedia.caption}</figcaption> : null}</figure> : null}
      {version.content ? <ContentSection title="تفاصيل المشروع" content={version.content} /> : null}
      {(version.challenge || version.solutionSummary) ? <div className="grid gap-10 border-y border-[oklch(82%_0.012_145)] py-10 md:grid-cols-2"><ContentSection title="التحدي" content={version.challenge} plain /><ContentSection title="الحل المنفذ" content={version.solutionSummary} plain /></div> : null}
      {version.technicalDetails ? <ContentSection title="التفاصيل الفنية" content={version.technicalDetails} /> : null}
      {version.gallery.length ? <section className="space-y-8"><div className="max-w-2xl space-y-2"><p className="text-sm font-semibold text-[oklch(58%_0.11_45)]">سجل بصري</p><h2 className="text-3xl font-bold leading-[1.35] md:text-4xl">معرض المشروع</h2></div><div className="grid gap-8 md:grid-cols-2">{version.gallery.map((item, index) => <figure className={index % 3 === 0 ? "md:col-span-2" : ""} key={item.id}><div className={`relative overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)] ${index % 3 === 0 ? "aspect-[3/2]" : "aspect-[4/3]"}`}><Image alt={item.media.altText ?? item.caption ?? ""} className="object-cover" fill sizes={index % 3 === 0 ? "(min-width: 768px) 100vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} src={item.media.url} /></div>{item.caption || item.media.caption ? <figcaption className="mt-3 text-sm leading-[1.7] text-[oklch(42%_0.018_150)]">{item.caption ?? item.media.caption}</figcaption> : null}</figure>)}</div></section> : null}
      <RelatedSection title="الخدمات المرتبطة" items={version.services.map((item) => ({ label: item.service.publishedVersion?.title, slug: item.service.publishedVersion?.slug, prefix: "/services" }))} />
      <RelatedSection title="الحلول المرتبطة" items={version.solutions.map((item) => ({ label: item.solution.publishedVersion?.title, slug: item.solution.publishedVersion?.slug, prefix: "/solutions" }))} />
      <RelatedSection title="المواد المرتبطة" items={version.materials.map((item) => ({ label: item.material.publishedVersion?.name, slug: item.material.publishedVersion?.slug, prefix: "/materials" }))} />
      <RelatedSection title="أدلة مرتبطة" items={version.articles.map((item) => ({ label: item.article.publishedVersion?.title, slug: item.article.publishedVersion?.slug, prefix: "/guides" }))} />
    </article>
  </main>;
}

function ContentSection({ title, content, plain = false }: { title: string; content: string | null; plain?: boolean }) {
  if (!content) return null;
  return <section className={`max-w-[72ch] space-y-4 ${plain ? "" : "border-t border-[oklch(82%_0.012_145)] pt-8"}`}><h2 className="text-2xl font-bold leading-[1.4] md:text-3xl">{title}</h2><p className="whitespace-pre-line text-lg leading-[1.9] text-[oklch(42%_0.018_150)]">{content}</p></section>;
}

function RelatedSection({ title, items }: { title: string; items: { label: string | null | undefined; slug: string | null | undefined; prefix: string }[] }) {
  const visible = items.filter((item): item is { label: string; slug: string; prefix: string } => Boolean(item.label && item.slug));
  if (!visible.length) return null;
  return <section className="grid gap-6 border-t border-[oklch(82%_0.012_145)] pt-8 md:grid-cols-[280px_minmax(0,1fr)]"><h2 className="text-2xl font-bold leading-[1.4]">{title}</h2><ul className="grid gap-3">{visible.map((item) => <li key={`${item.prefix}/${item.slug}`}><Link className="inline-flex min-h-11 items-center text-lg font-semibold text-[oklch(37%_0.075_155)] underline" href={cmsContentPath(item.prefix, item.slug)}>{item.label}</Link></li>)}</ul></section>;
}
