import {
  ArrowLeft,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  PencilRuler,
  Phone,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Sun,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { FaqList } from "@/modules/faqs/components/faq-list";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { JsonLd } from "@/modules/seo/components/json-ld";
import { buildWhatsAppUrl, digitsOnly, phoneHref } from "@/modules/settings/contact";
import { ContactWhatsappForm } from "@/modules/settings/components/contact-whatsapp-form";
import { WhatsappQuickDialog } from "@/modules/settings/components/whatsapp-quick-dialog";

import type { AboutPageData, ContactPageData, ListingPageData, PricesPageData } from "../validation";
import { ArchivePageHero } from "./archive-page-hero";
import { ArchivePageIntro } from "./archive-page-intro";
import type { ResolvedPageData } from "./public-page";

type StaticPageKey = "ABOUT" | "CONTACT" | "PRICES" | "PROJECTS" | "SERVICES" | "SOLUTIONS";
type StaticData = AboutPageData | ContactPageData | PricesPageData | ListingPageData;
type Entity = ResolvedPageData["articles"][number];

const valueIcons = {
  location: MapPin,
  shield: ShieldCheck,
  team: UsersRound,
  settings: Settings2,
  climate: Sun,
  design: PencilRuler,
};

export function StaticPublicPage({ pageKey, data, resolved, preview }: { pageKey: StaticPageKey; data: StaticData; resolved: ResolvedPageData; preview: boolean }) {
  return <>
    {pageKey === "ABOUT" ? <AboutPageContent data={data as AboutPageData} resolved={resolved} /> : null}
    {pageKey === "CONTACT" ? <ContactPageContent data={data as ContactPageData} resolved={resolved} /> : null}
    {pageKey === "PRICES" ? <PricesPageContent data={data as PricesPageData} preview={preview} resolved={resolved} /> : null}
    {pageKey === "PROJECTS" || pageKey === "SERVICES" || pageKey === "SOLUTIONS" ? <ListingPagePreview data={data as ListingPageData} pageKey={pageKey} resolved={resolved} /> : null}
  </>;
}

function ListingPagePreview({ data, pageKey, resolved }: { data: ListingPageData; pageKey: "PROJECTS" | "SERVICES" | "SOLUTIONS"; resolved: ResolvedPageData }) {
  const paths = { PROJECTS: "/projects", SERVICES: "/services", SOLUTIONS: "/solutions" } as const;
  return <><ArchivePageHero currentHref={paths[pageKey]} currentLabel={data.hero.eyebrow || "صفحة القائمة"} description={data.hero.shortDescription || ""} eyebrow={data.hero.eyebrow || ""} image={resolved.heroMedia ? { url: resolved.heroMedia.url, altText: data.hero.imageAlt || resolved.heroMedia.altText || data.hero.pageTitle || "" } : null} title={data.hero.pageTitle || ""} />{pageKey !== "PROJECTS" ? <ArchivePageIntro description={data.intro.description || ""} /> : null}</>;
}

function AboutPageContent({ data, resolved }: { data: AboutPageData; resolved: ResolvedPageData }) {
  const values = data.values.items.filter((item) => item.title || item.description).slice(0, 4);

  return <>
    <section className="relative overflow-hidden border-b border-border bg-muted px-4 pb-16 pt-9 md:px-8 md:pb-20 md:pt-12">
      <ArchitecturalGrid />
      <div className="relative mx-auto max-w-7xl">
        <PageBreadcrumb current="من نحن" />
        <div className="mt-9 grid items-center gap-9 lg:grid-cols-12 lg:gap-12">
          <header className="lg:col-span-5">
            <Eyebrow>عن مظلات جدة</Eyebrow>
            <h1 className="mt-4 max-w-[620px] text-[clamp(2.35rem,4.7vw,3.6rem)] font-bold leading-[1.2] text-pretty">{data.hero.title}</h1>
            <p className="mt-5 max-w-[54ch] text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-[1.8] text-text-secondary">{data.hero.description}</p>
            <Link className="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-[9px] border border-border-strong bg-card px-5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft" href="/contact">تحدث معنا عن مشروعك<ArrowLeft aria-hidden="true" className="size-[18px] transition-transform duration-300 group-hover:-translate-x-1" /></Link>
          </header>
          {resolved.heroMedia ? <figure className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-surface-raised lg:col-span-7 lg:aspect-[16/10]">
            <Image alt={resolved.heroMedia.altText ?? data.hero.title ?? ""} className="object-cover" fill priority sizes="(min-width: 1024px) 58vw, 100vw" src={resolved.heroMedia.url} />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--primary-active)_30%,transparent),transparent_48%)]" />
            <figcaption className="absolute bottom-4 start-4 rounded-[9px] bg-primary-active px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-rest)] sm:bottom-5 sm:start-5">حلول تنفذ بعناية لتدوم</figcaption>
          </figure> : null}
        </div>
      </div>
    </section>

    <section className="px-4 py-16 md:px-8 md:py-20 lg:py-24" aria-labelledby="about-story-title">
      <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-12 lg:gap-12">
        <header className="lg:col-span-4"><Eyebrow>قصتنا</Eyebrow><h2 className="mt-4 text-[clamp(1.85rem,3vw,2.5rem)] font-bold leading-[1.35]" id="about-story-title">{data.companyStory.title}</h2></header>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="max-w-[65ch] whitespace-pre-line text-[1.0625rem] leading-[1.9] text-text-secondary md:text-lg">{data.companyStory.content}</p>
          {data.capabilities.content ? <div className="mt-9 border-t border-border pt-7"><h3 className="text-xl font-semibold leading-[1.5]">{data.capabilities.title}</h3><p className="mt-3 max-w-[65ch] whitespace-pre-line leading-[1.85] text-text-secondary">{data.capabilities.content}</p></div> : null}
        </div>
      </div>
    </section>

    {values.length ? <section className="border-y border-border bg-muted px-4 py-12 md:px-8 md:py-14" aria-labelledby="about-values-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><h2 className="text-[clamp(1.65rem,2.5vw,2.125rem)] font-bold" id="about-values-title">{data.values.title}</h2><p className="text-sm text-text-secondary">مبادئ حاضرة في كل مرحلة من العمل</p></div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-[12px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">{values.map((item, index) => {
          const fallbackIcons = [ShieldCheck, UsersRound, Settings2, PencilRuler];
          const Icon = item.icon ? valueIcons[item.icon] : fallbackIcons[index % fallbackIcons.length];
          return <article className="bg-card p-5" key={`${item.title}-${index}`}><span className="grid size-10 place-items-center rounded-[9px] bg-primary-soft text-primary"><Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.7} /></span><h3 className="mt-4 text-lg font-semibold">{item.title}</h3>{item.description ? <p className="mt-2 text-sm leading-[1.75] text-text-secondary">{item.description}</p> : null}</article>;
        })}</div>
      </div>
    </section> : null}
    <FinalCta {...data.finalCta} />
  </>;
}

