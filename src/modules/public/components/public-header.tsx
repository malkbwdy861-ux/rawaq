"use client";

import { Menu, MessageCircle, Phone, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
      <div className="mx-auto flex h-[64px] w-full max-w-[1100px] items-center justify-between gap-3 rounded-full border border-[color-mix(in_oklch,var(--border)_78%,transparent)] bg-[color-mix(in_oklch,var(--card)_96%,transparent)] px-3 shadow-[var(--shadow-float)] sm:px-4 lg:h-[72px] lg:max-w-[1280px] lg:px-5">
        <Link aria-label={`${name}، الرئيسية`} className="flex min-w-0 shrink-0 items-center gap-2.5" href="/">
          {settings?.logoMedia ? <Image alt={settings.logoMedia.altText || name} className="h-9 w-auto max-w-28 object-contain lg:h-10 lg:max-w-36" height={40} src={settings.logoMedia.url} width={144} /> : null}
          <span className="min-w-0"><strong className="block truncate text-sm text-foreground lg:text-[0.9375rem]">{name}</strong><span className="hidden text-[0.6875rem] text-muted-foreground lg:block">تظليل وتنفيذ خارجي</span></span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex">
          {publicNavigationLinks.map(([label, href]) => {
            const active = href === "/" ? isHome : pathname === href;
            return <Link aria-current={active ? "page" : undefined} className={`relative inline-flex min-h-11 items-center px-2.5 text-[0.8125rem] font-semibold transition-colors duration-150 hover:text-primary ${active ? "text-primary" : "text-text-secondary"}`} href={href} key={href}>{label}{active ? <span aria-hidden="true" className="absolute inset-x-3 bottom-1 h-px bg-primary" /> : null}</Link>;
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <a className="hidden min-h-10 items-center gap-1.5 rounded-[9px] bg-primary px-3.5 text-[0.8125rem] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover active:bg-primary-active sm:inline-flex" href={whatsappHref}><MessageCircle aria-hidden="true" className="size-4" />اطلب عرض سعر</a>
          <button aria-controls="public-menu" aria-expanded={menuOpen} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} className="grid size-10 place-items-center rounded-full text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring lg:hidden" onClick={() => setMenuOpen((open) => !open)} type="button">{menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}</button>
        </div>
      </div>

      {menuOpen ? <div className="fixed inset-0 z-300 bg-[color-mix(in_oklch,var(--foreground)_46%,transparent)]" onClick={() => setMenuOpen(false)}>
        <aside aria-label="قائمة التنقل" className="absolute inset-y-0 end-0 flex w-[min(88vw,360px)] flex-col bg-card px-5 pb-6 pt-5 shadow-[0_16px_48px_oklch(22%_0.018_155_/_0.16)]" id="public-menu" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-border pb-5"><strong className="text-base">{name}</strong><button aria-label="إغلاق القائمة" className="grid size-11 place-items-center rounded-full text-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setMenuOpen(false)} type="button"><X aria-hidden="true" className="size-5" /></button></div>
          <nav aria-label="التنقل الرئيسي" className="mt-5 grid">
            {publicNavigationLinks.map(([label, href]) => {
              const active = href === "/" ? isHome : pathname === href;
              return <Link aria-current={active ? "page" : undefined} className={`flex min-h-12 items-center border-b border-border text-sm font-semibold transition-colors ${active ? "text-primary" : "text-foreground hover:text-primary"}`} href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</Link>;
            })}
          </nav>
          <div className="mt-auto grid gap-2 border-t border-border pt-5">
            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary px-4 text-sm font-semibold text-primary-foreground" href={whatsappHref}><MessageCircle aria-hidden="true" className="size-[18px]" />اطلب عرض سعر</a>
            {settings?.primaryPhone ? <a className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-text-secondary" dir="ltr" href={phoneHref(settings.primaryPhone)}><Phone aria-hidden="true" className="size-[18px]" /><bdi>{settings.primaryPhone}</bdi></a> : null}
          </div>
        </aside>
      </div> : null}
    </header>
  );
}
