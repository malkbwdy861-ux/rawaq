"use client";

import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type FeaturedSolutionItem = {
  id: string;
  title: string;
  shortDescription: string;
  href: string | null;
  image: { url: string; altText: string } | null;
};

export function FeaturedSolutions({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: FeaturedSolutionItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [desktopLayout, setDesktopLayout] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const pointerStart = useRef<number | null>(null);

  const total = items.length;
  const goTo = (index: number) => setActiveIndex(Math.max(0, Math.min(total - 1, index)));

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setReducedMotion(media.matches);
      if (media.matches) setAutoplayPaused(true);
    };
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1120px)");
    const updateLayout = () => setDesktopLayout(media.matches);
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!desktopLayout) return;

    const visibility = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visibility.set(entry.target, entry.intersectionRatio);
        let nextIndex = 0;
        let largestRatio = -1;
        panelRefs.current.forEach((panel, index) => {
          const ratio = panel ? visibility.get(panel) ?? 0 : 0;
          if (ratio > largestRatio) {
            largestRatio = ratio;
            nextIndex = index;
          }
        });
        if (largestRatio > 0) setActiveIndex(nextIndex);
      },
      { rootMargin: "-18% 0px -18% 0px", threshold: [0.15, 0.35, 0.55, 0.75] },
    );
    panelRefs.current.forEach((panel) => panel && observer.observe(panel));
    return () => observer.disconnect();
  }, [desktopLayout]);

  useEffect(() => {
    if (desktopLayout || total < 2 || autoplayPaused || interacting || !inView) return;
    const timer = window.setTimeout(() => setActiveIndex((current) => (current + 1) % total), 5200);
    return () => window.clearTimeout(timer);
  }, [activeIndex, autoplayPaused, desktopLayout, inView, interacting, total]);

  const scrollToPanel = (index: number) => {
    setActiveIndex(index);
    panelRefs.current[index]?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  };

  const endSwipe = (clientX: number) => {
    if (pointerStart.current === null) return;
    const distance = clientX - pointerStart.current;
    if (Math.abs(distance) > 48) goTo(activeIndex + (distance > 0 ? 1 : -1));
    pointerStart.current = null;
    setInteracting(false);
  };

  return (
    <section
      aria-labelledby="featured-solutions-title"
      className="relative isolate overflow-clip bg-brand-secondary text-brand-secondary-foreground"
      ref={sectionRef}
    >
      <h2 className="sr-only" id="featured-solutions-title">{title}</h2>

      <div className="min-[1120px]:hidden">
        <div
          aria-roledescription="عارض شرائح"
          className="relative h-[clamp(580px,76svh,760px)] min-h-[70svh] overflow-hidden touch-pan-y"
          onPointerCancel={() => { pointerStart.current = null; setInteracting(false); }}
          onPointerDown={(event) => { pointerStart.current = event.clientX; setInteracting(true); event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerUp={(event) => endSwipe(event.clientX)}
          role="region"
        >
          <div
            className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none"
            dir="rtl"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <SolutionCard active={index === activeIndex} index={index} item={item} key={item.id} total={total} variant="mobile" />
            ))}
          </div>

          {total > 1 ? <div className="absolute bottom-7 start-5 z-20 flex items-center gap-1 sm:bottom-9 sm:start-8">
            <button aria-label={autoplayPaused ? "تشغيل العرض التلقائي" : "إيقاف العرض التلقائي"} className="grid size-11 place-items-center rounded-[9px] border border-brand-secondary-muted/40 bg-brand-secondary/70 transition-colors hover:bg-brand-secondary-hover focus-visible:outline-ring" onClick={() => setAutoplayPaused((paused) => !paused)} type="button">{autoplayPaused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}</button>
            <button aria-disabled={activeIndex === 0} aria-label="الحل السابق" className="grid size-11 place-items-center rounded-[9px] border border-brand-secondary-muted/40 bg-brand-secondary/70 transition-colors hover:bg-brand-secondary-hover focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-brand-secondary/70" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)} type="button"><ArrowRight aria-hidden="true" className="size-[18px]" /></button>
            <button aria-disabled={activeIndex === total - 1} aria-label="الحل التالي" className="grid size-11 place-items-center rounded-[9px] border border-brand-secondary-muted/40 bg-brand-secondary/70 transition-colors hover:bg-brand-secondary-hover focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-brand-secondary/70" disabled={activeIndex === total - 1} onClick={() => goTo(activeIndex + 1)} type="button"><ArrowLeft aria-hidden="true" className="size-[18px]" /></button>
          </div> : null}
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1440px] grid-cols-[minmax(280px,34%)_minmax(0,66%)] min-[1120px]:grid">
        <aside className="relative px-8 xl:px-12">
          <div className="sticky top-24 flex min-h-[calc(100vh-6rem)] flex-col justify-center py-10">
            <header className="max-w-[390px]">
              <p className="flex items-center gap-3 text-sm font-semibold text-brand-secondary-muted before:h-px before:w-9 before:bg-clay">الحلول المميزة</p>
              <h2 className="mt-4 text-[clamp(1.75rem,2.3vw,2.5rem)] font-bold leading-[1.3] text-pretty">{title}</h2>
              {description ? <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-[1.8] text-brand-secondary-muted">{description}</p> : null}
            </header>
            <nav aria-label="الحلول المميزة" className="mt-8 border-y border-brand-secondary-muted/20">
              {items.map((item, index) => {
                const active = index === activeIndex;
                return <button aria-current={active ? "true" : undefined} className={`group flex min-h-14 w-full items-center gap-4 border-b border-brand-secondary-muted/15 px-3 text-start transition-colors duration-150 last:border-b-0 focus-visible:outline-ring xl:min-h-16 ${active ? "bg-primary text-primary-foreground" : "text-brand-secondary-muted hover:bg-brand-secondary-hover hover:text-brand-secondary-foreground"}`} key={item.id} onClick={() => scrollToPanel(index)} type="button">
                  <span className={`text-xs font-semibold tabular-nums transition-colors ${active ? "text-clay-strong" : "text-brand-secondary-muted/65"}`} dir="ltr">{number(index + 1)}</span>
                  <span className={`min-w-0 flex-1 leading-[1.5] ${active ? "font-bold" : "font-medium"}`}>{item.title}</span>
                  <ArrowLeft aria-hidden="true" className={`size-4 shrink-0 transition-[opacity,transform] duration-300 ${active ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"}`} />
                </button>;
              })}
            </nav>
          </div>
        </aside>

        <div className="border-s border-brand-secondary-muted/15 bg-brand-secondary p-5 xl:p-8">
          {items.map((item, index) => {
            const active = index === activeIndex;
            return <SolutionCard active={active} index={index} item={item} key={item.id} panelRef={(node) => { panelRefs.current[index] = node; }} total={total} variant="desktop" />;
          })}
        </div>
      </div>
    </section>
  );
}

