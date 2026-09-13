import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cmsContentPath } from "@/modules/cms/slugs";
import { ProjectCategoryIcon } from "@/modules/project-categories/icons";
import { getPublishedProjects } from "@/modules/projects/queries";
import { Breadcrumbs } from "@/modules/seo/components/breadcrumbs";
import { listingMetadata } from "@/modules/seo/metadata";

export const metadata: Metadata = listingMetadata("المشاريع", "مشاريع ودراسات حالة منشورة من أعمال جده شيدنج.", "/projects");
export const dynamic = "force-dynamic";

export default async function ProjectsIndexPage() {
  const projects = await getPublishedProjects();
  return <main className="min-h-screen bg-[oklch(97.5%_0.009_100)] px-4 py-16 md:px-8 md:py-20 lg:py-24">
    <div className="mx-auto max-w-7xl space-y-12">
      <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المشاريع", href: "/projects" }]} />
      <header className="max-w-3xl space-y-4"><p className="text-sm font-semibold text-[oklch(58%_0.11_45)]">أدلة التنفيذ</p><h1 className="text-4xl font-bold leading-[1.24] md:text-6xl">مشاريع حقيقية، موثقة بتفاصيلها</h1><p className="max-w-2xl text-lg leading-[1.78] text-[oklch(42%_0.018_150)]">استعرض دراسات الحالة المنشورة وما توفر لها من موقع وصور وتفاصيل تنفيذ فعلية.</p></header>
      {projects.length === 0 ? <section className="border-y border-border py-10"><h2 className="text-2xl font-semibold">نعمل على توثيق المشاريع</h2><p className="mt-2 text-text-secondary">ستضاف دراسات الحالة عند اكتمال صورها وتفاصيلها.</p></section> : (
        <section className="grid gap-x-8 gap-y-12 md:grid-cols-2" aria-label="قائمة المشاريع">
          {projects.map((project, index) => { const version = project.publishedVersion; if (!version) return null; return <Link className={`group grid gap-5 ${index % 3 === 0 ? "md:col-span-2 md:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] md:items-end" : ""}`} href={cmsContentPath("/projects", version.slug ?? "")} key={project.id}>
            {version.coverMedia ? <div className="relative aspect-[3/2] overflow-hidden rounded-[2px] bg-[oklch(95%_0.012_110)]"><Image alt={version.coverMedia.altText ?? version.title ?? ""} className="object-cover transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transition-none" fill priority={index === 0} sizes={index % 3 === 0 ? "(min-width: 768px) 65vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} src={version.coverMedia.url} /></div> : null}
            <div className="space-y-3 border-t border-[oklch(82%_0.012_145)] pt-4"><div className="flex flex-wrap items-center gap-3 text-sm text-[oklch(34%_0.065_42)]">{version.category?.isActive ? <span className="inline-flex items-center gap-1.5 font-semibold"><ProjectCategoryIcon iconKey={version.category.iconKey} />{version.category.name}</span> : null}{[version.city, version.district].filter(Boolean).length ? <span>{[version.city, version.district].filter(Boolean).join("، ")}</span> : null}</div><h2 className="text-2xl font-bold leading-[1.4] group-hover:text-[oklch(37%_0.075_155)]">{version.title}</h2><p className="leading-[1.8] text-[oklch(42%_0.018_150)]">{version.shortDescription}</p><span className="inline-flex min-h-11 items-center text-sm font-semibold text-[oklch(37%_0.075_155)] underline">عرض دراسة الحالة</span></div>
          </Link>; })}
        </section>
      )}
    </div>
  </main>;
}
