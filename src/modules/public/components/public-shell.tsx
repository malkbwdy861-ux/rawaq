import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { phoneHref } from "@/modules/settings/contact";
import { PublicHeader } from "./public-header";

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
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
      <PublicHeader settings={settings} />

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
