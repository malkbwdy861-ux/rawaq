import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type MaterialArchiveCardItem = {
  id: string;
  name: string;
  description: string;
  href: string;
  image: { url: string; altText: string } | null;
};

export function MaterialArchiveCard({ item, index }: { item: MaterialArchiveCardItem; index: number }) {
  return (
    <Link
      aria-label={`${item.name}: ${item.description}`}
      className={`group grid min-h-44 gap-5 py-6 outline-none transition-colors hover:bg-muted/55 focus-visible:bg-muted/55 sm:items-center sm:px-4 md:gap-7 md:py-7 ${item.image ? "sm:grid-cols-[11rem_minmax(0,1fr)_3rem] lg:grid-cols-[14rem_minmax(0,1fr)_3rem]" : "sm:grid-cols-[minmax(0,1fr)_3rem]"}`}
      href={item.href}
    >
      {item.image ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-muted">
          <Image alt={item.image.altText} className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.035] motion-reduce:transition-none" fill sizes="(min-width: 1024px) 224px, (min-width: 640px) 176px, 100vw" src={item.image.url} />
        </div>
      ) : null}
      <div className="min-w-0 self-center">
        <p className="flex items-center gap-3 text-xs font-semibold text-clay-strong"><span aria-hidden="true" className="h-px w-7 bg-clay" /><bdi dir="ltr">{String(index + 1).padStart(2, "0")}</bdi><span>خيار مادة</span></p>
        <h2 className="mt-2 text-[clamp(1.35rem,2.4vw,1.8rem)] font-bold leading-[1.4] text-pretty transition-colors group-hover:text-primary">{item.name}</h2>
        <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-[1.85] text-text-secondary md:text-base">{item.description}</p>
        <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary sm:hidden">عرض خصائص المادة<ArrowLeft aria-hidden="true" className="size-4" /></span>
      </div>
      <span aria-hidden="true" className="hidden size-11 place-items-center rounded-full border border-border-strong bg-card text-primary transition-[background-color,border-color,transform] duration-300 group-hover:-translate-x-1 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground sm:grid"><ArrowLeft className="size-[18px]" /></span>
    </Link>
  );
}
