import type { Metadata } from "next";

import { cmsContentPath } from "@/modules/cms/slugs";
import { ListingCta } from "@/modules/pages/components/listing-cta";
import { ListingHero } from "@/modules/pages/components/listing-hero";
import { ProjectFilterGrid } from "@/modules/pages/components/project-filter-grid";
import { getProjectCategoryOptions } from "@/modules/project-categories/queries";
import { getPublishedProjects } from "@/modules/projects/queries";
import { listingMetadata } from "@/modules/seo/metadata";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

export const metadata: Metadata = listingMetadata("المشاريع", "مشاريع ودراسات حالة منشورة من أعمال جده شيدنج.", "/projects");
export const dynamic = "force-dynamic";

export default async function ProjectsIndexPage() {
  const [projects, categoryOptions, settings] = await Promise.all([getPublishedProjects(), getProjectCategoryOptions(), getSiteSettings()]);
  const items = projects.flatMap((project) => {
    const version = project.publishedVersion;
    if (!version?.title) return [];
    const location = [version.city, version.district].filter(Boolean).join(" · ");
    return [{
      id: project.id,
      title: version.title,
      shortDescription: version.shortDescription ?? "",
      href: version.slug ? cmsContentPath("/projects", version.slug) : null,
      image: version.coverMedia ? { url: version.coverMedia.url, altText: version.coverMedia.altText || version.title } : null,
      location: location || undefined,
      categoryId: version.category?.isActive ? version.category.id : null,
      category: version.category?.isActive ? { name: version.category.name, iconKey: version.category.iconKey } : undefined,
    }];
  });
  const heroProject = items.find((item) => item.image);
  const heroImage = heroProject?.image ?? (settings?.defaultOpenGraphImage ? { url: settings.defaultOpenGraphImage.url, altText: "" } : null);
  const whatsappHref = settings?.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, { notes: "أرغب في مناقشة مشروع مشابه لأحد مشاريعكم." }) : "/contact";

  return (
    <main className="min-h-screen bg-background">
      <ListingHero currentHref="/projects" currentLabel="مشاريعنا" description="نماذج من أعمالنا في المظلات والتظليل الخارجي في جدة." eyebrow="مشاريعنا" image={heroImage} title="مشاريع نفذناها على أرض الواقع" />
      <div className="public-container py-12 md:py-16 lg:py-20">
        {items.length ? <ProjectFilterGrid categories={categoryOptions.filter((category) => category.isActive).map(({ id, name }) => ({ id, name }))} items={items} /> : <section className="border-y border-border py-10"><h2 className="text-2xl font-semibold">نعمل على توثيق المشاريع</h2><p className="mt-2 text-text-secondary">ستضاف دراسات الحالة عند اكتمال صورها وتفاصيلها.</p></section>}
      </div>
      <ListingCta description="شاركنا تفاصيل الموقع والمساحة، وسنناقش معك نطاق التنفيذ والخيار المناسب." href={whatsappHref} title="لديك مشروع مشابه؟" />
    </main>
  );
}
