import { AlertTriangle, ArrowLeft, Check, CircleDot, MessageCircle, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cmsContentPath, decodeCmsSlug } from "@/modules/cms/slugs";
import { getPublishedMaterialBySlug, jsonStringArray } from "@/modules/materials/queries";
import { HomeFaqAccordion } from "@/modules/pages/components/home-faq-accordion";
import { articleItem, ArticlesGrid, DetailContainer, DetailCta, EditorialText, EmptyMediaPattern, SectionHeader, type ArticleCardItem } from "@/modules/pages/components/detail-page-sections";
import { ProjectCard, type FeaturedProjectItem } from "@/modules/pages/components/featured-projects";
import { SolutionCard, type FeaturedSolutionItem } from "@/modules/pages/components/featured-solutions";
import { ServiceCard, type ServiceCardItem } from "@/modules/pages/components/service-card";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { contentMetadata } from "@/modules/seo/metadata";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

type MaterialPageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: MaterialPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const material = await getPublishedMaterialBySlug(slug);
  const version = material.publishedVersion;
  if (!version) notFound();

  return contentMetadata({ version, path: cmsContentPath("/materials", slug), title: version.name ?? "مادة", description: version.shortDescription, image: version.heroMedia?.url });
}

export default async function MaterialDetailPage({ params }: MaterialPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeCmsSlug(rawSlug);
  const [material, settings] = await Promise.all([getPublishedMaterialBySlug(slug), getSiteSettings()]);
  const version = material.publishedVersion;
  if (!version) notFound();

  const name = version.name ?? "مادة";
  const advantages = jsonStringArray(version.advantages);
  const limitations = jsonStringArray(version.limitations);
  const recommendedUses = jsonStringArray(version.recommendedUses);
  const services = version.services.map((item) => serviceCard(item.service.id, item.service.publishedVersion)).filter(isServiceCard).slice(0, 3);
  const solutions = version.solutions.map((item) => solutionCard(item.solution.id, item.solution.publishedVersion)).filter(isSolutionCard).slice(0, 3);
  const projects = version.projects.map((item) => projectCard(item.project.id, item.project.publishedVersion)).filter(isProjectCard).slice(0, 3);
  const articles = version.articles.map((item) => articleItem(item.article.id, item.article.publishedVersion)).filter(isArticleCard).slice(0, 3);
  const faqs = version.faqs.map((item) => ({ id: item.faq.id, question: item.faq.publishedVersion?.question ?? null, answer: item.faq.publishedVersion?.answer ?? null })).slice(0, 6);
  const whatsappHref = settings?.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, { material: name }) : "/contact";

  return (
    <main className="min-h-screen bg-background pb-14 md:pb-20">
      <article>
        <section className="relative isolate overflow-hidden px-4 pb-12 pt-8 md:px-8 md:pb-16 md:pt-12 lg:pb-20">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[68%] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary-soft)_38%,var(--background)),transparent)]" />
          <DetailContainer className="relative z-10 space-y-8">
            <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المواد", href: "/materials" }, { label: name, href: cmsContentPath("/materials", slug) }]} />
            <header className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="max-w-4xl space-y-5 lg:col-span-6">
                <p className="flex items-center gap-3 text-sm font-semibold text-clay-strong"><span aria-hidden="true" className="h-px w-9 bg-clay" />دليل مادة</p>
                <h1 className="max-w-[13ch] text-[clamp(2.25rem,4.8vw,4.3rem)] font-bold leading-[1.22] text-pretty">{name}</h1>
                {version.shortDescription ? <p className="max-w-[56ch] text-lg leading-[1.85] text-text-secondary md:text-xl">{version.shortDescription}</p> : null}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover" href={whatsappHref}><MessageCircle aria-hidden="true" className="size-[18px]" />اسأل عن هذه المادة</a>
                  <Link className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border border-border-strong bg-card px-5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft" href="/materials">قارن بمواد أخرى<ArrowLeft aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" /></Link>
                </div>
              </div>
              <div className="relative min-h-[320px] overflow-hidden rounded-[22px] bg-brand-secondary shadow-[var(--shadow-project)] sm:min-h-[430px] lg:col-span-6">
                {version.heroMedia ? <Image alt={version.heroMedia.altText ?? name} className="object-cover" fill priority sizes="(min-width: 1024px) 50vw, 100vw" src={version.heroMedia.url} /> : <EmptyMediaPattern label={`صورة ${name}`} />}
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklab,var(--foreground)_55%,transparent),transparent_60%)]" />
                <div className="absolute inset-x-5 bottom-5 border-t border-brand-secondary-foreground/35 pt-3 text-brand-secondary-foreground">
                  <p className="text-sm font-semibold">الاختيار يبدأ من ظروف الموقع</p>
                  <p className="mt-1 max-w-[42ch] text-sm leading-[1.75] text-brand-secondary-foreground/78">راجع المزايا والقيود والاستخدام المناسب قبل اعتماد المادة.</p>
                </div>
              </div>
            </header>
          </DetailContainer>
        </section>

        <DetailContainer className="space-y-16 md:space-y-20">
          {version.content ? <section className="grid gap-7 lg:grid-cols-12"><div className="lg:col-span-4"><SectionHeader eyebrow="عن المادة" title="ما الذي يميز هذه المادة؟" /></div><EditorialText className="lg:col-span-7 lg:col-start-6">{version.content}</EditorialText></section> : null}

          {advantages.length || limitations.length ? <FactsComparison advantages={advantages} limitations={limitations} /> : null}

          {recommendedUses.length || version.maintenanceNotes ? (
            <section className="relative isolate overflow-hidden rounded-[22px] bg-brand-secondary px-5 py-8 text-brand-secondary-foreground sm:px-8 md:px-10 md:py-11">
              <div aria-hidden="true" className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,color-mix(in_oklab,var(--brand-secondary-muted)_12%,transparent)_1px,transparent_1px)] [background-size:84px_84px]" />
              <div className="relative grid gap-10 lg:grid-cols-12">
                {recommendedUses.length ? <div className="lg:col-span-7"><p className="text-sm font-semibold text-brand-secondary-muted">الاستخدام العملي</p><h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.3]">أين تكون هذه المادة خيارًا مناسبًا؟</h2><ul className="mt-6 grid gap-3 sm:grid-cols-2">{recommendedUses.map((item) => <li className="flex gap-3 border-t border-brand-secondary-muted/25 pt-3 leading-[1.8] text-brand-secondary-muted" key={item}><CircleDot aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-clay" />{item}</li>)}</ul></div> : null}
                {version.maintenanceNotes ? <div className="lg:col-span-4 lg:col-start-9"><Wrench aria-hidden="true" className="size-6 text-clay" /><h2 className="mt-4 text-xl font-bold">العناية والصيانة</h2><p className="mt-3 whitespace-pre-line leading-[1.9] text-brand-secondary-muted">{version.maintenanceNotes}</p></div> : null}
              </div>
            </section>
          ) : null}

          {services.length ? <section className="space-y-7"><SectionHeader eyebrow="خدمات مرتبطة" title="خدمات تستخدم هذه المادة" description="طرق تنفيذ يمكن أن تعتمد على هذه المادة بحسب الموقع والمتطلبات." /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map((item, index) => <ServiceCard index={index} item={item} key={item.id} />)}</div></section> : null}
          {solutions.length ? <section className="space-y-7"><SectionHeader eyebrow="حلول مناسبة" title="حلول يمكن تنفيذها بهذه المادة" /><div className="grid gap-4 md:grid-cols-3">{solutions.map((item, index) => <SolutionCard index={index} item={item} key={item.id} total={solutions.length} />)}</div></section> : null}
          {projects.length ? <section className="space-y-7"><SectionHeader eyebrow="إثبات التنفيذ" title="مشاريع مرتبطة بهذه المادة" description="نماذج عملية تساعدك على فهم حضور المادة في التنفيذ." /><div className="grid gap-4 md:grid-cols-3">{projects.map((item) => <ProjectCard archive item={item} key={item.id} />)}</div></section> : null}
          {articles.length ? <section className="space-y-7"><SectionHeader eyebrow="للمقارنة والعناية" title="أدلة مرتبطة بالمادة" /><ArticlesGrid items={articles} /></section> : null}
          {faqs.some((item) => item.question && item.answer) ? <section className="grid gap-7 lg:grid-cols-12"><div className="lg:col-span-4"><SectionHeader eyebrow="الأسئلة" title="أسئلة شائعة عن المادة" /></div><div className="lg:col-span-7 lg:col-start-6"><HomeFaqAccordion items={faqs} /></div></section> : null}

          <DetailCta description="أرسل نوع الموقع والاستخدام والأبعاد التقريبية، ونساعدك في التحقق من ملاءمة المادة قبل التنفيذ." settings={settings} title={`هل ${name} مناسبة لمشروعك؟`} whatsappInput={{ material: name }} />
        </DetailContainer>
      </article>
    </main>
  );
}

