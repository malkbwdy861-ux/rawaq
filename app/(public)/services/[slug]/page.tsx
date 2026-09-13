import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cmsContentPath, decodeCmsSlug } from "@/modules/cms/slugs";
import { HomeFaqAccordion } from "@/modules/pages/components/home-faq-accordion";
import { articleItem, ArticlesGrid, DetailContainer, DetailCta, EditorialText, EmptyMediaPattern, materialItem, MaterialsGrid, SectionHeader, type ArticleCardItem, type MaterialCardItem } from "@/modules/pages/components/detail-page-sections";
import { ProjectCard, type FeaturedProjectItem } from "@/modules/pages/components/featured-projects";
import { SolutionCard, type FeaturedSolutionItem } from "@/modules/pages/components/featured-solutions";
import { getPublishedServiceBySlug } from "@/modules/services/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { JsonLd } from "@/modules/seo/components/json-ld";
import { contentMetadata } from "@/modules/seo/metadata";
import { absoluteUrl } from "@/modules/seo/site-url";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

type ServicePageProps = { params: Promise<{ slug: string }> };

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
  const [service, settings] = await Promise.all([getPublishedServiceBySlug(slug), getSiteSettings()]);
  const version = service.publishedVersion;
  if (!version) notFound();

  const whatsappHref = settings ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText) : "/contact";
  const solutions = version.solutions.map((item) => solutionCard(item.solution.id, item.solution.publishedVersion)).filter(isSolutionCard).slice(0, 3);
  const materials = version.materials.map((item) => materialItem(item.material.id, item.material.publishedVersion)).filter(isMaterialCard).slice(0, 4);
  const projects = version.projects.map((item) => projectCard(item.project.id, item.project.publishedVersion)).filter(isProjectCard).slice(0, 3);
  const articles = version.articles.map((item) => articleItem(item.article.id, item.article.publishedVersion)).filter(isArticleCard).slice(0, 3);
  const faqs = version.faqs.map((item) => ({ id: item.faq.id, question: item.faq.publishedVersion?.question ?? null, answer: item.faq.publishedVersion?.answer ?? null })).slice(0, 6);

  return <main className="min-h-screen bg-background pb-14 md:pb-20">
    <article>
      <section className="relative isolate overflow-hidden px-4 pb-12 pt-8 md:px-8 md:pb-16 md:pt-12 lg:pb-20">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[64%] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary-soft)_38%,var(--background)),transparent)]" />
        <DetailContainer className="relative z-10 space-y-8">
          <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "الخدمات", href: "/services" }, { label: version.title ?? "خدمة", href: cmsContentPath("/services", slug) }]} />
          <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: version.title, description: version.shortDescription, url: absoluteUrl(cmsContentPath("/services", slug)), image: version.heroMedia?.url || undefined }} />
          <header className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="max-w-4xl space-y-5 lg:col-span-6">
              <p className="text-sm font-semibold text-clay-strong">خدمة تنفيذ</p>
              <h1 className="max-w-[13ch] text-[clamp(2.25rem,4.8vw,4.3rem)] font-bold leading-[1.22] text-pretty">{version.title}</h1>
              <p className="max-w-[56ch] text-lg leading-[1.85] text-text-secondary md:text-xl">{version.shortDescription}</p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover" href={whatsappHref}><MessageCircle aria-hidden="true" className="size-[18px]" />اطلب عرض سعر</a>
                <Link className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border border-border-strong bg-card px-5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft" href="/contact">تواصل مع الفريق<ArrowLeft aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" /></Link>
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-[22px] bg-primary-active shadow-[var(--shadow-project)] sm:min-h-[430px] lg:col-span-6">
              {version.heroMedia ? <Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1024px) 50vw, 100vw" src={version.heroMedia.url} /> : <EmptyMediaPattern label={version.title ?? "صورة الخدمة"} />}
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--foreground)_50%,transparent),transparent_58%)]" />
              <div className="absolute bottom-5 right-5 max-w-[22rem] rounded-[14px] bg-card/95 p-4 shadow-[var(--shadow-float)] backdrop-blur-sm">
                <p className="text-sm font-semibold text-primary">تنفيذ خارجي مضبوط</p>
                <p className="mt-1 text-sm leading-[1.75] text-text-secondary">نراجع الموقع، الاستخدام، والمواد قبل اقتراح طريقة التنفيذ.</p>
              </div>
            </div>
          </header>
        </DetailContainer>
      </section>

      <DetailContainer className="space-y-16 md:space-y-20">
        <section className="grid gap-7 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHeader eyebrow="عن الخدمة" title="ما الذي تشمل هذه الخدمة؟" /></div>
          <EditorialText className="lg:col-span-7 lg:col-start-6">{version.content}</EditorialText>
        </section>

        {solutions.length ? <section className="space-y-7"><SectionHeader eyebrow="حلول مناسبة" title="حلول مناسبة لهذه الخدمة" description="استخدامات ومساحات يمكن أن تستفيد من نفس طريقة التنفيذ." /><div className="grid max-w-6xl gap-4 md:grid-cols-3">{solutions.map((item, index) => <SolutionCard index={index} item={item} key={item.id} total={solutions.length} />)}</div></section> : null}
        {materials.length ? <section className="space-y-7 rounded-[22px] bg-muted p-5 md:p-8"><SectionHeader eyebrow="المواد" title="مواد وخيارات مرتبطة بالخدمة" /><MaterialsGrid items={materials} /></section> : null}
        {projects.length ? <section className="space-y-7"><SectionHeader eyebrow="إثبات التنفيذ" title="مشاريع نفذنا فيها هذه الخدمة" description="نماذج عملية توضح شكل الخدمة عند تطبيقها في مواقع حقيقية." align="split" action={<ViewAll href="/projects" />} /><div className="grid max-w-6xl gap-4 md:grid-cols-3">{projects.map((item) => <ProjectCard archive item={item} key={item.id} />)}</div></section> : null}
        {articles.length ? <section className="space-y-7"><SectionHeader eyebrow="دليل الخدمة" title="دليل ونصائح حول الخدمة" /><ArticlesGrid items={articles} /></section> : null}
        {faqs.some((item) => item.question && item.answer) ? <section className="grid gap-7 lg:grid-cols-12"><div className="lg:col-span-4"><SectionHeader eyebrow="الأسئلة" title="أسئلة شائعة قبل الطلب" /></div><div className="lg:col-span-7 lg:col-start-6"><HomeFaqAccordion items={faqs} /></div></section> : null}

        <DetailCta description="أرسل نوع الموقع والأبعاد التقريبية عبر واتساب، ونساعدك في اختيار طريقة تنفيذ واضحة." settings={settings} title="تحتاج هذه الخدمة لمشروعك؟" />
      </DetailContainer>
    </article>
  </main>;
}

