import { ArrowLeft, Boxes, CalendarDays, MapPin, MessageCircle, Phone, Ruler, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cmsContentPath } from "@/modules/cms/slugs";
import { buildWhatsAppUrl, phoneHref, type WhatsAppMessageInput } from "@/modules/settings/contact";

type Media = { url: string; altText: string | null; caption?: string | null };

export type DetailSettings = {
  primaryPhone: string;
  whatsappNumber: string;
  defaultWhatsappText: string | null;
} | null;

export type MaterialCardItem = {
  id: string;
  name: string;
  shortDescription?: string | null;
  href: string;
  image: Media | null;
};

export type ArticleCardItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  articleType?: string | null;
  href: string;
  image: Media | null;
};

const articleTypeLabels: Record<string, string> = {
  GUIDE: "دليل",
  PRICING: "دليل أسعار",
  COMPARISON: "مقارنة",
  MAINTENANCE: "صيانة",
  GENERAL: "مقال",
};

export function DetailContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`public-container ${className}`}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, description, action, align = "start" }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; align?: "start" | "center" | "split" }) {
  const centered = align === "center";
  if (align === "split") {
    return <header className="grid gap-5 md:grid-cols-[minmax(0,0.7fr)_minmax(220px,0.3fr)] md:items-end">
      <div className="max-w-3xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-2 text-[clamp(1.875rem,3vw,3rem)] font-bold leading-[1.25] text-pretty">{title}</h2>
        {description ? <p className="mt-3 max-w-[62ch] text-base leading-[1.85] text-text-secondary md:text-[1.0625rem]">{description}</p> : null}
      </div>
      {action ? <div className="md:justify-self-end">{action}</div> : null}
    </header>;
  }

  return <header className={`${centered ? "mx-auto items-center text-center" : ""} flex max-w-3xl flex-col`}>
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    <h2 className="mt-2 text-[clamp(1.875rem,3vw,3rem)] font-bold leading-[1.25] text-pretty">{title}</h2>
    {description ? <p className="mt-3 max-w-[62ch] text-base leading-[1.85] text-text-secondary md:text-[1.0625rem]">{description}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </header>;
}

export function Eyebrow({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <p className={`flex items-center gap-3 text-sm font-semibold ${muted ? "text-primary-soft" : "text-clay-strong"}`}><span aria-hidden="true" className={`h-px w-9 ${muted ? "bg-clay" : "bg-clay"}`} />{children}</p>;
}

export function EditorialText({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) {
  return <div className={`max-w-[72ch] whitespace-pre-line text-[1.0625rem] leading-[1.95] md:text-lg ${dark ? "text-primary-soft" : "text-text-secondary"} ${className}`}>{children}</div>;
}

export function MetaPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex min-w-0 items-center gap-3 rounded-[12px] border border-border bg-card px-4 py-3 shadow-[var(--shadow-rest)]">
    <span className="grid size-10 shrink-0 place-items-center rounded-[9px] bg-accent text-primary">{icon}</span>
    <span className="min-w-0"><span className="block text-xs font-semibold text-clay-strong">{label}</span><span className="mt-0.5 block truncate text-sm font-semibold text-foreground md:text-base">{value}</span></span>
  </div>;
}

export function MaterialsGrid({ items }: { items: MaterialCardItem[] }) {
  const visible = items.slice(0, 4);
  if (!visible.length) return null;
  return <div className="grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {visible.map((item) => <MaterialCard item={item} key={item.id} />)}
  </div>;
}

export function MaterialCard({ item }: { item: MaterialCardItem }) {
  return <Link className="group grid min-h-[156px] grid-cols-[5.5rem_minmax(0,1fr)] overflow-hidden rounded-[14px] border border-border bg-card shadow-[var(--shadow-rest)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-project)] focus-visible:ring-2 focus-visible:ring-ring" href={item.href}>
    <div className="relative bg-accent">
      {item.image ? <Image alt={item.image.altText || item.name} className="object-cover transition-transform duration-300 group-hover:scale-[1.035]" fill sizes="96px" src={item.image.url} /> : <div className="grid h-full place-items-center text-primary"><Boxes aria-hidden="true" className="size-7" /></div>}
    </div>
    <div className="flex min-w-0 flex-col justify-between p-4">
      <div><p className="text-xs font-semibold text-clay-strong">مادة مستخدمة</p><h3 className="mt-1 line-clamp-2 text-base font-bold leading-[1.55] group-hover:text-primary">{item.name}</h3></div>
      {item.shortDescription ? <p className="mt-2 line-clamp-2 text-sm leading-[1.75] text-text-secondary">{item.shortDescription}</p> : null}
      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary">التفاصيل<ArrowLeft aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" /></span>
    </div>
  </Link>;
}

export function ArticlesGrid({ items }: { items: ArticleCardItem[] }) {
  const visible = items.slice(0, 3);
  if (!visible.length) return null;
  return <div className="grid max-w-6xl gap-4 md:grid-cols-3">
    {visible.map((item) => <ArticleCard item={item} key={item.id} />)}
  </div>;
}

export function ArticleCard({ item }: { item: ArticleCardItem }) {
  const label = item.articleType ? articleTypeLabels[item.articleType] ?? "دليل" : "دليل";
  return <Link className="group min-w-0 overflow-hidden rounded-[14px] border border-border bg-card shadow-[var(--shadow-rest)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-project)] focus-visible:ring-2 focus-visible:ring-ring" href={item.href}>
    <div className="relative aspect-[16/10] bg-accent">
      {item.image ? <Image alt={item.image.altText || item.title} className="object-cover transition-transform duration-300 group-hover:scale-[1.025]" fill sizes="(min-width: 768px) 33vw, 100vw" src={item.image.url} /> : <div className="absolute inset-0 bg-primary [background-image:linear-gradient(125deg,transparent_0%,color-mix(in_oklch,var(--primary-active)_55%,transparent)_100%),linear-gradient(90deg,color-mix(in_oklch,var(--primary-soft)_12%,transparent)_1px,transparent_1px)] [background-size:auto,48px_100%]" />}
    </div>
    <div className="p-5">
      <p className="text-xs font-semibold text-clay-strong">{label}</p>
      <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-[1.5] group-hover:text-primary">{item.title}</h3>
      {item.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-[1.8] text-text-secondary">{item.excerpt}</p> : null}
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">قراءة الدليل<ArrowLeft aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" /></span>
    </div>
  </Link>;
}

export function DetailCta({ title, description, settings, secondaryHref = "/contact", whatsappInput }: { title: string; description: string; settings: DetailSettings; secondaryHref?: string; whatsappInput?: WhatsAppMessageInput }) {
  const whatsappHref = settings ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, whatsappInput) : "/contact";
  return <section className="relative isolate overflow-hidden rounded-[22px] bg-primary-active px-5 py-8 text-primary-foreground shadow-[var(--shadow-project)] sm:px-8 md:px-10 md:py-11">
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_10%_10%,color-mix(in_oklch,var(--primary)_58%,transparent),transparent_65%),linear-gradient(135deg,color-mix(in_oklch,var(--primary)_30%,var(--primary-active)),var(--primary-active))]" />
    <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:linear-gradient(120deg,color-mix(in_oklch,var(--primary-soft)_12%,transparent)_1px,transparent_1px),linear-gradient(30deg,color-mix(in_oklch,var(--clay)_9%,transparent)_1px,transparent_1px)] [background-size:84px_84px,126px_126px]" />
    <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div><p className="text-sm font-semibold text-primary-soft">جاهزون للتنفيذ</p><h2 className="mt-2 max-w-2xl text-[clamp(1.75rem,3vw,3rem)] font-bold leading-[1.25] text-pretty">{title}</h2><p className="mt-3 max-w-[58ch] leading-[1.85] text-primary-soft/82">{description}</p></div>
      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary-foreground px-5 text-sm font-semibold text-primary-active transition-colors hover:bg-primary-soft focus-visible:outline-primary-soft" href={whatsappHref}><MessageCircle aria-hidden="true" className="size-[18px]" />اطلب عرض سعر</a>
        {settings?.primaryPhone ? <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border border-primary-soft/45 px-5 text-sm font-semibold text-primary-foreground transition-colors hover:border-primary-soft hover:bg-primary/35 focus-visible:outline-primary-soft" dir="ltr" href={phoneHref(settings.primaryPhone)}><Phone aria-hidden="true" className="size-[18px]" /><bdi>{settings.primaryPhone}</bdi></a> : <Link className="inline-flex min-h-12 items-center justify-center rounded-[9px] border border-primary-soft/45 px-5 text-sm font-semibold text-primary-foreground transition-colors hover:border-primary-soft hover:bg-primary/35" href={secondaryHref}>تواصل معنا</Link>}
      </div>
    </div>
  </section>;
}

