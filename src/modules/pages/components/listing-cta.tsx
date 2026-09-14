import { WhatsappIcon } from "@/components/icons/whatsapp-icon";

type ListingCtaProps = {
  title: string;
  description: string;
  href: string;
  label?: string;
};

export function ListingCta({ title, description, href, label = "اطلب عرض سعر" }: ListingCtaProps) {
  return (
    <section className="bg-background px-4 pb-16 pt-4 md:px-8 md:pb-20 lg:pb-24" aria-labelledby="listing-cta-title">
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[16px] bg-brand-secondary px-5 py-11 text-brand-secondary-foreground sm:px-8 md:px-12 md:py-14">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_25%,var(--brand-accent),transparent_38%),linear-gradient(125deg,var(--brand-secondary),var(--brand-secondary-hover))] opacity-70" />
        <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.3]" id="listing-cta-title">{title}</h2>
            <p className="mt-3 max-w-[52ch] leading-[1.8] text-brand-secondary-muted">{description}</p>
          </div>
          <a className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[9px] bg-brand-secondary-foreground px-5 text-sm font-semibold text-brand-secondary transition-colors hover:bg-brand-secondary-muted focus-visible:outline-ring" href={href}>
            <WhatsappIcon aria-hidden="true" className="size-[18px]" />
            {label}
          </a>
        </div>
      </div>
    </section>
  );
}