function ContactPageContent({ data, resolved }: { data: ContactPageData; resolved: ResolvedPageData }) {
  const settings = resolved.settings;
  const contactOptions = {
    services: resolved.services.map((item) => ({ id: item.id, label: item.publishedVersion?.title })).filter((item): item is { id: string; label: string } => Boolean(item.label)),
    solutions: resolved.solutions.map((item) => ({ id: item.id, label: item.publishedVersion?.title })).filter((item): item is { id: string; label: string } => Boolean(item.label)),
    materials: resolved.materials.map((item) => ({ id: item.id, label: item.publishedVersion?.name })).filter((item): item is { id: string; label: string } => Boolean(item.label)),
  };

  return <>
    <PageIntro eyebrow="تواصل مباشر" title={data.hero.title} description={data.hero.description} current="التواصل" />
    <section className="px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4"><Eyebrow>بيانات التواصل</Eyebrow><h2 className="mt-4 text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-[1.35]">{data.contactIntro.title}</h2>{data.contactIntro.description ? <p className="mt-4 max-w-[44ch] leading-[1.85] text-text-secondary">{data.contactIntro.description}</p> : null}{settings && data.showWhatsapp ? <div className="mt-7"><WhatsappQuickDialog whatsappNumber={settings.whatsappNumber} defaultMessage={settings.defaultWhatsappText} /></div> : null}</div>
        <div className="min-w-0 lg:col-span-8"><dl className="grid gap-3 sm:grid-cols-2">{settings && data.showWhatsapp ? <ContactCard term="واتساب" value={settings.whatsappNumber} href={buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText)} /> : null}{settings && data.showPhone ? <ContactCard term={settings.defaultCtaText || "الهاتف"} value={settings.primaryPhone} href={phoneHref(settings.primaryPhone)} /> : null}{settings && data.showPhone && settings.secondaryPhone ? <ContactCard term="هاتف ثانوي" value={settings.secondaryPhone} href={phoneHref(settings.secondaryPhone)} /> : null}{settings && data.showEmail && settings.email ? <ContactCard term="البريد الإلكتروني" value={settings.email} href={`mailto:${settings.email}`} /> : null}{settings && data.showAddress && settings.address ? <ContactCard term="العنوان" value={settings.address} /> : null}{settings && data.showBusinessHours && settings.businessHours ? <ContactCard term="ساعات العمل" value={settings.businessHours} /> : null}</dl></div>
        {settings && data.showWhatsapp && digitsOnly(settings.whatsappNumber) ? <div className="lg:col-span-8 lg:col-start-5"><ContactWhatsappForm whatsappNumber={settings.whatsappNumber} defaultMessage={settings.defaultWhatsappText} {...contactOptions} /></div> : null}
      </div>
    </section>
    {data.finalCta.title ? <section className="border-t border-border bg-muted px-4 py-10 md:px-8"><div className="mx-auto max-w-7xl"><h2 className="text-xl font-bold">{data.finalCta.title}</h2>{data.finalCta.description ? <p className="mt-2 max-w-[60ch] leading-[1.8] text-text-secondary">{data.finalCta.description}</p> : null}</div></section> : null}
  </>;
}