export function EmptyMediaPattern({ label }: { label: string }) {
  return <div aria-label={label} className="absolute inset-0 bg-primary [background-image:linear-gradient(132deg,transparent_0%,color-mix(in_oklch,var(--primary-active)_68%,transparent)_100%),linear-gradient(90deg,color-mix(in_oklch,var(--primary-soft)_13%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_oklch,var(--primary-soft)_10%,transparent)_1px,transparent_1px)] [background-size:auto,72px_100%,100%_72px]" role="img" />;
}

export function metadataIcon(type: "location" | "date" | "technical" | "durability") {
  if (type === "location") return <MapPin aria-hidden="true" className="size-5" />;
  if (type === "date") return <CalendarDays aria-hidden="true" className="size-5" />;
  if (type === "technical") return <Ruler aria-hidden="true" className="size-5" />;
  return <ShieldCheck aria-hidden="true" className="size-5" />;
}

export function materialItem(id: string, version: { name?: string | null; slug?: string | null; shortDescription?: string | null; heroMedia?: Media | null } | null | undefined): MaterialCardItem | null {
  if (!version?.name || !version.slug) return null;
  return { id, name: version.name, shortDescription: version.shortDescription, href: cmsContentPath("/materials", version.slug), image: version.heroMedia ?? null };
}

export function articleItem(id: string, version: { title?: string | null; slug?: string | null; excerpt?: string | null; articleType?: string | null; heroMedia?: Media | null } | null | undefined): ArticleCardItem | null {
  if (!version?.title || !version.slug) return null;
  return { id, title: version.title, excerpt: version.excerpt, articleType: version.articleType, href: cmsContentPath("/guides", version.slug), image: version.heroMedia ?? null };
}
