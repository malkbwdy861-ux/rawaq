import { ArrowUpLeft, Menu, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { buildWhatsAppUrl, phoneHref } from "@/modules/settings/contact";

type PublicSettings = {
  companyName: string;
  companyDescription: string | null;
  primaryPhone: string;
  whatsappNumber: string;
  defaultWhatsappText: string | null;
  logoMedia: { url: string; altText: string | null } | null;
};

const primaryLinks = [
  ["الخدمات", "/services"],
  ["الحلول", "/solutions"],
  ["المواد", "/materials"],
  ["المشاريع", "/projects"],
  ["الأسعار", "/prices"],
  ["الأدلة", "/guides"],
] as const;

export function PublicShell({ children, settings }: { children: ReactNode; settings: PublicSettings | null }) {
  const name = settings?.companyName || "Jeddah Shading";
  const whatsappHref = settings ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText) : "/contact";

  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
      <header className="sticky top-0 z-100 border-b border-border bg-background/95 supports-[backdrop-filter]:bg-background">
        <div className="public-container flex min-h-[72px] items-center justify-between gap-4 lg:min-h-[88px]">
          <Link aria-label={`${name}، الرئيسية`} className="flex min-w-0 items-center gap-3" href="/">
            {settings?.logoMedia ? <Image alt={settings.logoMedia.altText || name} className="h-10 w-auto object-contain" height={40} src={settings.logoMedia.url} width={132} /> : null}
            <span className="min-w-0"><strong className="block truncate text-sm">{name}</strong><span className="hidden text-xs text-muted-foreground sm:block">تظليل وتنفيذ خارجي</span></span>
          </Link>

          <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 xl:flex">
            {primaryLinks.map(([label, href]) => <Link className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-text-secondary transition-colors hover:text-primary" href={href} key={href}>{label}</Link>)}
          </nav>

          <div className="flex items-center gap-2">
            <a className="inline-flex min-h-11 items-center gap-2 rounded-[4px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover lg:min-h-12" href={whatsappHref}><MessageCircle aria-hidden="true" className="size-[18px]" /><span className="hidden sm:inline">تواصل عبر واتساب</span><span className="sm:hidden">واتساب</span></a>
            <details className="group relative xl:hidden">
              <summary aria-label="فتح القائمة" className="grid size-11 cursor-pointer list-none place-items-center rounded-[4px] border border-border-strong bg-card marker:content-none"><Menu aria-hidden="true" className="size-5" /></summary>
              <div className="absolute end-0 top-[calc(100%+12px)] w-[min(88vw,320px)] border border-border bg-popover p-4 shadow-[var(--shadow-float)]">
                <nav aria-label="قائمة الجوال" className="grid">
                  {primaryLinks.map(([label, href]) => <Link className="flex min-h-12 items-center justify-between border-b border-border px-2 font-semibold last:border-b-0" href={href} key={href}>{label}<ArrowUpLeft aria-hidden="true" className="size-4 text-muted-foreground" /></Link>)}
                  <Link className="mt-3 inline-flex min-h-12 items-center justify-center border border-border-strong font-semibold text-primary" href="/about">من نحن</Link>
                </nav>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div className="flex-1" id="main-content">{children}</div>

      <footer className="bg-primary-active text-primary-foreground">
        <div className="public-container grid gap-10 py-12 md:grid-cols-12 md:py-16">
          <div className="md:col-span-5"><p className="text-xl font-bold">{name}</p>{settings?.companyDescription ? <p className="mt-3 max-w-[52ch] text-sm leading-7 text-primary-soft">{settings.companyDescription}</p> : null}</div>
          <nav aria-label="روابط التذييل" className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold md:col-span-4">{primaryLinks.map(([label, href]) => <Link className="min-h-11 py-2 text-primary-soft hover:text-primary-foreground" href={href} key={href}>{label}</Link>)}</nav>
          <div className="grid content-start gap-3 md:col-span-3">
            <Link className="inline-flex min-h-11 items-center gap-2 font-semibold" href="/contact"><MessageCircle aria-hidden="true" className="size-[18px]" />التواصل وطلب الخدمة</Link>
            {settings?.primaryPhone ? <a className="inline-flex min-h-11 items-center gap-2 text-sm text-primary-soft" dir="ltr" href={phoneHref(settings.primaryPhone)}><Phone aria-hidden="true" className="size-[18px]" /><bdi>{settings.primaryPhone}</bdi></a> : null}
            <Link className="inline-flex min-h-11 items-center text-sm text-primary-soft" href="/about">من نحن</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
