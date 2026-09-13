import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { cmsContentPath, decodeCmsSlug } from "@/modules/cms/slugs";
import { articleItem, ArticlesGrid, DetailContainer, DetailCta, EditorialText, EmptyMediaPattern, materialItem, MaterialsGrid, metadataIcon, MetaPill, SectionHeader, type ArticleCardItem, type MaterialCardItem } from "@/modules/pages/components/detail-page-sections";
import { ServiceCard, type ServiceCardItem } from "@/modules/pages/components/service-card";
import { SolutionCard, type FeaturedSolutionItem } from "@/modules/pages/components/featured-solutions";
import { ProjectCategoryIcon } from "@/modules/project-categories/icons";
import { getPublishedProjectBySlug } from "@/modules/projects/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { contentMetadata } from "@/modules/seo/metadata";
import { getSiteSettings } from "@/modules/settings/queries";

type ProjectPageProps = { params: Promise<{ slug: string }> };
export const revalidate = 300;

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
  const [project, settings] = await Promise.all([getPublishedProjectBySlug(slug), getSiteSettings()]);
  const version = project.publishedVersion;
  if (!version) notFound();

  const location = [version.city, version.district].filter(Boolean).join("، ");
  const completed = version.completedAt ? version.completedAt.toLocaleDateString("ar-SA", { year: "numeric", month: "long" }) : null;
  const services = version.services.map((item) => serviceCard(item.service.id, item.service.publishedVersion)).filter(isServiceCard).slice(0, 3);
  const solutions = version.solutions.map((item) => solutionCard(item.solution.id, item.solution.publishedVersion)).filter(isSolutionCard).slice(0, 3);
  const materials = version.materials.map((item) => materialItem(item.material.id, item.material.publishedVersion)).filter(isMaterialCard).slice(0, 4);
  const articles = version.articles.map((item) => articleItem(item.article.id, item.article.publishedVersion)).filter(isArticleCard).slice(0, 3);

  return <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] pb-14 md:pb-20">
    <article>
      <section className="relative isolate overflow-hidden px-4 pb-10 pt-8 md:px-8 md:pb-14 md:pt-12 lg:pb-16">
        <DetailContainer className="space-y-8">
          <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المشاريع", href: "/projects" }, { label: version.title ?? "مشروع", href: cmsContentPath("/projects", slug) }]} />
          <header className="grid gap-7 lg:grid-cols-12 lg:items-end">
            <div className="max-w-4xl space-y-5 lg:col-span-8">
              {version.category?.isActive ? <p className="inline-flex items-center gap-2 text-sm font-semibold text-clay-strong"><ProjectCategoryIcon className="size-4" iconKey={version.category.iconKey} />{version.category.name}</p> : <p className="text-sm font-semibold text-clay-strong">دراسة حالة</p>}
              <h1 className="max-w-[14ch] text-[clamp(2.25rem,5vw,4.6rem)] font-bold leading-[1.22] text-pretty">{version.title}</h1>
              <p className="max-w-[62ch] text-lg leading-[1.85] text-text-secondary md:text-xl">{version.shortDescription}</p>
            </div>
            {(location || completed) ? <dl className="grid gap-3 lg:col-span-4">
              {location ? <MetaPill icon={metadataIcon("location")} label="الموقع" value={location} /> : null}
              {completed ? <MetaPill icon={metadataIcon("date")} label="تاريخ الإنجاز" value={completed} /> : null}
            </dl> : null}
          </header>
          <figure>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-primary-active shadow-[var(--shadow-project)] md:aspect-[16/8]">
              {version.coverMedia ? <Image alt={version.coverMedia.altText ?? version.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1440px) 1280px, 100vw" src={version.coverMedia.url} /> : <EmptyMediaPattern label={version.title ?? "صورة المشروع"} />}
            </div>
            {version.coverMedia?.caption ? <figcaption className="mt-3 max-w-[72ch] text-sm leading-[1.75] text-text-secondary">{version.coverMedia.caption}</figcaption> : null}
          </figure>
        </DetailContainer>
      </section>

      <DetailContainer className="space-y-16 md:space-y-20">
        <section className="grid gap-7 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHeader eyebrow="نظرة عامة" title="قصة المشروع والتنفيذ" /></div>
          <EditorialText className="lg:col-span-7 lg:col-start-6">{version.content}</EditorialText>
        </section>

        {(version.challenge || version.solutionSummary) ? <section className="grid gap-5 md:grid-cols-2">
          {version.challenge ? <CasePanel number="01" title="التحدي" content={version.challenge} /> : null}
          {version.solutionSummary ? <CasePanel number="02" title="الحل المنفذ" content={version.solutionSummary} highlighted /> : null}
        </section> : null}

        {version.technicalDetails ? <section className="relative isolate overflow-hidden rounded-[18px] bg-primary-active p-5 text-primary-foreground md:p-8 lg:p-10">
          <div aria-hidden="true" className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,color-mix(in_oklch,var(--primary-soft)_13%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_oklch,var(--primary-soft)_10%,transparent)_1px,transparent_1px)] [background-size:56px_56px]" />
          <div className="relative z-10 grid gap-7 lg:grid-cols-12">
            <div className="lg:col-span-4"><SectionHeader eyebrow="تفاصيل فنية" title="ما الذي صنع الفارق؟" /></div>
            <EditorialText dark className="lg:col-span-7 lg:col-start-6">{version.technicalDetails}</EditorialText>
          </div>
        </section> : null}

        {version.gallery.length ? <ProjectGallery title={version.title ?? "المشروع"} items={version.gallery} /> : null}

        {services.length ? <section className="space-y-7"><SectionHeader eyebrow="الخدمات" title="خدمات ساهمت في تنفيذ المشروع" align="split" action={<ViewAll href="/services" />} /><div className="grid max-w-6xl gap-4 md:grid-cols-3">{services.map((item, index) => <ServiceCard className="min-h-[300px]" index={index} item={item} key={item.id} />)}</div></section> : null}
        {solutions.length ? <section className="space-y-7"><SectionHeader eyebrow="الحلول" title="حلول مرتبطة بنفس الاحتياج" description="اقتراحات تساعدك على فهم الخيارات القريبة من هذا النوع من التنفيذ." /><div className="grid max-w-6xl gap-4 md:grid-cols-3">{solutions.map((item, index) => <SolutionCard index={index} item={item} key={item.id} total={solutions.length} />)}</div></section> : null}
        {materials.length ? <section className="space-y-7"><SectionHeader eyebrow="المواد" title="مواد وخيارات مستخدمة أو مناسبة" /><MaterialsGrid items={materials} /></section> : null}
        {articles.length ? <section className="space-y-7"><SectionHeader eyebrow="الأدلة" title="مقالات تساعدك على فهم تفاصيل مشابهة" /><ArticlesGrid items={articles} /></section> : null}

        <DetailCta description="شاركنا صور الموقع والأبعاد التقريبية، ونقترح طريقة تنفيذ مناسبة قبل بدء العمل." settings={settings} title="هل لديك مشروع مشابه؟" />
      </DetailContainer>
    </article>
  </main>;
}

