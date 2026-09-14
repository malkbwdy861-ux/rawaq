"use client";

import { Menu, Phone, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { WhatsappIcon } from "@/components/icons/whatsapp-icon";
import { buildWhatsAppUrl, phoneHref } from "@/modules/settings/contact";
import { publicNavigationLinks } from "@/modules/public/navigation";

type PublicSettings = {
  companyName: string;
  primaryPhone: string;
  whatsappNumber: string;
  defaultWhatsappText: string | null;
  logoMedia: { url: string; altText: string | null } | null;
};

export function PublicHeader({ settings }: { settings: PublicSettings | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = settings?.companyName || "Jeddah Shading";
  const whatsappHref = settings ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText) : "/contact";
  const isHome = pathname === "/";

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className={`${isHome ? "fixed" : "sticky"} inset-x-0 top-0 z-100 px-3 pt-3 sm:px-5 sm:pt-5 lg:px-8`}>
      <div className="mx-auto w-full max-w-[1100px] overflow-hidden rounded-[16px] border border-border/80 bg-card/95 shadow-[var(--shadow-float)] lg:max-w-[1280px]">
        <div className="flex h-[64px] items-center justify-between gap-3 px-3 sm:px-4 lg:h-[72px] lg:px-5">
          <Link aria-label={`${name}، الرئيسية`} className="flex min-w-0 shrink-0 items-center gap-2.5" href="/">
            {settings?.logoMedia ? <Image alt={settings.logoMedia.altText || name} className="h-9 w-auto max-w-28 object-contain lg:h-10 lg:max-w-36" height={40} src={settings.logoMedia.url} width={144} /> : null}
            <span className="min-w-0"><strong className="block truncate text-sm text-foreground lg:text-[0.9375rem]">{name}</strong><span className="hidden text-[0.6875rem] text-muted-foreground lg:block">تظليل وتنفيذ خارجي</span></span>
          </Link>

          <nav aria-label="التنقل الرئيسي" className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex">
            {publicNavigationLinks.map(([label, href]) => {
              const active = href === "/" ? isHome : pathname === href;
              return <Link aria-current={active ? "page" : undefined} className={`relative inline-flex min-h-11 items-center px-2.5 text-[0.8125rem] font-semibold transition-colors duration-150 hover:text-brand-accent-strong ${active ? "text-brand-accent-strong" : "text-text-secondary"}`} href={href} key={href}>{label}{active ? <span aria-hidden="true" className="absolute inset-x-3 bottom-1 h-px bg-brand-accent" /> : null}</Link>;
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <a className="hidden min-h-10 items-center gap-1.5 rounded-[9px] bg-primary px-3.5 text-[0.8125rem] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover active:bg-primary-active sm:inline-flex" href={whatsappHref}><WhatsappIcon aria-hidden="true" className="size-4" />اطلب عرض سعر</a>
            <button aria-controls="public-menu" aria-expanded={menuOpen} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} className="grid size-11 place-items-center rounded-[9px] text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring lg:hidden" onClick={() => setMenuOpen((open) => !open)} type="button">{menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}</button>
          </div>
        </div>

        {menuOpen ? <div className="border-t border-border px-3 pb-3 pt-2 sm:px-4 sm:pb-4 lg:hidden" id="public-menu">
          <nav aria-label="التنقل الرئيسي" className="grid grid-cols-2 gap-1">
            {publicNavigationLinks.map(([label, href]) => {
              const active = href === "/" ? isHome : pathname === href;
              return <Link aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center rounded-[9px] px-3 text-sm font-semibold transition-colors duration-150 ${active ? "bg-secondary text-brand-accent-strong" : "text-foreground hover:bg-secondary hover:text-brand-accent-strong"}`} href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</Link>;
            })}
          </nav>
          <div className="mt-2 grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary px-4 text-sm font-semibold text-primary-foreground" href={whatsappHref}><WhatsappIcon aria-hidden="true" className="size-[18px]" />اطلب عرض سعر</a>
            {settings?.primaryPhone ? <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border border-border-strong px-4 text-sm font-semibold text-text-secondary" dir="ltr" href={phoneHref(settings.primaryPhone)}><Phone aria-hidden="true" className="size-[18px]" /><bdi>{settings.primaryPhone}</bdi></a> : null}
          </div>
        </div> : null}
      </div>
    </header>
  );
}