function PricesPageContent({ data, resolved, preview }: { data: PricesPageData; resolved: ResolvedPageData; preview: boolean }) {
  const articles = ordered(data.selectedPricingArticleIds, resolved.articles);
  const faqs = faqItems(data.faqSection.selectedFaqIds, resolved.faqs, preview);

  return <>
    <PageIntro eyebrow="مركز الأسعار" title={data.hero.title} description={data.hero.description} current="الأسعار" />
    <section className="px-4 py-14 md:px-8 md:py-20"><div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-12 md:gap-10"><h2 className="text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-[1.35] md:col-span-4">{data.intro.title}</h2><p className="max-w-[65ch] whitespace-pre-line text-[1.0625rem] leading-[1.9] text-text-secondary md:col-span-7 md:col-start-6 md:text-lg">{data.intro.content}</p></div></section>
    {data.pricingFactors.items.length ? <section className="border-y border-border bg-muted px-4 py-12 md:px-8 md:py-16" aria-labelledby="pricing-factors-title"><div className="mx-auto max-w-7xl"><div className="flex items-center gap-3"><Settings2 aria-hidden="true" className="size-5 text-clay-strong" strokeWidth={1.7} /><h2 className="text-[clamp(1.6rem,2.6vw,2.125rem)] font-bold" id="pricing-factors-title">{data.pricingFactors.title}</h2></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.pricingFactors.items.map((item, index) => <article className="flex min-h-[180px] flex-col rounded-[12px] border border-border bg-card p-5 transition-colors duration-150 hover:border-border-strong" key={`${item.title}-${index}`}><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-[9px] bg-primary-soft text-primary"><ReceiptText aria-hidden="true" className="size-4" strokeWidth={1.7} /></span><span className="text-xs font-semibold tabular-nums text-clay-strong" dir="ltr">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-5 text-lg font-semibold leading-[1.5]">{item.title}</h3>{item.description ? <p className="mt-2 text-sm leading-[1.75] text-text-secondary">{item.description}</p> : null}</article>)}</div></div></section> : null}
    <PricingGuides items={articles} preview={preview} />
    {faqs.length ? <section className="px-4 py-14 md:px-8 md:py-20"><div className="mx-auto max-w-4xl"><Eyebrow>قبل طلب العرض</Eyebrow><h2 className="mb-7 mt-4 text-[clamp(1.75rem,3vw,2.4rem)] font-bold">أسئلة الأسعار</h2><FaqList items={faqs} /></div></section> : null}
    {!preview && faqs.length ? <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.flatMap((item) => item.question && item.answer ? [{ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } }] : []) }} /> : null}
    <FinalCta {...data.finalCta} />
  </>;
}

function PageIntro({ eyebrow, title, description, current }: { eyebrow: string; title?: string; description?: string; current: string }) {
  return <section className="relative overflow-hidden border-b border-border bg-muted px-4 pb-14 pt-9 md:px-8 md:pb-20 md:pt-12"><ArchitecturalGrid /><div className="relative mx-auto max-w-7xl"><PageBreadcrumb current={current} /><header className="mt-9 max-w-3xl"><Eyebrow>{eyebrow}</Eyebrow><h1 className="mt-4 text-[clamp(2.35rem,4.7vw,3.6rem)] font-bold leading-[1.2] text-pretty">{title}</h1>{description ? <p className="mt-5 max-w-[60ch] text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-[1.8] text-text-secondary">{description}</p> : null}</header></div></section>;
}

