import { ArrowLeft, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProjectCategoryIcon } from "@/modules/project-categories/icons";

export type FeaturedProjectItem = {
  id: string;
  title: string;
  shortDescription: string;
  href: string | null;
  image: { url: string; altText: string } | null;
  location?: string;
  category?: { name: string; iconKey: string };
};

export function FeaturedProjects({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  items,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: FeaturedProjectItem[];
}) {
  const projects = items.slice(0, 5);
  if (!projects.length) return null;

  const [featured, ...supporting] = projects;
  const isSingle = projects.length === 1;
  const isPair = projects.length === 2;

  return (
    <section aria-labelledby="featured-projects-title" className="relative overflow-hidden bg-muted px-4 py-16 md:px-6 md:py-20 lg:px-8 lg:py-24">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
      <div className="mx-auto max-w-[90rem]">
        <header className="grid items-end gap-6 border-b border-border pb-7 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:pb-9">
          <div className="max-w-3xl text-start">
            {eyebrow ? <p className="flex items-center gap-3 text-sm font-semibold text-clay-strong before:h-px before:w-9 before:bg-clay">{eyebrow}</p> : null}
            <h2 className="mt-2 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.2] text-pretty" id="featured-projects-title">{title}</h2>
            {description ? <p className="mt-3 max-w-[62ch] text-[1.0625rem] leading-[1.8] text-text-secondary">{description}</p> : null}
          </div>
          {ctaLabel && ctaHref ? <Link className="group inline-flex min-h-12 w-fit items-center gap-3 rounded-[9px] border border-border-strong bg-background px-5 text-sm font-semibold text-brand-accent-strong transition-colors duration-150 hover:border-brand-accent-strong hover:bg-brand-accent-soft focus-visible:outline-ring" href={ctaHref}>{ctaLabel}<ArrowLeft aria-hidden="true" className="size-[18px] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-1" /></Link> : null}
        </header>

        <div className={`mt-6 md:mt-8 ${isSingle ? "mx-auto max-w-4xl" : isPair ? "grid gap-4 lg:grid-cols-2 lg:gap-5" : "grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-5"}`}>
          <ProjectCard balanced={isSingle || isPair} featured={!isPair} item={featured} />
          {supporting.length ? (
            <div className={`${isPair ? "contents" : `grid gap-4 sm:grid-cols-2 lg:auto-rows-fr lg:gap-5 ${supporting.length === 2 ? "lg:grid-cols-1" : ""}`}`}>
              {supporting.map((project, index) => <ProjectCard balanced={isPair} className={!isPair && supporting.length === 3 && index === 2 ? "sm:col-span-2" : undefined} featured={isPair} item={project} key={project.id} />)}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ProjectCard({ item, featured = false, balanced = false, archive = false, className = "" }: { item: FeaturedProjectItem; featured?: boolean; balanced?: boolean; archive?: boolean; className?: string }) {
  const Heading = archive ? "h2" : "h3";
  const content = (
    <>
      {item.image ? <Image alt={item.image.altText} className="object-cover object-center transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.025]" fill quality={featured ? 86 : 80} sizes={archive ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : featured ? "(min-width: 1440px) 850px, (min-width: 1024px) 58vw, 100vw" : "(min-width: 1440px) 340px, (min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"} src={item.image.url} /> : <div aria-hidden="true" className="absolute inset-0 bg-brand-secondary [background-image:linear-gradient(125deg,transparent,var(--brand-accent-strong))]" />}
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-brand-secondary via-brand-secondary/35 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
      {item.category ? <ProjectBadge category={item.category} featured={featured} /> : null}
      <div className={`relative z-10 mt-auto flex items-end gap-4 text-brand-secondary-foreground ${featured ? "p-6 sm:p-8 lg:p-10" : "p-5 sm:p-6"}`}>
        <div className="min-w-0 flex-1 text-start">
          {item.location ? <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-brand-secondary-foreground/75"><MapPin aria-hidden="true" className="size-3.5" />{item.location}</p> : null}
          <Heading className={`${featured ? "text-[clamp(1.625rem,2.4vw,2.25rem)]" : "text-xl sm:text-[1.375rem]"} line-clamp-2 font-bold leading-[1.4]`}>{item.title}</Heading>
          <p
            className={`${featured ? "max-w-[48ch]" : ""} mt-2 overflow-hidden text-[0.9375rem] font-normal leading-[1.7] text-brand-secondary-foreground/80`}
            style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: featured ? 3 : 2 }}
          >
            {item.shortDescription}
          </p>
        </div>
        <span aria-hidden="true" className={`${featured ? "size-11" : "size-10"} grid shrink-0 place-items-center rounded-full border border-primary-foreground/25 bg-brand-secondary/90 transition-[background-color,transform] duration-300 group-hover:-translate-x-1 group-hover:bg-brand-secondary`}><ArrowLeft className="size-4" /></span>
      </div>
    </>
  );
  const sharedClassName = `group relative isolate flex overflow-hidden rounded-[12px] bg-brand-secondary shadow-[var(--shadow-project)] outline-none ring-offset-2 ring-offset-muted transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-[3px] hover:shadow-[var(--shadow-project-hover)] focus-visible:ring-2 focus-visible:ring-ring ${archive ? "min-w-0 aspect-[4/3] min-h-[270px]" : featured ? `aspect-[4/5] sm:aspect-[16/9] ${balanced ? "lg:aspect-[4/3]" : "lg:aspect-auto lg:min-h-[620px]"}` : "aspect-[4/3] min-h-[280px] sm:min-h-[300px] lg:aspect-auto lg:min-h-0"} ${className}`;

  return item.href ? <Link className={sharedClassName} href={item.href}>{content}</Link> : <article className={sharedClassName}>{content}</article>;
}

function ProjectBadge({ category, featured }: { category: NonNullable<FeaturedProjectItem["category"]>; featured: boolean }) {
  return <span className={`absolute start-4 top-4 z-10 inline-flex min-h-8 max-w-[calc(100%_-_2rem)] items-center gap-2 rounded-[8px] border border-brand-secondary-foreground/15 bg-brand-secondary/90 px-3 text-xs font-semibold text-brand-secondary-foreground shadow-[var(--shadow-rest)] ${featured ? "sm:start-6 sm:top-6" : "sm:start-5 sm:top-5"}`}><ProjectCategoryIcon className="size-3.5 shrink-0" iconKey={category.iconKey} /><span className="truncate">{category.name}</span></span>;
}