function FactsComparison({ advantages, limitations }: { advantages: string[]; limitations: string[] }) {
  const hasBoth = Boolean(advantages.length && limitations.length);
  return (
    <section className="rounded-[22px] bg-muted px-5 py-8 sm:px-8 md:px-10 md:py-11">
      <SectionHeader eyebrow="قبل الاختيار" title="المزايا والقيود بوضوح" description="وازن بين نقاط القوة وحدود الاستخدام وفق احتياج الموقع، لا وفق الشكل وحده." />
      <div className={`mt-8 grid gap-8 ${hasBoth ? "md:grid-cols-2 md:gap-0" : "max-w-3xl"}`}>
        {advantages.length ? <FactColumn icon="advantage" items={advantages} title="المزايا" /> : null}
        {limitations.length ? <FactColumn divided={hasBoth} icon="limitation" items={limitations} title="القيود" /> : null}
      </div>
    </section>
  );
}

function FactColumn({ title, items, icon, divided = false }: { title: string; items: string[]; icon: "advantage" | "limitation"; divided?: boolean }) {
  return <div className={`md:px-7 ${divided ? "md:border-s md:border-border md:ps-8" : ""}`}><h3 className="flex items-center gap-3 text-xl font-bold">{icon === "advantage" ? <Check aria-hidden="true" className="size-5 text-primary" /> : <AlertTriangle aria-hidden="true" className="size-5 text-clay-strong" />}{title}</h3><ul className="mt-5 grid gap-3">{items.map((item) => <li className="flex gap-3 leading-[1.85] text-text-secondary" key={item}><span aria-hidden="true" className={`mt-[0.7rem] size-1.5 shrink-0 rounded-full ${icon === "advantage" ? "bg-primary" : "bg-clay"}`} />{item}</li>)}</ul></div>;
}

function serviceCard(id: string, version: { title: string | null; slug: string | null; shortDescription: string | null; heroMedia: { url: string; altText: string | null } | null } | null): ServiceCardItem | null {
  if (!version?.title || !version.slug || !version.shortDescription) return null;
  return { id, title: version.title, description: version.shortDescription, href: cmsContentPath("/services", version.slug), image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null };
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

function isServiceCard(item: ServiceCardItem | null): item is ServiceCardItem { return Boolean(item); }
function isSolutionCard(item: FeaturedSolutionItem | null): item is FeaturedSolutionItem { return Boolean(item); }
function isProjectCard(item: FeaturedProjectItem | null): item is FeaturedProjectItem { return Boolean(item); }
function isArticleCard(item: ArticleCardItem | null): item is ArticleCardItem { return Boolean(item); }
