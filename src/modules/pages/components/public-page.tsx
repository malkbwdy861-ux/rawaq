import {
  ArrowLeft,
  Check,
  ImageIcon,
  MapPin,
  MessageCircle,
  PencilRuler,
  Phone,
  Settings2,
  ShieldCheck,
  Sun,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cmsContentPath } from "@/modules/cms/slugs";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { JsonLd } from "@/modules/seo/components/json-ld";

import { FaqList } from "@/modules/faqs/components/faq-list";
import {
  buildWhatsAppUrl,
  digitsOnly,
  phoneHref,
} from "@/modules/settings/contact";
import { ContactWhatsappForm } from "@/modules/settings/components/contact-whatsapp-form";

import type {
  AboutPageData,
  ContactPageData,
  FaqPageData,
  HomePageData,
  PricesPageData,
  ListingPageData,
  StaticPageData,
} from "../validation";
import {
  FeaturedProjects,
  type FeaturedProjectItem,
} from "./featured-projects";
import {
  FeaturedSolutions,
  type FeaturedSolutionItem,
} from "./featured-solutions";
import { HomeFaqAccordion } from "./home-faq-accordion";
import { ServiceCard, serviceTileClasses } from "./service-card";
import { StaticPublicPage } from "./static-public-pages";

type Media = { url: string; altText: string | null; caption?: string | null };
type Version = {
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  shortDescription?: string | null;
  excerpt?: string | null;
  question?: string | null;
  answer?: string | null;
  city?: string | null;
  district?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    iconKey: string;
    isActive: boolean;
  } | null;
  coverMedia?: Media | null;
  heroMedia?: Media | null;
};
type Entity = {
  id: string;
  draftVersion?: Version | null;
  publishedVersion?: Version | null;
};
export type ResolvedPageData = {
  heroMedia: Media | null;
  valuePropositionMedia: Media | null;
  sectionMedia: Record<string, Media>;
  services: Entity[];
  solutions: Entity[];
  materials: Entity[];
  projects: Entity[];
  articles: Entity[];
  faqs: Entity[];
  settings: {
    primaryPhone: string;
    secondaryPhone: string | null;
    whatsappNumber: string;
    email: string | null;
    address: string | null;
    businessHours: string | null;
    defaultSeoTitle: string | null;
    defaultSeoDescription: string | null;
    defaultOpenGraphImage?: { url: string } | null;
    defaultWhatsappText: string | null;
    defaultCtaText: string | null;
  } | null;
};

export function PublicPage({
  pageKey,
  data,
  resolved,
  preview = false,
}: {
  pageKey: "HOME" | "ABOUT" | "CONTACT" | "PRICES" | "FAQS" | "PROJECTS" | "SERVICES" | "SOLUTIONS";
  data: StaticPageData;
  resolved: ResolvedPageData;
  preview?: boolean;
}) {
  return (
    <main className="min-h-screen bg-[oklch(97.5%_0.009_100)]">
      {preview ? (
        <div className="border-b border-[oklch(47%_0.10_75)] bg-[oklch(94%_0.035_80)] px-4 py-3 text-center font-semibold text-[oklch(47%_0.10_75)]">
          معاينة محمية لمسودة غير منشورة
        </div>
      ) : null}
      {pageKey === "HOME" ? (
        <HomeContent
          data={data as HomePageData}
          resolved={resolved}
          preview={preview}
        />
      ) : null}
      {pageKey !== "HOME" ? (
        <StaticPublicPage
          data={data as AboutPageData | ContactPageData | PricesPageData | FaqPageData | ListingPageData}
          pageKey={pageKey}
          preview={preview}
          resolved={resolved}
        />
      ) : null}
    </main>
  );
}

