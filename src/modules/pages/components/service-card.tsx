import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type ServiceCardItem = {
  id: string;
  title: string;
  description: string;
  href: string | null;
  image: { url: string; altText: string } | null;
};

export const serviceTileClasses = [
  "min-h-[420px] md:col-span-6 md:min-h-[460px] lg:col-span-6 lg:row-span-2 lg:min-h-0",
  "min-h-[330px] md:col-span-3 md:min-h-[300px] lg:col-span-3 lg:min-h-0",
  "min-h-[300px] md:col-span-3 md:min-h-[300px] lg:col-span-3 lg:min-h-0",
  "min-h-[270px] md:col-span-4 md:min-h-[260px] lg:col-span-4 lg:min-h-0",
  "min-h-[245px] md:col-span-2 md:min-h-[260px] lg:col-span-2 lg:min-h-0",
] as const;

export function ServiceCard({ item, index, featured = false, className = "" }: { item: ServiceCardItem; index: number; featured?: boolean; className?: string }) {
  const Heading = featured ? "h3" : "h2";
  const content = (
    <>
      {item.image ? (
        <Image alt={item.image.altText} className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.035]" fill sizes={featured ? index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"} src={item.image.url} />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-primary [background-image:linear-gradient(125deg,transparent_0%,color-mix(in_oklch,var(--primary-active)_48%,transparent)_100%),linear-gradient(90deg,color-mix(in_oklch,var(--primary-soft)_12%,transparent)_1px,transparent_1px)] [background-size:auto,48px_100%]" />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--primary-active)_90%,transparent)_0%,color-mix(in_oklch,var(--primary-active)_62%,transparent)_38%,color-mix(in_oklch,var(--primary)_9%,transparent)_76%)] transition-opacity duration-300 group-hover:opacity-90" />
      <div className="relative z-10 flex h-full flex-col justify-end p-5 text-primary-foreground md:p-6">
        <div className={`flex gap-4 ${featured && index === 4 ? "items-end md:flex-col md:items-start" : "items-end justify-between"}`}>
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-3 text-primary-soft"><span className="h-px w-6 bg-clay" /><span className="text-xs font-semibold tabular-nums" dir="ltr">{String(index + 1).padStart(2, "0")}</span></div>
            <Heading className={`${featured && index === 0 ? "text-[clamp(1.75rem,3vw,2.5rem)]" : "text-[clamp(1.25rem,2vw,1.75rem)]"} ${featured ? "" : "line-clamp-2"} font-bold leading-[1.35]`}>{item.title}</Heading>
            <p className={`mt-2 max-w-[38ch] leading-[1.7] text-primary-soft ${featured ? "" : "line-clamp-3"} ${featured && index === 4 ? "text-xs md:text-sm" : "text-sm md:text-[0.9375rem]"}`}>{item.description}</p>
          </div>
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border border-primary-soft/60 bg-primary-active/50 transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-1 group-hover:bg-primary-active"><ArrowLeft className="size-[18px]" /></span>
        </div>
      </div>
    </>
  );
  const classes = `group relative isolate overflow-hidden rounded-[12px] bg-primary-active outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring ${featured ? "" : "min-h-[290px]"} ${className}`;
  return item.href ? <Link aria-label={`${item.title}: ${item.description}`} className={classes} href={item.href}>{content}</Link> : <article className={classes}>{content}</article>;
}
