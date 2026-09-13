import Link from "next/link";

import { ProjectCard, type FeaturedProjectItem } from "./featured-projects";

type FilterProjectItem = FeaturedProjectItem & { categoryId: string | null };

export function ProjectFilterGrid({ categories, items, activeCategory = "ALL" }: { categories: { id: string; name: string }[]; items: FilterProjectItem[]; activeCategory?: string }) {
  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 [direction:rtl] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" aria-label="تصنيفات المشاريع">
        <div className="flex w-max min-w-full gap-2" dir="rtl" role="group">
          {[{ id: "ALL", name: "الكل" }, ...categories].map((category) => {
            const active = category.id === activeCategory;
            return <Link aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-ring ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-text-secondary hover:border-primary hover:text-primary"}`} href={category.id === "ALL" ? "/projects" : `/projects?category=${encodeURIComponent(category.id)}`} key={category.id}>{category.name}</Link>;
          })}
        </div>
      </div>
      {items.length ? (
        <section className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 lg:gap-5" aria-label="قائمة المشاريع">
          {items.map((item) => <ProjectCard archive item={item} key={item.id} />)}
        </section>
      ) : (
        <section className="mt-7 border-y border-border py-10"><h2 className="text-xl font-semibold">لا توجد مشاريع في هذا التصنيف حالياً</h2><p className="mt-2 text-text-secondary">اختر تصنيفاً آخر لعرض المشاريع المنشورة.</p></section>
      )}
    </>
  );
}
