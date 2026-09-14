import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cmsContentPath, decodeCmsSlug } from "@/modules/cms/slugs";
import { HomeFaqAccordion } from "@/modules/pages/components/home-faq-accordion";
import { articleItem, ArticlesGrid, DetailContainer, DetailCta, EditorialText, EmptyMediaPattern, materialItem, MaterialsGrid, SectionHeader, type ArticleCardItem, type MaterialCardItem } from "@/modules/pages/components/detail-page-sections";
import { ProjectCard, type FeaturedProjectItem } from "@/modules/pages/components/featured-projects";
import { ServiceCard, type ServiceCardItem } from "@/modules/pages/components/service-card";
import { getPublishedSolutionBySlug } from "@/modules/solutions/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { contentMetadata } from "@/modules/seo/metadata";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

type SolutionPageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: SolutionPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const solution = await getPublishedSolutionBySlug(slug);
  const version = solution.publishedVersion;
  if (!version) notFound();
  return contentMetadata({ version, path: cmsContentPath("/solutions", slug), title: version.title ?? "حل", description: version.shortDescription, image: version.heroMedia?.url });
}

export default async function SolutionDetailPage({ params }: SolutionPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const [solution, settings] = await Promise.all([getPublishedSolutionBySlug(slug), getSiteSettings()]);
  const version = solution.publishedVersion;
  if (!version) notFound();

  const whatsappHref = settings ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText) : "/contact";
  const services = version.services.map((item) => serviceCard(item.service.id, item.service.publishedVersion)).filter(isServiceCard).slice(0, 3);
  const materials = version.materials.map((item) => materialItem(item.material.id, item.material.publishedVersion)).filter(isMaterialCard).slice(0, 4);
  const projects = version.projects.map((item) => projectCard(item.project.id, item.project.publishedVersion)).filter(isProjectCard).slice(0, 3);
  const articles = version.articles.map((item) => articleItem(item.article.id, item.article.publishedVersion)).filter(isArticleCard).slice(0, 3);
  const faqs = version.faqs.map((item) => ({ id: item.faq.id, question: item.faq.publishedVersion?.question ?? null, answer: item.faq.publishedVersion?.answer ?? null })).slice(0, 6);

  return <main className="min-h-screen bg-background pb-14 md:pb-20">
    <article>
      <section className="relative isolate overflow-hidden bg-brand-secondary px-4 pb-10 pt-8 text-brand-secondary-foreground md:px-8 md:pb-16 md:pt-12 lg:pb-20">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_4%_8%,color-mix(in_oklab,var(--primary)_58%,transparent),transparent_65%),linear-gradient(135deg,color-mix(in_oklab,var(--primary)_24%,var(--brand-secondary)),var(--brand-secondary))]" />
        <DetailContainer className="relative z-10 space-y-8">
          <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "الحلول", href: "/solutions" }, { label: version.title ?? "حل", href: cmsContentPath("/solutions", slug) }]} />
          <header className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="max-w-4xl space-y-5 lg:col-span-7">
              <p className="text-sm font-semibold text-brand-secondary-muted">حل عملي للمساحة</p>
              <h1 className="max-w-[14ch] text-[clamp(2.25rem,5vw,4.45rem)] font-bold leading-[1.22] text-pretty">{version.title}</h1>
              <p className="max-w-[58ch] text-lg leading-[1.9] text-brand-secondary-muted md:text-xl">{version.shortDescription}</p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active" href={whatsappHref}><MessageCircle aria-hidden="true" className="size-[18px]" />اسأل عن هذا الحل</a>
                <Link className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border border-brand-secondary-muted/45 px-5 text-sm font-semibold text-brand-secondary-foreground transition-colors hover:border-brand-secondary-muted hover:bg-brand-secondary-foreground/10" href="/projects">شاهد تطبيقات مشابهة<ArrowLeft aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" /></Link>
              </div>
            </div>
            <figure className="lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-primary shadow-[var(--shadow-project)] lg:rotate-1">
                {version.heroMedia ? <Image alt={version.heroMedia.altText ?? version.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1024px) 42vw, 100vw" src={version.heroMedia.url} /> : <EmptyMediaPattern label={version.title ?? "صورة الحل"} />}
              </div>
              {version.heroMedia?.caption ? <figcaption className="mt-3 text-sm leading-[1.7] text-brand-secondary-muted/75">{version.heroMedia.caption}</figcaption> : null}
            </figure>
          </header>
        </DetailContainer>
      </section>

      <DetailContainer className="space-y-16 pt-14 md:space-y-20 md:pt-20">
        <section className="grid gap-7 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4"><SectionHeader eyebrow="الموقف والحل" title="ما المشكلة التي يعالجها هذا الحل؟" /></div>
          <div className="lg:col-span-7 lg:col-start-6">
            <EditorialText>{version.content}</EditorialText>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <MiniProof title="اختيار مناسب" text="نوازن بين الاستخدام اليومي، اتجاه الشمس، ومتطلبات الخصوصية قبل التنفيذ." />
              <MiniProof title="تنفيذ قابل للقياس" text="يترجم الحل إلى خدمة ومواد وموقع تنفيذ واضح بدل توصية عامة." />
            </div>
          </div>
        </section>

        {services.length ? <section className="space-y-7"><SectionHeader eyebrow="الخدمات" title="الخدمات المستخدمة لتنفيذ هذا الحل" description="الخدمات التي تحول الفكرة إلى تنفيذ فعلي في الموقع." /><div className="grid max-w-6xl gap-4 md:grid-cols-3">{services.map((item, index) => <ServiceCard className="min-h-[300px]" index={index} item={item} key={item.id} />)}</div></section> : null}
        {materials.length ? <section className="space-y-7"><SectionHeader eyebrow="المواد" title="المواد والخيارات المتاحة" /><MaterialsGrid items={materials} /></section> : null}
        {projects.length ? <section className="space-y-7 rounded-[22px] bg-muted p-5 md:p-8"><SectionHeader eyebrow="مشاريع" title="مشاريع طبّقنا فيها هذا الحل" description="دليل بصري على طريقة ظهور الحل عند تنفيذه في مساحات حقيقية." align="split" action={<ViewAll href="/projects" />} /><div className="grid max-w-6xl gap-4 md:grid-cols-3">{projects.map((item) => <ProjectCard archive item={item} key={item.id} />)}</div></section> : null}
        {articles.length ? <section className="space-y-7"><SectionHeader eyebrow="الأدلة" title="مقالات تساعدك على اختيار الحل المناسب" /><ArticlesGrid items={articles} /></section> : null}
        {faqs.some((item) => item.question && item.answer) ? <section className="grid gap-7 lg:grid-cols-12"><div className="lg:col-span-4"><SectionHeader eyebrow="الأسئلة" title="أسئلة شائعة حول الحل" /></div><div className="lg:col-span-7 lg:col-start-6"><HomeFaqAccordion items={faqs} /></div></section> : null}

        <DetailCta description="شاركنا تفاصيل الموقع وسنساعدك في اختيار التنفيذ المناسب." settings={settings} title="هل هذا الحل مناسب لمساحتك؟" />
      </DetailContainer>
    </article>
  </main>;
}