function CasePanel({ number, title, content, highlighted = false }: { number: string; title: string; content: string; highlighted?: boolean }) {
  return <section className={`rounded-[18px] p-6 md:p-8 ${highlighted ? "bg-accent" : "bg-card"}`}>
    <p className="text-sm font-semibold text-clay-strong" dir="ltr">{number}</p>
    <h2 className="mt-3 text-2xl font-bold leading-[1.35]">{title}</h2>
    <EditorialText className="mt-3 text-base md:text-[1.0625rem]">{content}</EditorialText>
  </section>;
}

function ProjectGallery({ title, items }: { title: string; items: { id: string; caption: string | null; media: { url: string; altText: string | null; caption: string | null } }[] }) {
  return <section className="space-y-7">
    <SectionHeader eyebrow="سجل بصري" title="معرض المشروع" description="لقطات من التنفيذ توضح النسب، المواد، وطريقة حضور الظل في الموقع." />
    <div className="grid gap-4 md:grid-cols-4 md:auto-rows-[230px] lg:auto-rows-[260px]">
      {items.slice(0, 7).map((item, index) => <figure className={`${index === 0 ? "md:col-span-2 md:row-span-2" : index === 3 ? "md:col-span-2" : ""}`} key={item.id}>
        <Link className="group block h-full" href={item.media.url} target="_blank">
          <div className="relative h-full min-h-[230px] overflow-hidden rounded-[14px] bg-accent shadow-[var(--shadow-rest)]">
            <Image alt={item.media.altText ?? item.caption ?? title} className="object-cover transition-transform duration-300 group-hover:scale-[1.025]" fill sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"} src={item.media.url} />
          </div>
        </Link>
        {item.caption || item.media.caption ? <figcaption className="mt-2 text-sm leading-[1.7] text-text-secondary">{item.caption ?? item.media.caption}</figcaption> : null}
      </figure>)}
    </div>
  </section>;
}

function ViewAll({ href }: { href: string }) {
  return <Link className="group inline-flex min-h-11 items-center gap-2 rounded-[9px] border border-border-strong bg-card px-4 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft" href={href}>عرض الكل<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /></Link>;
}

function serviceCard(id: string, version: { title: string | null; slug: string | null; shortDescription: string | null; heroMedia: { url: string; altText: string | null } | null } | null): ServiceCardItem | null {
  if (!version?.title || !version.slug || !version.shortDescription) return null;
  return { id, title: version.title, description: version.shortDescription, href: cmsContentPath("/services", version.slug), image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null };
}

function solutionCard(id: string, version: { title: string | null; slug: string | null; shortDescription: string | null; heroMedia: { url: string; altText: string | null } | null } | null): FeaturedSolutionItem | null {
  if (!version?.title || !version.slug || !version.shortDescription) return null;
  return { id, title: version.title, shortDescription: version.shortDescription, href: cmsContentPath("/solutions", version.slug), image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null };
}

function isServiceCard(item: ServiceCardItem | null): item is ServiceCardItem { return Boolean(item); }
function isSolutionCard(item: FeaturedSolutionItem | null): item is FeaturedSolutionItem { return Boolean(item); }
function isMaterialCard(item: MaterialCardItem | null): item is MaterialCardItem { return Boolean(item); }
function isArticleCard(item: ArticleCardItem | null): item is ArticleCardItem { return Boolean(item); }
