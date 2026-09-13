"use client";

import { useState } from "react";

import { ProjectCard, type FeaturedProjectItem } from "./featured-projects";

type FilterProjectItem = FeaturedProjectItem & { categoryId: string | null };

export function ProjectFilterGrid({ categories, items }: { categories: { id: string; name: string }[]; items: FilterProjectItem[] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const visibleItems = activeCategory === "ALL" ? items : items.filter((item) => item.categoryId === activeCategory);

  return (
    <>
      <div className="overflow-x-auto pb-2 [scrollbar-width:thin]" aria-label="تصنيفات المشاريع">
        <div className="flex w-max min-w-full gap-2" role="group">
          {[{ id: "ALL", name: "الكل" }, ...categories].map((category) => {
            const active = category.id === activeCategory;
            return <button aria-pressed={active} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-ring ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-text-secondary hover:border-primary hover:text-primary"}`} key={category.id} onClick={() => setActiveCategory(category.id)} type="button">{category.name}</button>;
          })}
        </div>
      </div>
      {visibleItems.length ? (
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" aria-label="قائمة المشاريع">
          {visibleItems.map((item) => <ProjectCard archive item={item} key={item.id} />)}
        </section>
      ) : (
        <section className="mt-7 border-y border-border py-10"><h2 className="text-xl font-semibold">لا توجد مشاريع في هذا التصنيف حالياً</h2><p className="mt-2 text-text-secondary">اختر تصنيفاً آخر لعرض المشاريع المنشورة.</p></section>
      )}
    </>
  );
}