function ArchitecturalGrid() { return <div aria-hidden="true" className="absolute inset-y-0 start-0 hidden w-[32%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_47px,var(--border)_48px)] opacity-50 lg:block" />; }
function Eyebrow({ children }: { children: string }) { return <p className="flex items-center gap-3 text-sm font-semibold text-clay-strong before:h-px before:w-9 before:bg-clay">{children}</p>; }
function PageBreadcrumb({ current }: { current: string }) { const paths: Record<string, string> = { "من نحن": "/about", "التواصل": "/contact", "الأسعار": "/prices" }; return <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: current, href: paths[current] ?? "/" }]} />; }

function ContactCard({ term, value, href }: { term: string; value: string; href?: string }) {
  const Icon = term === "واتساب" ? MessageCircle : term.includes("هاتف") || term === "الهاتف" ? Phone : term === "البريد الإلكتروني" ? Mail : term === "العنوان" ? MapPin : Clock3;
  const ltr = term !== "العنوان" && term !== "ساعات العمل";
  return <div className="flex min-h-[112px] gap-4 rounded-[12px] border border-border bg-card p-4.5"><span className="grid size-10 shrink-0 place-items-center rounded-[9px] bg-primary-soft text-primary"><Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.7} /></span><div className="min-w-0"><dt className="text-sm font-semibold text-foreground">{term}</dt><dd className="mt-2 whitespace-pre-line break-words text-sm leading-[1.7] text-text-secondary" dir={ltr ? "ltr" : undefined}>{href ? <a className="font-semibold text-primary underline decoration-border-strong underline-offset-4 hover:decoration-primary" href={href}><bdi>{value}</bdi></a> : value}</dd></div></div>;
}

function PricingGuides({ items, preview }: { items: Entity[]; preview: boolean }) {
  if (!items.length) return null;
  return <section className="px-4 py-14 md:px-8 md:py-20"><div className="mx-auto max-w-7xl"><header className="max-w-2xl"><Eyebrow>تفاصيل تساعدك على القرار</Eyebrow><h2 className="mt-4 text-[clamp(1.75rem,3vw,2.4rem)] font-bold">أدلة أسعار مفصلة</h2></header><div className="mt-8 grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => {
    const version = entityVersion(item, preview);
    const label = version?.title ?? version?.name;
    if (!version || !label) return null;
    const content = <><span className="grid size-10 place-items-center rounded-[9px] bg-primary-soft text-primary"><ReceiptText aria-hidden="true" className="size-[18px]" strokeWidth={1.7} /></span><h3 className="mt-5 text-lg font-semibold leading-[1.5]">{label}</h3>{version.shortDescription || version.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-[1.75] text-text-secondary">{version.shortDescription ?? version.excerpt}</p> : null}<span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-primary">قراءة الدليل<ArrowLeft aria-hidden="true" className="size-4" /></span></>;
    const className = "group flex h-full min-h-[220px] flex-col rounded-[12px] border border-border bg-card p-5 transition-[border-color,background-color] duration-150 hover:border-border-strong hover:bg-secondary";
    return !preview && version.slug ? <Link className={className} href={`/guides/${version.slug}`} key={item.id}>{content}</Link> : <article className={className} key={item.id}>{content}</article>;
  })}</div></div></section>;
}

function FinalCta({ title, description, buttonText, target }: { title?: string; description?: string; buttonText?: string; target?: string }) {
  if (!title) return null;
  const Icon = target?.startsWith("/") ? ArrowLeft : MessageCircle;
  return <section className="bg-background px-4 py-14 md:px-8 md:py-20"><div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[16px] bg-primary-active px-5 py-11 text-primary-foreground sm:px-8 md:px-12 md:py-14"><div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_25%,color-mix(in_oklch,var(--primary)_70%,transparent),transparent_38%),linear-gradient(125deg,var(--primary-active),var(--primary-hover))]" /><div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div><h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.3]">{title}</h2>{description ? <p className="mt-3 max-w-[52ch] leading-[1.8] text-primary-soft">{description}</p> : null}</div>{buttonText && target ? <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary-foreground px-5 text-sm font-semibold text-primary-active transition-colors hover:bg-primary-soft" href={target}><Icon aria-hidden="true" className="size-[18px]" />{buttonText}</a> : null}</div></div></section>;
}

function entityVersion(item: Entity, preview: boolean) { return preview ? item.draftVersion ?? item.publishedVersion : item.publishedVersion; }
function ordered(ids: string[], items: Entity[]) { return ids.map((id) => items.find((item) => item.id === id)).filter((item): item is Entity => Boolean(item)); }
function faqItems(ids: string[], items: Entity[], preview: boolean) { return ordered(ids, items).map((item) => { const version = entityVersion(item, preview); return { id: item.id, question: version?.question ?? null, answer: version?.answer ?? null }; }); }
