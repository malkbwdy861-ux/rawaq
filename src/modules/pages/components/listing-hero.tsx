import Image from "next/image";

import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";

type ListingHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  currentLabel: string;
  currentHref: string;
  image: { url: string; altText: string } | null;
};

export function ListingHero({ eyebrow, title, description, currentLabel, currentHref, image }: ListingHeroProps) {
  return (
    <section className="public-container pt-5 md:pt-8" aria-labelledby="listing-hero-title">
      <div className="relative isolate flex min-h-[360px] overflow-hidden rounded-[16px] bg-primary-active text-primary-foreground md:min-h-[430px]">
        {image ? (
          <Image
            alt={image.altText}
            className="-z-20 object-cover object-center"
            fill
            priority
            sizes="(min-width: 1280px) 1280px, calc(100vw - 32px)"
            src={image.url}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[linear-gradient(130deg,var(--primary-active),var(--primary))]" />
        )}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_left,color-mix(in_oklch,var(--primary-active)_82%,transparent)_0%,color-mix(in_oklch,var(--primary-active)_62%,transparent)_38%,color-mix(in_oklch,var(--primary)_28%,transparent)_72%,color-mix(in_oklch,var(--primary-active)_14%,transparent)_100%)]" />

        <div className="flex w-full flex-col justify-between px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <Breadcrumbs
            className="text-primary-soft"
            items={[{ label: "الرئيسية", href: "/" }, { label: currentLabel, href: currentHref }]}
          />
          <header className="max-w-[760px] pb-2 pt-16 md:pb-4">
            <p className="flex items-center gap-3 text-sm font-semibold text-primary-soft before:h-px before:w-9 before:bg-clay">{eyebrow}</p>
            <h1 className="mt-4 max-w-[18ch] text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.22] text-pretty" id="listing-hero-title">{title}</h1>
            <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-[1.85] text-primary-soft md:text-lg">{description}</p>
          </header>
        </div>
      </div>
    </section>
  );
}
