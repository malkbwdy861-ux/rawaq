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
    <section className="relative isolate flex h-[390px] w-full overflow-hidden bg-primary-active text-primary-foreground md:h-[460px]" aria-labelledby="archive-hero-title">
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
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[linear-gradient(130deg,var(--primary-active),var(--primary))]" />
        )}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_left,color-mix(in_oklch,var(--primary-active)_88%,transparent)_0%,color-mix(in_oklch,var(--primary-active)_68%,transparent)_38%,color-mix(in_oklch,var(--foreground)_30%,transparent)_68%,color-mix(in_oklch,var(--primary-active)_12%,transparent)_100%)]" />

        <div className="mx-auto flex w-full max-w-[1440px] flex-col px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <Breadcrumbs
            className="text-primary-soft"
            items={[{ label: "الرئيسية", href: "/" }, { label: currentLabel, href: currentHref }]}
          />
          <header className="flex max-w-[760px] flex-1 flex-col justify-center pb-8 pt-8 md:pb-10 md:pt-10">
            <p className="flex items-center gap-3 text-sm font-semibold text-primary-soft before:h-px before:w-9 before:bg-clay">{eyebrow}</p>
            <h1 className="mt-5 max-w-[18ch] text-[clamp(2.125rem,9vw,2.75rem)] font-bold leading-[1.22] text-pretty md:text-[clamp(2.5rem,4.2vw,3.5rem)]" id="archive-hero-title">{title}</h1>
            <p className="mt-5 max-w-[48ch] text-base leading-[1.8] text-primary-soft md:text-lg">{description}</p>
          </header>
        </div>
    </section>
  );
}
