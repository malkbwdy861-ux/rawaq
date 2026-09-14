import Image from "next/image";

import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";

type ArchivePageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  currentLabel: string;
  currentHref: string;
  image: { url: string; altText: string } | null;
  imagePosition?: string;
};

export function ArchivePageHero({ eyebrow, title, description, currentLabel, currentHref, image, imagePosition = "center" }: ArchivePageHeroProps) {
  return (
    <section className="relative isolate flex h-[390px] w-full overflow-hidden bg-brand-secondary text-brand-secondary-foreground md:h-[460px]" aria-labelledby="archive-hero-title">
        {image ? (
          <Image
            alt={image.altText}
            className="-z-20 object-cover"
            fill
            priority
            sizes="(min-width: 1280px) 1280px, calc(100vw - 32px)"
            src={image.url}
            style={{ objectPosition: imagePosition }}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[linear-gradient(130deg,var(--brand-secondary),var(--brand-accent-strong))]" />
        )}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-l from-brand-secondary via-brand-secondary/70 to-transparent" />

        <div className="mx-auto flex w-full max-w-[1440px] flex-col px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <Breadcrumbs
            className="text-brand-secondary-muted"
            items={[{ label: "الرئيسية", href: "/" }, { label: currentLabel, href: currentHref }]}
          />
          <header className="flex max-w-[760px] flex-1 flex-col justify-center pb-8 pt-8 md:pb-10 md:pt-10">
            <p className="flex items-center gap-3 text-sm font-semibold text-brand-secondary-muted before:h-px before:w-9 before:bg-clay">{eyebrow}</p>
            <h1 className="mt-5 max-w-[18ch] text-[clamp(2.125rem,9vw,2.75rem)] font-bold leading-[1.22] text-pretty md:text-[clamp(2.5rem,4.2vw,3.5rem)]" id="archive-hero-title">{title}</h1>
            <p className="mt-5 max-w-[48ch] text-base leading-[1.8] text-brand-secondary-muted md:text-lg">{description}</p>
          </header>
        </div>
    </section>
  );
}
