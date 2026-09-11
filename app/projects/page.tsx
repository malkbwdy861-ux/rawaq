import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedProjects } from "@/modules/projects/queries";

export const metadata: Metadata = { title: "المشاريع | Jeddah Shading", description: "مشاريع ودراسات حالة منشورة من أعمال جده شيدنج." };
export const dynamic = "force-dynamic";

export default async function ProjectsIndexPage() {
  const projects = await getPublishedProjects();
  return <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-16 md:px-8 md:py-20 lg:py-24">
    <div className="mx-auto max-w-7xl space-y-12">
      <nav aria-label="مسار التنقل" className="text-sm text-[oklch(42%_0.018_150)]"><Link className="font-semibold underline" href="/">الرئيسية</Link><span aria-hidden="true"> / </span><span aria-current="page">المشاريع</span></nav>
      <header className="max-w-3xl space-y-4"><p className="text-sm font-semibold text-[oklch(58%_0.11_45)]">أدلة التنفيذ</p><h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">مشاريع حقيقية، موثقة بتفاصيلها</h1><p className="max-w-2xl text-lg leading-[1.78] text-[oklch(42%_0.018_150)]">استعرض دراسات الحالة المنشورة وما توفر لها من موقع وصور وتفاصيل تنفيذ فعلية.</p></header>
      {projects.length === 0 ? <section className="border-y border-[oklch(82%_0.012_145)] py-10"><h2 className="text-2xl font-semibold">لا توجد مشاريع منشورة بعد</h2><p className="mt-2 text-[oklch(42%_0.018_150)]">ستظهر دراسات الحالة هنا بعد نشرها من لوحة التحكم.</p></section> : (
        <section className="grid gap-x-8 gap-y-12 md:grid-cols-2" aria-label="قائمة المشاريع">
          {projects.map((project, index) => { const version = project.publishedVersion; if (!version) return null; return <Link className={`group grid gap-5 ${index % 3 === 0 ? "md:col-span-2 md:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] md:items-end" : ""}`} href={`/projects/${version.slug}`} key={project.id}>
            {version.coverMedia ? <div className="relative aspect-[3/2] overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)]"><Image alt={version.coverMedia.altText ?? version.title ?? ""} className="object-cover transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transition-none" fill priority={index === 0} sizes={index % 3 === 0 ? "(min-width: 768px) 65vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} src={version.coverMedia.url} /></div> : null}
            <div className="space-y-3 border-t border-[oklch(82%_0.012_145)] pt-4"><p className="text-sm font-semibold text-[oklch(34%_0.065_42)]">{[version.city, version.district].filter(Boolean).join("، ") || "دراسة حالة"}</p><h2 className="text-2xl font-bold leading-[1.4] group-hover:text-[oklch(37%_0.075_155)]">{version.title}</h2><p className="leading-[1.8] text-[oklch(42%_0.018_150)]">{version.shortDescription}</p><span className="inline-flex min-h-11 items-center text-sm font-semibold text-[oklch(37%_0.075_155)] underline">عرض دراسة الحالة</span></div>
          </Link>; })}
        </section>
      )}
    </div>
  </main>;
}