export function SolutionCard({ item, index, total = 1, active = true, variant = "archive", panelRef }: { item: FeaturedSolutionItem; index: number; total?: number; active?: boolean; variant?: "mobile" | "desktop" | "archive"; panelRef?: (node: HTMLElement | null) => void }) {
  if (variant === "mobile") {
    return <article aria-hidden={!active} aria-label={`${index + 1} من ${total}: ${item.title}`} aria-roledescription="شريحة" className="relative isolate h-full w-full shrink-0 overflow-hidden" dir="rtl" inert={!active}>
      <SolutionMedia active={active} image={item.image} title={item.title} sizes="100vw" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-brand-secondary via-brand-secondary/65 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-24 pt-7 sm:px-8 sm:pb-28"><p className="flex items-center gap-3 text-sm font-semibold text-brand-secondary-muted before:h-px before:w-8 before:bg-clay">الحلول المميزة</p><SolutionCardText item={item} index={index} total={total} variant="mobile" /></div>
    </article>;
  }

  if (variant === "desktop") {
    return <article className="relative isolate mb-8 min-h-[clamp(680px,78svh,900px)] overflow-hidden rounded-[2px] last:mb-0" ref={panelRef}>
      <SolutionMedia active={active} image={item.image} title={item.title} sizes="(min-width: 1440px) 950px, 66vw" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-brand-secondary via-brand-secondary/60 to-transparent" />
      <div className="relative z-10 flex min-h-[clamp(680px,78svh,900px)] flex-col justify-end p-8 text-right xl:p-12"><SolutionCardText item={item} index={index} total={total} variant="desktop" /></div>
    </article>;
  }

  return <article className="group relative isolate flex min-w-0 aspect-[4/3] min-h-[290px] overflow-hidden rounded-[12px] bg-brand-secondary text-brand-secondary-foreground shadow-[var(--shadow-project)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-[3px] hover:shadow-[var(--shadow-project-hover)]">
    <SolutionMedia active image={item.image} title={item.title} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
    <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-brand-secondary via-brand-secondary/65 to-transparent" />
    <div className="relative z-10 mt-auto w-full p-5 sm:p-6"><SolutionCardText item={item} index={index} total={total} variant="archive" /></div>
  </article>;
}