function ViewAll({ href }: { href: string }) {
  return <Link className="group inline-flex min-h-11 items-center gap-2 rounded-[9px] border border-border-strong bg-card px-4 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft" href={href}>عرض الكل<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /></Link>;
}

function solutionCard(id: string, version: { title: string | null; slug: string | null; shortDescription: string | null; heroMedia: { url: string; altText: string | null } | null } | null): FeaturedSolutionItem | null {
  if (!version?.title || !version.slug || !version.shortDescription) return null;
  return { id, title: version.title, shortDescription: version.shortDescription, href: cmsContentPath("/solutions", version.slug), image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null };
}

function projectCard(id: string, version: { title: string | null; slug: string | null; shortDescription: string | null; city: string | null; district: string | null; coverMedia: { url: string; altText: string | null } | null; category: { name: string; iconKey: string; isActive: boolean } | null } | null): FeaturedProjectItem | null {
  if (!version?.title || !version.slug || !version.shortDescription) return null;
  const location = [version.city, version.district].filter(Boolean).join(" · ");
  return { id, title: version.title, shortDescription: version.shortDescription, href: cmsContentPath("/projects", version.slug), image: version.coverMedia ? { url: version.coverMedia.url, altText: version.coverMedia.altText || version.title } : null, ...(location ? { location } : {}), ...(version.category?.isActive ? { category: { name: version.category.name, iconKey: version.category.iconKey } } : {}) };
}

function isSolutionCard(item: FeaturedSolutionItem | null): item is FeaturedSolutionItem { return Boolean(item); }
function isMaterialCard(item: MaterialCardItem | null): item is MaterialCardItem { return Boolean(item); }
function isProjectCard(item: FeaturedProjectItem | null): item is FeaturedProjectItem { return Boolean(item); }
function isArticleCard(item: ArticleCardItem | null): item is ArticleCardItem { return Boolean(item); }
