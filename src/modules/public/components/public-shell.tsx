import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { WhatsappIcon } from "@/components/icons/whatsapp-icon";
import { buildWhatsAppUrl, phoneHref } from "@/modules/settings/contact";
import { footerNavigationGroups } from "@/modules/public/navigation";
import { PublicHeader } from "./public-header";

type PublicSettings = {
  companyName: string;
  companyDescription: string | null;
  primaryPhone: string;
  whatsappNumber: string;
  defaultWhatsappText: string | null;
  address: string | null;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    x?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  logoMedia: { url: string; altText: string | null } | null;
};

const socialItems = [
  ["facebook", "فيسبوك", "ف"],
  ["instagram", "إنستغرام", "ان"],
  ["x", "منصة X", "X"],
  ["tiktok", "تيك توك", "تك"],
  ["youtube", "يوتيوب", "يو"],
  ["linkedin", "لينكدإن", "in"],
] as const;

export function PublicShell({ children, settings }: { children: ReactNode; settings: PublicSettings | null }) {
  const name = settings?.companyName || "Jeddah Shading";
  const whatsappHref = settings ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText) : "/contact";
  const socialLinks = socialItems.flatMap(([key, label, mark]) => {
    const href = settings?.socialLinks?.[key];
    return href ? [{ href, label, mark }] : [];
  });

  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
      <PublicHeader settings={settings} />

      <div className="flex-1" id="main-content">{children}</div>

      <footer className="public-footer overflow-hidden text-brand-secondary-foreground">
        <div className="public-container relative z-10 py-10 sm:py-12 lg:py-14">
          <div className="grid gap-9 lg:grid-cols-[minmax(0,0.27fr)_minmax(0,0.45fr)_minmax(0,0.28fr)] lg:gap-10 xl:gap-12">
            <section aria-label="عن الشركة" className="order-1 max-w-[32rem]">
              <Link aria-label={`${name}، الرئيسية`} className="inline-flex min-w-0 items-center gap-3" href="/">
                {settings?.logoMedia ? <Image alt={settings.logoMedia.altText || name} className="h-10 w-auto max-w-32 object-contain lg:h-11 lg:max-w-36" height={44} src={settings.logoMedia.url} width={144} /> : null}
                <span className="min-w-0">
                  <strong className="block truncate text-lg font-bold leading-[1.45] text-brand-secondary-foreground lg:text-xl">{name}</strong>
                  <span className="mt-0.5 block text-xs font-semibold text-brand-secondary-muted/80">تظليل وتنفيذ خارجي</span>
                </span>
              </Link>

              {settings?.companyDescription ? <p className="mt-4 max-w-[42ch] text-sm leading-7 text-brand-secondary-muted/80">{settings.companyDescription}</p> : null}

              {socialLinks.length ? <div className="mt-5 flex flex-wrap gap-2" aria-label="روابط التواصل الاجتماعي">
                {socialLinks.map(({ href, label, mark }) => <a aria-label={label} className="grid size-10 place-items-center rounded-[9px] border border-brand-secondary-muted/20 bg-brand-secondary-hover/40 text-[0.72rem] font-semibold text-brand-secondary-muted transition-colors duration-150 hover:border-brand-secondary-muted/45 hover:bg-brand-secondary-hover hover:text-brand-secondary-foreground" href={href} key={label} rel="noreferrer" target="_blank"><span aria-hidden="true" dir="ltr">{mark}</span></a>)}
              </div> : null}
            </section>

            <nav aria-label="روابط التذييل" className="order-3 grid gap-7 sm:grid-cols-2 lg:order-2 lg:grid-cols-3 lg:gap-6">
              {footerNavigationGroups.map((group) => <section className="min-w-0" key={group.title}>
                <h2 className="text-sm font-semibold text-brand-secondary-foreground">{group.title}</h2>
                <ul className="mt-3.5 grid gap-2.5 text-sm">
                  {group.links.map(([label, href]) => <li key={`${group.title}-${label}`}><Link className="inline-flex min-h-8 items-center font-normal text-brand-secondary-muted/80 transition-colors duration-150 hover:text-brand-secondary-foreground" href={href}>{label}</Link></li>)}
                </ul>
              </section>)}
            </nav>

            <section aria-labelledby="footer-contact-title" className="order-2 border-y border-brand-secondary-muted/15 py-6 lg:order-3 lg:self-start lg:border-y-0 lg:border-s lg:py-0 lg:ps-8">
              <h2 className="text-base font-semibold leading-[1.5] text-brand-secondary-foreground" id="footer-contact-title">تواصل معنا واطلب الخدمة</h2>
              <p className="mt-2 max-w-[38ch] text-sm leading-7 text-brand-secondary-muted/80">شاركنا نوع التظليل والموقع، ونحدد لك الخطوة المناسبة للتنفيذ.</p>

              <div className="mt-5 grid gap-3 sm:max-w-[21rem]">
                <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-brand-secondary-foreground px-5 text-sm font-semibold text-brand-secondary transition-colors duration-150 hover:bg-brand-secondary-muted focus-visible:outline-ring" href={whatsappHref}><WhatsappIcon aria-hidden="true" className="size-[18px]" />تواصل عبر واتساب</a>
                {settings?.primaryPhone ? <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border border-brand-secondary-muted/45 px-5 text-sm font-semibold text-brand-secondary-foreground transition-colors duration-150 hover:border-brand-secondary-muted hover:bg-brand-secondary-hover focus-visible:outline-ring" dir="ltr" href={phoneHref(settings.primaryPhone)}><Phone aria-hidden="true" className="size-[18px]" strokeWidth={1.8} /><bdi>{settings.primaryPhone}</bdi></a> : null}
              </div>

              <p className="mt-5 flex max-w-[38ch] items-start gap-2 text-sm leading-7 text-brand-secondary-muted/80"><MapPin aria-hidden="true" className="mt-1 size-[18px] shrink-0 text-brand-secondary-muted" strokeWidth={1.7} />{settings?.address || "جدة، المملكة العربية السعودية"}</p>
            </section>
          </div>

          <div className="mt-9 flex flex-col gap-2 border-t border-brand-secondary-muted/15 pt-5 text-sm text-brand-secondary-muted/75 sm:flex-row sm:items-center sm:justify-between lg:mt-10">
            <span>© 2026 {name} — جميع الحقوق محفوظة</span>
            <span>
              تطوير م/ عبدالله أنور - <a className="font-medium text-brand-secondary-foreground transition-colors hover:text-brand-secondary-muted" dir="ltr" href={phoneHref("+967778120888")}><bdi>+967778120888</bdi></a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