function SolutionCardText({ item, index, total, variant }: { item: FeaturedSolutionItem; index: number; total: number; variant: "mobile" | "desktop" | "archive" }) {
  const Heading = variant === "archive" ? "h2" : "h3";
  return <div className={variant === "mobile" ? "max-w-[580px] text-right" : undefined}>
    <p className={`${variant === "archive" ? "mb-2 text-xs" : "mb-4 text-sm"} text-start font-semibold tabular-nums text-brand-secondary-muted`}><bdi dir="ltr">{number(index + 1)} / {number(total)}</bdi></p>
    <Heading className={`${variant === "desktop" ? "max-w-[760px] text-[clamp(2rem,3vw,3.5rem)] leading-[1.22]" : variant === "mobile" ? "line-clamp-2 text-[clamp(1.875rem,7vw,2.25rem)] leading-[1.25]" : "line-clamp-2 text-[clamp(1.35rem,2vw,1.75rem)] leading-[1.35]"} font-bold text-pretty`}>{item.title}</Heading>
    <p className={`${variant === "desktop" ? "mt-5 max-w-[58ch] text-[1.0625rem] leading-[1.85] xl:text-lg" : variant === "mobile" ? "mt-4 line-clamp-3 max-w-[48ch] text-[1.0625rem] leading-[1.8]" : "mt-2 line-clamp-2 max-w-[48ch] text-sm leading-[1.75]"} text-brand-secondary-muted`}>{item.shortDescription}</p>
    <SolutionLink compact={variant === "archive"} href={item.href} />
  </div>;
}

function SolutionMedia({ active, image, title, sizes }: { active: boolean; image: FeaturedSolutionItem["image"]; title: string; sizes: string }) {
  if (!image) return <div aria-hidden="true" className="absolute inset-0 bg-brand-secondary [background-image:linear-gradient(132deg,transparent,var(--brand-accent-strong))]" />;
  return <Image alt={image.altText || title} className={`object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${active ? "scale-100 opacity-100" : "scale-[1.025] opacity-80"}`} fill sizes={sizes} src={image.url} />;
}

function SolutionLink({ href, compact = false }: { href: string | null; compact?: boolean }) {
  const className = `group ${compact ? "mt-4 min-h-11 px-4" : "mt-7 min-h-12 px-5"} inline-flex w-fit items-center gap-3 rounded-[9px] border border-brand-secondary-muted/55 text-sm font-semibold text-brand-secondary-foreground transition-colors duration-150 hover:border-brand-secondary-muted hover:bg-brand-secondary-hover focus-visible:outline-ring`;
  const content = <>استكشف الحل<ArrowLeft aria-hidden="true" className="size-[18px] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-1" /></>;
  return href ? <Link className={className} href={href}>{content}</Link> : <span className={className}>{content}</span>;
}

function number(value: number) {
  return String(value).padStart(2, "0");
}