function MiniProof({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[14px] bg-accent p-5"><h2 className="text-base font-bold leading-[1.5]">{title}</h2><p className="mt-2 text-sm leading-[1.8] text-text-secondary">{text}</p></div>;
}

function ViewAll({ href }: { href: string }) {
  return <Link className="group inline-flex min-h-11 items-center gap-2 rounded-[9px] border border-border-strong bg-card px-4 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft" href={href}>عرض الكل<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /></Link>;
}

function serviceCard(id: string, version: { title: string | null; slug: string | null; shortDescription: string | null; heroMedia: { url: string; altText: string | null } | null } | null): ServiceCardItem | null {
  if (!version?.title || !version.slug || !version.shortDescription) return null;
  return { id, title: version.title, description: version.shortDescription, href: cmsContentPath("/services", version.slug), image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null };
}

function projectCard(id: string, version: { title: string | null; slug: string | null; shortDescription: string | null; city: string | null; district: string | null; coverMedia: { url: string; altText: string | null } | null; category: { name: string; iconKey: string; isActive: boolean } | null } | null): FeaturedProjectItem | null {
  if (!version?.title || !version.slug || !version.shortDescription) return null;
  const location = [version.city, version.district].filter(Boolean).join(" · ");
  return { id, title: version.title, shortDescription: version.shortDescription, href: cmsContentPath("/projects", version.slug), image: version.coverMedia ? { url: version.coverMedia.url, altText: version.coverMedia.altText || version.title } : null, ...(location ? { location } : {}), ...(version.category?.isActive ? { category: { name: version.category.name, iconKey: version.category.iconKey } } : {}) };
}

function isMaterialCard(item: MaterialCardItem | null): item is MaterialCardItem { return Boolean(item); }
function isServiceCard(item: ServiceCardItem | null): item is ServiceCardItem { return Boolean(item); }
function isProjectCard(item: FeaturedProjectItem | null): item is FeaturedProjectItem { return Boolean(item); }
function isArticleCard(item: ArticleCardItem | null): item is ArticleCardItem { return Boolean(item); }