function HomeContent({
  data,
  resolved,
  preview,
}: {
  data: HomePageData;
  resolved: ResolvedPageData;
  preview: boolean;
}) {
  const services = ordered(
    data.featuredServices.selectedServiceIds,
    resolved.services,
  );
  const solutions = ordered(
    data.featuredSolutions.selectedSolutionIds,
    resolved.solutions,
  );
  const solutionItems = solutions.flatMap((item): FeaturedSolutionItem[] => {
    const version = entityVersion(item, preview);
    if (!version?.title || !version.shortDescription) return [];
    return [
      {
        id: item.id,
        title: version.title,
        shortDescription: version.shortDescription,
        href:
          !preview && version.slug
            ? cmsContentPath("/solutions", version.slug)
            : null,
        image: version.heroMedia
          ? {
              url: version.heroMedia.url,
              altText: version.heroMedia.altText || version.title,
            }
          : null,
      },
    ];
  });
  const projects = ordered(
    data.featuredProjects.selectedProjectIds,
    resolved.projects,
  );
  const projectItems = projects.flatMap((item): FeaturedProjectItem[] => {
    const version = entityVersion(item, preview);
    if (!version?.title || !version.shortDescription || !version.coverMedia)
      return [];
    const location = [version.city, version.district]
      .filter(Boolean)
      .join(" · ");
    return [
      {
        id: item.id,
        title: version.title,
        shortDescription: version.shortDescription,
        href:
          !preview && version.slug
            ? cmsContentPath("/projects", version.slug)
            : null,
        image: {
          url: version.coverMedia.url,
          altText: version.coverMedia.altText || version.title,
        },
        ...(location ? { location } : {}),
        ...(version.category?.isActive
          ? {
              category: {
                name: version.category.name,
                iconKey: version.category.iconKey,
              },
            }
          : {}),
      },
    ];
  });
  const faqs = faqItems(
    data.faqSection.selectedFaqIds,
    resolved.faqs,
    preview,
  ).slice(0, 6);
  const valuePropositionMedia =
    resolved.valuePropositionMedia ??
    solutionItems.find((item) => item.image)?.image ??
    null;
  const projectsDescription = legacyProjectPlaceholder(
    data.featuredProjects.description,
  )
    ? "نعرض مجموعة مختارة من المشاريع التي تعكس جودة التنفيذ واهتمامنا بالتفاصيل في مختلف أنحاء جدة."
    : data.featuredProjects.description;
  return (
    <>
      <section className="relative isolate min-h-svh overflow-hidden bg-primary-active text-primary-foreground">
        {resolved.heroMedia ? (
          <Image
            alt={
              data.hero.imageAlt ||
              resolved.heroMedia.altText ||
              data.hero.title ||
              ""
            }
            className="-z-30 object-cover object-[68%_center] sm:object-[64%_center] lg:object-[60%_center]"
            fill
            priority
            sizes="100vw"
            src={resolved.heroMedia.url}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-30 bg-[linear-gradient(130deg,var(--primary-active),var(--primary))]"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_left,color-mix(in_oklch,var(--primary-active)_72%,transparent)_0%,color-mix(in_oklch,var(--primary-active)_52%,transparent)_24%,color-mix(in_oklch,var(--primary)_24%,transparent)_48%,color-mix(in_oklch,var(--primary)_5%,transparent)_70%,transparent_100%)]"
        />
        <div className="mx-auto grid min-h-svh max-w-[1280px] grid-rows-[1fr_auto] px-4 pb-8 pt-32 sm:px-6 sm:pb-10 sm:pt-36 lg:px-10 lg:pb-14 lg:pt-48">
          <div className="grid items-center lg:grid-cols-12">
            <div className="max-w-[780px] self-center lg:col-span-7 lg:col-start-1 lg:pb-10">
              {data.hero.eyebrow ? (
                <p className="mb-6 flex items-center gap-3 text-sm font-semibold text-primary-soft before:h-px before:w-10 before:bg-clay">
                  {data.hero.eyebrow}
                </p>
              ) : null}
              <h1 className="max-w-[780px] text-[clamp(2.25rem,3.45vw,3.75rem)] font-bold leading-[1.09] text-pretty">
                {data.hero.title}
              </h1>
              {data.hero.description ? (
                <p className="mt-6 max-w-[560px] text-[1rem] leading-[1.9] text-primary-soft md:text-[1.0625rem]">
                  {data.hero.description}
                </p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {data.hero.primaryCtaTarget && data.hero.primaryCtaText ? (
                  <Cta
                    href={data.hero.primaryCtaTarget}
                    icon="whatsapp"
                    label={data.hero.primaryCtaText}
                  />
                ) : null}
                {data.hero.secondaryCtaText && data.hero.secondaryCtaTarget ? (
                  <Cta
                    href={data.hero.secondaryCtaTarget}
                    icon="projects"
                    label={data.hero.secondaryCtaText}
                    secondary
                  />
                ) : null}
              </div>
            </div>
          </div>
          {data.trustSection.items.length ? (
            <HeroTrustStrip items={data.trustSection.items.slice(0, 3)} />
          ) : null}
        </div>
      </section>
      <FeaturedServices items={services} preview={preview} />
      {solutionItems.length ? (
        <FeaturedSolutions
          title={
            data.featuredSolutions.title || "حلول تظليل لكل نوع من المشاريع"
          }
          description={data.featuredSolutions.description}
          items={solutionItems}
        />
      ) : null}
      {data.valueProposition.enabled ? (
        <ValuePropositionSection
          data={data.valueProposition}
          image={valuePropositionMedia}
        />
      ) : null}
      {data.featuredProjects.enabled ? (
        <FeaturedProjects
          eyebrow={data.featuredProjects.eyebrow}
          title={data.featuredProjects.title || "مشاريع مختارة"}
          description={projectsDescription}
          ctaLabel={data.featuredProjects.ctaLabel}
          ctaHref={data.featuredProjects.ctaHref}
          items={projectItems}
        />
      ) : null}
      {data.howWeWork.enabled ? (
        <HowWeWorkSection data={data.howWeWork} media={resolved.sectionMedia} />
      ) : null}
      {data.trustSection.enabled ? (
        <TrustProofSection
          data={data.trustSection}
          media={resolved.sectionMedia}
        />
      ) : null}
      {data.faqSection.enabled && faqs.length ? (
        <HomeFaqSection data={data.faqSection} items={faqs} />
      ) : null}
      {!preview && data.faqSection.enabled && faqs.length ? (
        <FaqStructuredData items={faqs} />
      ) : null}
      {data.finalCta.enabled ? (
        <HomeFinalCta
          data={data.finalCta}
          media={resolved.sectionMedia}
          settings={resolved.settings}
        />
      ) : null}
    </>
  );
}

const proofIcons = {
  location: MapPin,
  shield: ShieldCheck,
  team: UsersRound,
  settings: Settings2,
  climate: Sun,
  design: PencilRuler,
};

function HowWeWorkSection({
  data,
  media,
}: {
  data: HomePageData["howWeWork"];
  media: Record<string, Media>;
}) {
  const steps = data.steps
    .filter(
      (step) =>
        step.enabled && (step.title || step.description || step.mediaId),
    )
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);
  if (!steps.length && !data.title) return null;
  return (
    <section
      aria-labelledby="process-title"
      className="bg-background px-4 py-16 md:px-8 md:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-5 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            {data.eyebrow ? (
              <p className="flex items-center gap-3 text-sm font-semibold text-clay-strong before:h-px before:w-9 before:bg-clay">
                {data.eyebrow}
              </p>
            ) : null}
            {data.title ? (
              <h2
                className="mt-4 max-w-[720px] text-[clamp(2rem,3.4vw,3rem)] font-bold leading-[1.28] text-pretty"
                id="process-title"
              >
                {data.title}
              </h2>
            ) : null}
          </div>
          {data.description ? (
            <p className="max-w-[54ch] text-[1.0625rem] leading-[1.85] text-text-secondary md:col-span-5">
              {data.description}
            </p>
          ) : null}
        </header>
        {steps.length ? (
          <ol className="mt-10 grid gap-y-10 sm:grid-cols-2 sm:gap-x-0 md:mt-12 lg:grid-cols-4">
            {steps.map((step, index) => {
              const image = step.mediaId ? media[step.mediaId] : null;
              return (
                <li
                  className={`relative min-w-0 sm:px-5 sm:first:pe-0 lg:px-6 lg:first:pe-0 ${index > 0 ? "sm:border-s sm:border-border" : ""} ${index === 2 ? "sm:border-s-0 lg:border-s" : ""}`}
                  key={step.id}
                >
                  {image ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[2px]">
                      <Image
                        alt={step.imageAlt || image.altText || step.title || ""}
                        className="object-cover"
                        fill
                        sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                        src={image.url}
                      />
                    </div>
                  ) : null}
                  <div
                    className={`${image ? "relative -mt-5" : "border-t border-border pt-4"}`}
                  >
                    <span
                      className={`${image ? "grid size-12 place-items-center rounded-[9px] bg-primary text-primary-foreground" : "text-clay-strong"} inline-grid tabular-nums text-sm font-semibold`}
                      dir="ltr"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step.title ? (
                      <h3 className="mt-5 text-xl font-semibold leading-[1.5]">
                        {step.title}
                      </h3>
                    ) : null}
                    {step.description ? (
                      <p className="mt-2 max-w-[34ch] text-[0.9375rem] leading-[1.8] text-text-secondary">
                        {step.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    </section>
  );
}

function TrustProofSection({
  data,
  media,
}: {
  data: HomePageData["trustSection"];
  media: Record<string, Media>;
}) {
  const metrics = data.metrics
    .filter(
      (item) => item.enabled && (item.title || item.value || item.description),
    )
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);
  const strip = data.stripItems
    .filter((item) => item.enabled && item.title)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  const featuredImage = data.featuredProof.mediaId
    ? media[data.featuredProof.mediaId]
    : null;
  if (!data.title && !data.featuredProof.title && !metrics.length) return null;
  return (
    <section
      aria-labelledby="trust-proof-title"
      className="bg-muted px-4 py-16 md:px-8 md:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          {data.eyebrow ? (
            <p className="flex items-center gap-3 text-sm font-semibold text-clay-strong before:h-px before:w-9 before:bg-clay">
              {data.eyebrow}
            </p>
          ) : null}
          <h2
            className="mt-4 text-[clamp(2rem,3.4vw,3rem)] font-bold leading-[1.28] text-pretty"
            id="trust-proof-title"
          >
            {data.title || "ثقة تُبنى على تفاصيل واضحة"}
          </h2>
          {data.description ? (
            <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-[1.85] text-text-secondary">
              {data.description}
            </p>
          ) : null}
        </header>
        <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:gap-5">
          {data.featuredProof.title ||
          data.featuredProof.description ||
          featuredImage ? (
            <article className="relative isolate flex min-h-[360px] overflow-hidden rounded-[12px] bg-primary-active p-6 text-primary-foreground sm:min-h-[420px] sm:p-8 lg:col-span-7 lg:p-10">
              {featuredImage ? (
                <Image
                  alt={featuredImage.altText || data.featuredProof.title || ""}
                  className="-z-20 object-cover"
                  fill
                  sizes="(min-width:1024px) 58vw, 100vw"
                  src={featuredImage.url}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,var(--primary-active),var(--primary))] [background-image:linear-gradient(135deg,var(--primary-active),var(--primary)),linear-gradient(90deg,color-mix(in_oklch,var(--primary-soft)_13%,transparent)_1px,transparent_1px)] [background-size:auto,64px_100%]"
                />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--primary-active)_94%,transparent),color-mix(in_oklch,var(--primary-active)_26%,transparent))]"
              />
              <div className="mt-auto max-w-[560px]">
                <ShieldCheck className="size-8 text-clay" strokeWidth={1.5} />
                {data.featuredProof.title ? (
                  <h3 className="mt-5 text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.35]">
                    {data.featuredProof.title}
                  </h3>
                ) : null}
                {data.featuredProof.description ? (
                  <p className="mt-3 max-w-[50ch] leading-[1.8] text-primary-soft">
                    {data.featuredProof.description}
                  </p>
                ) : null}
              </div>
            </article>
          ) : null}
          {metrics.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
              {metrics.map((item) => {
                const Icon = proofIcons[item.icon ?? "shield"];
                return (
                  <article
                    className="flex min-h-[190px] flex-col border-t border-border-strong bg-background p-5 sm:min-h-[200px]"
                    key={item.id}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-5 text-clay-strong"
                      strokeWidth={1.6}
                    />
                    {item.value ? (
                      <p
                        className="mt-auto text-3xl font-bold tabular-nums text-primary"
                        dir="auto"
                      >
                        {item.value}
                      </p>
                    ) : null}
                    <h3
                      className={`${item.value ? "mt-2" : "mt-auto"} text-lg font-semibold leading-[1.5]`}
                    >
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-[1.75] text-text-secondary">
                        {item.description}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
        {strip.length ? (
          <ul className="mt-7 grid border-y border-border sm:grid-cols-3">
            {strip.map((item, index) => {
              const Icon = proofIcons[item.icon ?? "shield"];
              return (
                <li
                  className={`flex min-h-16 items-center gap-3 py-4 sm:px-5 sm:first:pe-0 ${index > 0 ? "border-t border-border sm:border-s sm:border-t-0" : ""}`}
                  key={item.id}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-[18px] shrink-0 text-primary"
                    strokeWidth={1.7}
                  />
                  <span className="text-sm font-semibold">{item.title}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function HomeFaqSection({
  data,
  items,
}: {
  data: HomePageData["faqSection"];
  items: { id: string; question: string | null; answer: string | null }[];
}) {
  const title =
    data.title?.trim() && data.title.trim() !== "أسئلة شائعة"
      ? data.title
      : "إجابات واضحة قبل بدء مشروعك";
  const description =
    data.description?.trim() ||
    "نوضح أهم التفاصيل التي يحتاجها العميل قبل المعاينة، من السعر والمدة إلى الضمان والتنفيذ حسب المقاس.";
  const allFaqsLabel = data.allFaqsLabel?.trim() || "عرض جميع الأسئلة";
  const allFaqsHref = data.allFaqsHref?.trim() || "/faqs";

  return (
    <section
      aria-labelledby="home-faq-title"
      className="bg-background px-4 py-16 md:px-8 md:py-20 lg:py-24"
      id="faq"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:gap-10 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:items-start lg:gap-10 xl:gap-12">
        <header className="relative overflow-hidden rounded-[12px] border border-border bg-muted p-5 sm:p-7 lg:min-h-[520px] lg:p-8">
          {data.eyebrow ? (
            <p className="flex items-center gap-3 text-sm font-semibold text-clay-strong before:h-px before:w-9 before:bg-clay">
              {data.eyebrow}
            </p>
          ) : null}
          <h2
            className="mt-4 max-w-[460px] text-[clamp(1.875rem,2.7vw,2.55rem)] font-bold leading-[1.32] text-pretty"
            id="home-faq-title"
          >
            {title}
          </h2>
          <p className="mt-5 max-w-[42ch] text-[1rem] leading-[1.85] text-text-secondary md:text-[1.0625rem]">
            {description}
          </p>
        </header>
        <div className="lg:pt-3">
          <div className="max-w-[820px]">
            <HomeFaqAccordion items={items} />
            <Link
              className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline decoration-border-strong underline-offset-8 transition-colors hover:text-primary-hover hover:decoration-primary focus-visible:outline-ring"
              href={allFaqsHref}
            >
              {allFaqsLabel}
              <ArrowLeft
                aria-hidden="true"
                className="size-[17px] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeFinalCta({
  data,
  media,
  settings,
}: {
  data: HomePageData["finalCta"];
  media: Record<string, Media>;
  settings: ResolvedPageData["settings"];
}) {
  if (!data.title) return null;
  const background = data.backgroundMediaId
    ? media[data.backgroundMediaId]
    : null;
  const primaryHref = settings?.whatsappNumber
    ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText)
    : data.target;
  const secondaryHref = settings?.primaryPhone
    ? phoneHref(settings.primaryPhone)
    : null;
  const primaryLabel = data.primaryCtaLabel || data.buttonText;
  const trustItems = data.trustItems
    .filter((item) => item.enabled && item.title)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  return (
    <section
      className="bg-background px-4 pb-16 pt-4 md:px-8 md:pb-20 lg:pb-24"
      aria-labelledby="final-cta-title"
    >
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[16px] bg-primary-active px-5 py-12 text-primary-foreground sm:px-8 md:py-16 lg:px-16 lg:py-20">
        {background ? (
          <Image
            alt=""
            className="-z-20 object-cover object-center"
            fill
            sizes="(min-width:1280px) 1280px, 100vw"
            src={background.url}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_25%,color-mix(in_oklch,var(--primary)_70%,transparent),transparent_38%),linear-gradient(125deg,var(--primary-active),var(--primary-hover))]"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,color-mix(in_oklch,var(--primary-active)_25%,transparent),color-mix(in_oklch,var(--primary-active)_90%,transparent))]"
        />
        <div className="mx-auto max-w-3xl text-center">
          {data.eyebrow ? (
            <p className="text-sm font-semibold text-clay">{data.eyebrow}</p>
          ) : null}
          <h2
            className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.25] text-pretty"
            id="final-cta-title"
          >
            {data.title}
          </h2>
          {data.description ? (
            <p className="mx-auto mt-4 max-w-[52ch] text-[1.0625rem] leading-[1.85] text-primary-soft">
              {data.description}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {primaryLabel && primaryHref ? (
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary-foreground px-5 text-sm font-semibold text-primary-active transition-colors hover:bg-primary-soft focus-visible:outline-ring"
                href={primaryHref}
              >
                <MessageCircle aria-hidden="true" className="size-[18px]" />
                {primaryLabel}
              </a>
            ) : null}
            {data.secondaryCtaLabel && secondaryHref ? (
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border border-primary-soft/55 px-5 text-sm font-semibold text-primary-foreground transition-colors hover:border-primary-soft hover:bg-primary/35 focus-visible:outline-ring"
                href={secondaryHref}
              >
                <Phone aria-hidden="true" className="size-[18px]" />
                {data.secondaryCtaLabel}
              </a>
            ) : null}
          </div>
        </div>
        {trustItems.length ? (
          <ul className="mx-auto mt-9 flex max-w-2xl flex-wrap justify-center gap-x-7 gap-y-3 border-t border-primary-soft/20 pt-5">
            {trustItems.map((item) => (
              <li
                className="flex items-center gap-2 text-xs font-semibold text-primary-soft"
                key={item.id}
              >
                <Check aria-hidden="true" className="size-4 text-clay" />
                {item.title}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function ValuePropositionSection({
  data,
  image,
}: {
  data: HomePageData["valueProposition"];
  image: Media | null;
}) {
  const icons = {
    location: MapPin,
    shield: ShieldCheck,
    team: UsersRound,
    settings: Settings2,
    climate: Sun,
    design: PencilRuler,
  };
  const items = data.items
    .filter((item) => item.enabled && (item.title || item.description))
    .sort((a, b) => a.order - b.order);

  return (
    <section
      aria-labelledby="value-proposition-title"
      className="relative overflow-hidden bg-muted px-4 py-16 md:px-8 md:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-border"
      />
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-8 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0">
        <header className="lg:col-span-6 lg:col-start-1 lg:row-start-1">
          {data.eyebrow ? (
            <p className="flex items-center gap-3 text-sm font-semibold text-clay-strong before:h-px before:w-9 before:bg-clay">
              {data.eyebrow}
            </p>
          ) : null}
          <h2
            className="mt-4 max-w-[680px] text-[clamp(2rem,3.4vw,3rem)] font-bold leading-[1.28] text-pretty"
            id="value-proposition-title"
          >
            {data.heading}
          </h2>
          {data.description ? (
            <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-[1.85] text-text-secondary">
              {data.description}
            </p>
          ) : null}
        </header>

        {image ? (
          <figure className="relative aspect-[4/5] min-h-[440px] overflow-hidden rounded-[12px] sm:aspect-[5/4] lg:col-span-5 lg:col-start-8 lg:row-span-3 lg:row-start-1 lg:min-h-[720px]">
            <Image
              alt={image.altText || data.heading || "مشروع تظليل معماري في جدة"}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              src={image.url}
            />
          </figure>
        ) : null}

        {items.length ? (
          <ol className="border-y border-border lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:mt-10">
            {items.map((item, index) => {
              const Icon = icons[item.icon ?? "shield"];
              return (
                <li
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-border py-5 last:border-b-0 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-4"
                  key={`${item.title}-${item.order}-${index}`}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-[9px] bg-primary-soft text-primary sm:size-11"
                  >
                    <Icon className="size-[18px]" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    {item.title ? (
                      <h3 className="text-lg font-semibold leading-[1.5] sm:text-xl">
                        {item.title}
                      </h3>
                    ) : null}
                    {item.description ? (
                      <p className="mt-1.5 max-w-[48ch] text-[0.9375rem] leading-[1.75] text-text-secondary">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}

        {data.ctaLabel && data.ctaUrl ? (
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-3 lg:mt-7">
            <Link
              className="group inline-flex min-h-12 items-center gap-3 rounded-[9px] border border-border-strong px-5 text-sm font-semibold text-primary transition-colors duration-150 hover:border-primary hover:bg-primary-soft focus-visible:outline-ring"
              href={data.ctaUrl}
            >
              {data.ctaLabel}
              <ArrowLeft
                aria-hidden="true"
                className="size-[18px] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-1"
              />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function AboutContent({
  data,
  resolved,
}: {
  data: AboutPageData;
  resolved: ResolvedPageData;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <Breadcrumb current="من نحن" />
      <section className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
        <header className="space-y-5 lg:col-span-6">
          <h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">
            {data.hero.title}
          </h1>
          <p className="max-w-[62ch] text-xl leading-[1.7] text-[oklch(42%_0.018_150)]">
            {data.hero.description}
          </p>
        </header>
        {resolved.heroMedia ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] lg:col-span-6">
            <Image
              alt={resolved.heroMedia.altText ?? data.hero.title ?? ""}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={resolved.heroMedia.url}
            />
          </div>
        ) : null}
      </section>
      <section className="grid gap-8 py-20 md:grid-cols-12 md:py-28">
        <h2 className="text-3xl font-bold leading-[1.35] md:col-span-4">
          {data.companyStory.title}
        </h2>
        <p className="whitespace-pre-line text-lg leading-[1.9] text-[oklch(42%_0.018_150)] md:col-span-7 md:col-start-6">
          {data.companyStory.content}
        </p>
      </section>
      {data.values.items.length ? (
        <section className="border-y border-[oklch(82%_0.012_145)] py-16">
          <h2 className="text-3xl font-bold">{data.values.title}</h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {data.values.items.map((item) => (
              <div key={item.title}>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-[1.8] text-[oklch(42%_0.018_150)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {data.capabilities.content ? (
        <section className="max-w-[72ch] py-20">
          <h2 className="text-3xl font-bold">{data.capabilities.title}</h2>
          <p className="mt-5 whitespace-pre-line text-lg leading-[1.9] text-[oklch(42%_0.018_150)]">
            {data.capabilities.content}
          </p>
        </section>
      ) : null}
      <FinalBand {...data.finalCta} />
    </div>
  );
}

export function ContactContent({
  data,
  resolved,
}: {
  data: ContactPageData;
  resolved: ResolvedPageData;
}) {
  const settings = resolved.settings;
  const contactOptions = {
    services: resolved.services
      .map((item) => ({ id: item.id, label: item.publishedVersion?.title }))
      .filter((item): item is { id: string; label: string } =>
        Boolean(item.label),
      ),
    solutions: resolved.solutions
      .map((item) => ({ id: item.id, label: item.publishedVersion?.title }))
      .filter((item): item is { id: string; label: string } =>
        Boolean(item.label),
      ),
    materials: resolved.materials
      .map((item) => ({ id: item.id, label: item.publishedVersion?.name }))
      .filter((item): item is { id: string; label: string } =>
        Boolean(item.label),
      ),
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <Breadcrumb current="التواصل" />
      <header className="mt-12 max-w-4xl space-y-5">
        <h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">
          {data.hero.title}
        </h1>
        <p className="max-w-[62ch] text-xl leading-[1.7] text-[oklch(42%_0.018_150)]">
          {data.hero.description}
        </p>
      </header>
      <section className="grid gap-10 py-20 md:grid-cols-12">
        <div className="space-y-4 md:col-span-4">
          <h2 className="text-3xl font-bold">{data.contactIntro.title}</h2>
          {data.contactIntro.description ? (
            <p className="leading-[1.8] text-[oklch(42%_0.018_150)]">
              {data.contactIntro.description}
            </p>
          ) : null}
        </div>
        <div className="space-y-8 md:col-span-7 md:col-start-6">
          <dl className="grid border-y border-[oklch(82%_0.012_145)]">
            {settings && data.showWhatsapp ? (
              <ContactRow
                term="واتساب"
                value={settings.whatsappNumber}
                href={buildWhatsAppUrl(
                  settings.whatsappNumber,
                  settings.defaultWhatsappText,
                )}
              />
            ) : null}
            {settings && data.showPhone ? (
              <ContactRow
                term={settings.defaultCtaText || "الهاتف"}
                value={settings.primaryPhone}
                href={phoneHref(settings.primaryPhone)}
              />
            ) : null}
            {settings && data.showPhone && settings.secondaryPhone ? (
              <ContactRow
                term="هاتف ثانوي"
                value={settings.secondaryPhone}
                href={phoneHref(settings.secondaryPhone)}
              />
            ) : null}
            {settings && data.showEmail && settings.email ? (
              <ContactRow
                term="البريد الإلكتروني"
                value={settings.email}
                href={`mailto:${settings.email}`}
              />
            ) : null}
            {settings && data.showAddress && settings.address ? (
              <ContactRow term="العنوان" value={settings.address} />
            ) : null}
            {settings && data.showBusinessHours && settings.businessHours ? (
              <ContactRow term="ساعات العمل" value={settings.businessHours} />
            ) : null}
          </dl>
          {settings &&
          data.showWhatsapp &&
          digitsOnly(settings.whatsappNumber) ? (
            <ContactWhatsappForm
              whatsappNumber={settings.whatsappNumber}
              defaultMessage={settings.defaultWhatsappText}
              {...contactOptions}
            />
          ) : null}
        </div>
      </section>
      {data.finalCta.title ? (
        <section className="border-t border-[oklch(82%_0.012_145)] py-12">
          <h2 className="text-2xl font-bold">{data.finalCta.title}</h2>
          {data.finalCta.description ? (
            <p className="mt-3 max-w-[62ch] leading-[1.8] text-[oklch(42%_0.018_150)]">
              {data.finalCta.description}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export function PricesContent({
  data,
  resolved,
  preview,
}: {
  data: PricesPageData;
  resolved: ResolvedPageData;
  preview: boolean;
}) {
  const articles = ordered(data.selectedPricingArticleIds, resolved.articles);
  const faqs = faqItems(data.faqSection.selectedFaqIds, resolved.faqs, preview);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <Breadcrumb current="الأسعار" />
      <header className="mt-12 max-w-4xl space-y-5">
        <p className="text-sm font-semibold text-[oklch(34%_0.065_42)]">
          مركز الأسعار
        </p>
        <h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">
          {data.hero.title}
        </h1>
        <p className="max-w-[62ch] text-xl leading-[1.7] text-[oklch(42%_0.018_150)]">
          {data.hero.description}
        </p>
      </header>
      <section className="grid gap-8 py-20 md:grid-cols-12">
        <h2 className="text-3xl font-bold md:col-span-4">{data.intro.title}</h2>
        <p className="whitespace-pre-line text-lg leading-[1.9] text-[oklch(42%_0.018_150)] md:col-span-7 md:col-start-6">
          {data.intro.content}
        </p>
      </section>
      {data.pricingFactors.items.length ? (
        <section className="bg-[oklch(37%_0.075_155)] px-5 py-12 text-[oklch(99%_0.004_100)] md:px-10">
          <h2 className="text-3xl font-bold">{data.pricingFactors.title}</h2>
          <div className="mt-8 divide-y divide-[oklch(64%_0.018_145)]">
            {data.pricingFactors.items.map((item, index) => (
              <div
                className="grid gap-3 py-5 md:grid-cols-[4rem_260px_minmax(0,1fr)]"
                key={`${item.title}-${index}`}
              >
                <span className="tabular-nums text-[oklch(91%_0.035_55)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="leading-[1.8] text-[oklch(95.5%_0.018_145)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <EntityRows
        title="أدلة أسعار مفصلة"
        items={articles}
        prefix="/guides"
        preview={preview}
      />
      {faqs.length ? (
        <section className="mx-auto max-w-4xl py-16 md:py-20">
          <h2 className="mb-7 text-3xl font-bold">أسئلة الأسعار</h2>
          <FaqList items={faqs} />
        </section>
      ) : null}
      {!preview && faqs.length ? <FaqStructuredData items={faqs} /> : null}
      <FinalBand {...data.finalCta} />
    </div>
  );
}

const serviceSubtitles: Record<string, string> = {
  "مظلات سيارات": "حماية وأناقة لسيارتك في كل الأوقات",
  برجولات: "مساحات خارجية أكثر جمالاً وراحة",
  سواتر: "خصوصية وأمان بمظهر عصري",
  "مظلات حدائق": "استمتع بمساحاتك الخارجية براحة أكبر",
  "مظلات مدارس": "بيئة مريحة وآمنة للمساحات التعليمية",
};

function FeaturedServices({
  items,
  preview,
}: {
  items: Entity[];
  preview: boolean;
}) {
  const services = items.slice(0, 5).flatMap((item) => {
    const version = entityVersion(item, preview);
    return version?.title ? [{ item, version }] : [];
  });
  if (!services.length) return null;

  return (
    <section
      className="relative overflow-hidden bg-background px-4 py-16 md:px-8 md:py-20 lg:py-24"
      aria-labelledby="featured-services-title"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-border"
      />
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="flex items-center gap-3 text-sm font-semibold text-clay-strong before:h-px before:w-9 before:bg-clay">
              الخدمات المميزة
            </p>
            <h2
              className="mt-4 max-w-[700px] text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.2] text-pretty"
              id="featured-services-title"
            >
              حلول تظليل متكاملة لكل مساحة
            </h2>
          </div>
          <p className="max-w-[54ch] text-[1.0625rem] leading-[1.85] text-text-secondary md:col-span-5 md:pb-1">
            من المظلات إلى السواتر والبرجولات، نقدم حلول تظليل عصرية تجمع بين
            الجودة والجمال لتمنحك الراحة والحماية في مختلف المساحات.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-3 md:mt-12 md:grid-cols-6 md:gap-4 lg:auto-rows-[292px] lg:grid-cols-12">
          {services.map(({ item, version }, index) => {
            const subtitle =
              serviceSubtitles[version.title!] ??
              version.shortDescription ??
              "حلول مصممة بعناية لتناسب احتياج مساحتك";
            return <ServiceCard className={serviceTileClasses[index]} featured index={index} item={{ id: item.id, title: version.title!, description: subtitle, href: !preview && version.slug ? cmsContentPath("/services", version.slug) : null, image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title || "" } : null }} key={item.id} />;
          })}
        </div>

        <div className="mt-8 flex justify-start md:mt-10">
          <Link
            className="group inline-flex min-h-12 items-center gap-3 rounded-[9px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover active:bg-primary-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="/services"
          >
            استكشف جميع خدماتنا
            <ArrowLeft
              aria-hidden="true"
              className="size-[18px] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function EntityRows({
  title,
  description,
  items,
  prefix,
  preview,
}: {
  title: string;
  description?: string;
  items: Entity[];
  prefix: string;
  preview: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <EntityRowsInner
          title={title}
          description={description}
          items={items}
          prefix={prefix}
          preview={preview}
        />
      </div>
    </section>
  );
}
function EntityRowsInner({
  title,
  description,
  items,
  prefix,
  preview,
}: {
  title: string;
  description?: string;
  items: Entity[];
  prefix: string;
  preview: boolean;
}) {
  return (
    <div className="grid gap-10 md:grid-cols-12">
      <header className="space-y-3 md:col-span-4">
        <h2 className="text-3xl font-bold leading-[1.35] md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="leading-[1.8] text-[oklch(42%_0.018_150)]">
            {description}
          </p>
        ) : null}
      </header>
      <div className="border-y border-[oklch(82%_0.012_145)] md:col-span-7 md:col-start-6">
        {items.map((item) => {
          const version = entityVersion(item, preview);
          const label = version?.title ?? version?.name;
          if (!version || !label) return null;
          const content = (
            <>
              <h3 className="text-xl font-semibold">{label}</h3>
              {version.shortDescription || version.excerpt ? (
                <p className="mt-2 leading-[1.8] text-[oklch(42%_0.018_150)]">
                  {version.shortDescription ?? version.excerpt}
                </p>
              ) : null}
            </>
          );
          return (
            <div
              className="border-b border-[oklch(82%_0.012_145)] py-5 last:border-b-0"
              key={item.id}
            >
              {!preview && version.slug ? (
                <Link
                  className="block min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]"
                  href={`${prefix}/${version.slug}`}
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function FinalBand({
  title,
  description,
  buttonText,
  target,
}: {
  title?: string;
  description?: string;
  buttonText?: string;
  target?: string;
}) {
  if (!title) return null;
  return (
    <section className="bg-[oklch(29%_0.055_155)] px-5 py-14 text-[oklch(99%_0.004_100)] md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">{title}</h2>
          {description ? (
            <p className="mt-3 max-w-[52ch] leading-[1.8] text-[oklch(95.5%_0.018_145)]">
              {description}
            </p>
          ) : null}
        </div>
        {buttonText && target ? <Cta href={target} label={buttonText} /> : null}
      </div>
    </section>
  );
}
function Cta({
  href,
  label,
  secondary,
  icon,
}: {
  href: string;
  label: string;
  secondary?: boolean;
  icon?: "whatsapp" | "projects";
}) {
  const Icon =
    icon === "whatsapp"
      ? MessageCircle
      : icon === "projects"
        ? ImageIcon
        : null;
  return (
    <a
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] px-4.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)] ${secondary ? "border border-primary-soft/55 bg-primary-active/15 text-primary-foreground hover:border-primary-soft hover:bg-primary-active/35" : "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active"}`}
      href={href}
    >
      {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
      {label}
    </a>
  );
}
function HeroTrustStrip({
  items,
}: {
  items: HomePageData["trustSection"]["items"];
}) {
  const icons = {
    location: MapPin,
    shield: ShieldCheck,
    team: UsersRound,
    settings: Settings2,
    climate: Sun,
    design: PencilRuler,
  };
  return (
    <dl className="grid border-t border-primary-soft/25 pt-3 sm:grid-cols-2 lg:grid-cols-3 lg:pt-3">
      {items.map((item, index) => {
        const Icon = icons[item.icon ?? "shield"];
        return (
          <div
            className="flex min-w-0 gap-2.5 py-2 sm:px-4 sm:first:pe-0 lg:border-s lg:border-primary-soft/20 lg:px-5 lg:first:border-s-0 lg:first:pe-0"
            key={`${item.title}-${index}`}
          >
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-[18px] shrink-0 text-clay"
            />
            <div className="min-w-0">
              <dt className="truncate text-[0.8125rem] font-semibold leading-5 text-primary-foreground">
                {item.title}
              </dt>
              {item.description ? (
                <dd className="mt-0.5 truncate text-[0.6875rem] leading-4 text-primary-soft">
                  {item.description}
                </dd>
              ) : null}
            </div>
          </div>
        );
      })}
    </dl>
  );
}
function Breadcrumb({ current }: { current: string }) {
  const paths: Record<string, string> = {
    "من نحن": "/about",
    التواصل: "/contact",
    الأسعار: "/prices",
  };
  return (
    <Breadcrumbs
      items={[
        { label: "الرئيسية", href: "/" },
        { label: current, href: paths[current] ?? "/" },
      ]}
    />
  );
}
function FaqStructuredData({
  items,
}: {
  items: { question: string | null; answer: string | null }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.flatMap((item) =>
          item.question && item.answer
            ? [
                {
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: { "@type": "Answer", text: item.answer },
                },
              ]
            : [],
        ),
      }}
    />
  );
}
function ContactRow({
  term,
  value,
  href,
}: {
  term: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="grid gap-2 border-b border-[oklch(82%_0.012_145)] py-5 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)]">
      <dt className="font-semibold text-[oklch(34%_0.065_42)]">{term}</dt>
      <dd
        className="whitespace-pre-line"
        dir={term === "العنوان" || term === "ساعات العمل" ? undefined : "ltr"}
      >
        {href ? (
          <a
            className="font-semibold text-[oklch(37%_0.075_155)] underline"
            href={href}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
function entityVersion(item: Entity, preview: boolean) {
  return preview
    ? (item.draftVersion ?? item.publishedVersion)
    : item.publishedVersion;
}
function legacyProjectPlaceholder(description?: string) {
  return Boolean(
    description && /(عند إضافة مشاريع|ستظهر هنا)/.test(description),
  );
}
function ordered(ids: string[], items: Entity[]) {
  return ids
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is Entity => Boolean(item));
}
function faqItems(ids: string[], items: Entity[], preview: boolean) {
  return ordered(ids, items).map((item) => {
    const version = entityVersion(item, preview);
    return {
      id: item.id,
      question: version?.question ?? null,
      answer: version?.answer ?? null,
    };
  });
}
