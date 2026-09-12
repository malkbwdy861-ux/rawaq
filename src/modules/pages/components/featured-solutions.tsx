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
      className="relative isolate overflow-clip bg-primary-active text-primary-foreground"
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
              <article
                aria-hidden={index !== activeIndex}
                aria-label={`${index + 1} من ${total}: ${item.title}`}
                aria-roledescription="شريحة"
                className="relative isolate h-full w-full shrink-0 overflow-hidden"
                dir="rtl"
                inert={index !== activeIndex}
                key={item.id}
              >
                <SolutionMedia active={index === activeIndex} image={item.image} title={item.title} sizes="100vw" />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--primary-active)_91%,transparent)_0%,color-mix(in_oklch,var(--primary-active)_65%,transparent)_40%,color-mix(in_oklch,var(--primary-active)_10%,transparent)_78%)]" />
                <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-24 pt-7 sm:px-8 sm:pb-28">
                  <p className="flex items-center gap-3 text-sm font-semibold text-primary-soft before:h-px before:w-8 before:bg-clay">الحلول المميزة</p>
                  <div className="max-w-[580px] text-right">
                    <p className="mb-4 text-start text-sm font-semibold tabular-nums text-primary-soft"><bdi dir="ltr">{number(index + 1)} / {number(total)}</bdi></p>
                    <h3 className="line-clamp-2 text-[clamp(1.875rem,7vw,2.25rem)] font-bold leading-[1.25] text-pretty">{item.title}</h3>
                    <p className="mt-4 line-clamp-3 max-w-[48ch] text-[1.0625rem] leading-[1.8] text-primary-soft">{item.shortDescription}</p>
                    <SolutionLink href={item.href} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {total > 1 ? <div className="absolute bottom-7 start-5 z-20 flex items-center gap-1 sm:bottom-9 sm:start-8">
            <button aria-label={autoplayPaused ? "تشغيل العرض التلقائي" : "إيقاف العرض التلقائي"} className="grid size-11 place-items-center rounded-[9px] border border-primary-soft/40 bg-primary-active/70 transition-colors hover:bg-primary focus-visible:outline-primary-soft" onClick={() => setAutoplayPaused((paused) => !paused)} type="button">{autoplayPaused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}</button>
            <button aria-disabled={activeIndex === 0} aria-label="الحل السابق" className="grid size-11 place-items-center rounded-[9px] border border-primary-soft/40 bg-primary-active/70 transition-colors hover:bg-primary focus-visible:outline-primary-soft disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-primary-active/70" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)} type="button"><ArrowRight aria-hidden="true" className="size-[18px]" /></button>
            <button aria-disabled={activeIndex === total - 1} aria-label="الحل التالي" className="grid size-11 place-items-center rounded-[9px] border border-primary-soft/40 bg-primary-active/70 transition-colors hover:bg-primary focus-visible:outline-primary-soft disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-primary-active/70" disabled={activeIndex === total - 1} onClick={() => goTo(activeIndex + 1)} type="button"><ArrowLeft aria-hidden="true" className="size-[18px]" /></button>
          </div> : null}
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1440px] grid-cols-[minmax(280px,34%)_minmax(0,66%)] min-[1120px]:grid">
        <aside className="relative px-8 xl:px-12">
          <div className="sticky top-24 flex min-h-[calc(100vh-6rem)] flex-col justify-center py-10">
            <header className="max-w-[390px]">
              <p className="flex items-center gap-3 text-sm font-semibold text-primary-soft before:h-px before:w-9 before:bg-clay">الحلول المميزة</p>
              <h2 className="mt-4 text-[clamp(1.75rem,2.3vw,2.5rem)] font-bold leading-[1.3] text-pretty">{title}</h2>
              {description ? <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-[1.8] text-primary-soft">{description}</p> : null}
            </header>
            <nav aria-label="الحلول المميزة" className="mt-8 border-y border-primary-soft/20">
              {items.map((item, index) => {
                const active = index === activeIndex;
                return <button aria-current={active ? "true" : undefined} className={`group flex min-h-14 w-full items-center gap-4 border-b border-primary-soft/15 px-3 text-start transition-colors duration-150 last:border-b-0 focus-visible:outline-primary-soft xl:min-h-16 ${active ? "bg-primary text-primary-foreground" : "text-primary-soft hover:bg-primary/35 hover:text-primary-foreground"}`} key={item.id} onClick={() => scrollToPanel(index)} type="button">
                  <span className={`text-xs font-semibold tabular-nums transition-colors ${active ? "text-clay" : "text-primary-soft/65"}`} dir="ltr">{number(index + 1)}</span>
                  <span className={`min-w-0 flex-1 leading-[1.5] ${active ? "font-bold" : "font-medium"}`}>{item.title}</span>
                  <ArrowLeft aria-hidden="true" className={`size-4 shrink-0 transition-[opacity,transform] duration-300 ${active ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"}`} />
                </button>;
              })}
            </nav>
          </div>
        </aside>

        <div className="border-s border-primary-soft/15 bg-primary-active p-5 xl:p-8">
          {items.map((item, index) => {
            const active = index === activeIndex;
            return <article className="relative isolate mb-8 min-h-[clamp(680px,78svh,900px)] overflow-hidden rounded-[2px] last:mb-0" key={item.id} ref={(node) => { panelRefs.current[index] = node; }}>
              <SolutionMedia active={active} image={item.image} title={item.title} sizes="(min-width: 1440px) 950px, 66vw" />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--primary-active)_90%,transparent)_0%,color-mix(in_oklch,var(--primary-active)_58%,transparent)_36%,color-mix(in_oklch,var(--primary-active)_6%,transparent)_74%)]" />
              <div className="relative z-10 flex min-h-[clamp(680px,78svh,900px)] flex-col justify-end p-8 text-right xl:p-12">
                <p className="mb-4 text-start text-sm font-semibold tabular-nums text-primary-soft"><bdi dir="ltr">{number(index + 1)} / {number(total)}</bdi></p>
                <h3 className="max-w-[760px] text-[clamp(2rem,3vw,3.5rem)] font-bold leading-[1.22] text-pretty">{item.title}</h3>
                <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-[1.85] text-primary-soft xl:text-lg">{item.shortDescription}</p>
                <SolutionLink href={item.href} />
              </div>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}

function SolutionMedia({ active, image, title, sizes }: { active: boolean; image: FeaturedSolutionItem["image"]; title: string; sizes: string }) {
  if (!image) return <div aria-hidden="true" className="absolute inset-0 bg-primary [background-image:linear-gradient(132deg,transparent_0%,color-mix(in_oklch,var(--primary-active)_68%,transparent)_100%),linear-gradient(90deg,color-mix(in_oklch,var(--primary-soft)_13%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_oklch,var(--primary-soft)_10%,transparent)_1px,transparent_1px)] [background-size:auto,72px_100%,100%_72px]" />;
  return <Image alt={image.altText || title} className={`object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${active ? "scale-100 opacity-100" : "scale-[1.025] opacity-80"}`} fill sizes={sizes} src={image.url} />;
}

function SolutionLink({ href }: { href: string | null }) {
  const className = "group mt-7 inline-flex min-h-12 w-fit items-center gap-3 rounded-[9px] border border-primary-soft/55 px-5 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:border-primary-soft hover:bg-primary focus-visible:outline-primary-soft";
  const content = <>استكشف الحل<ArrowLeft aria-hidden="true" className="size-[18px] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-1" /></>;
  return href ? <Link className={className} href={href}>{content}</Link> : <span className={className}>{content}</span>;
}

function number(value: number) {
  return String(value).padStart(2, "0");
}
