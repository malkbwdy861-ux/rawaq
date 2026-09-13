import type { Metadata } from "next";

import { cmsContentPath } from "@/modules/cms/slugs";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { parsePublicPage } from "@/modules/cms/validation";
import { ArchivePageHero } from "@/modules/pages/components/archive-page-hero";
import { selectArchiveHeroImage } from "@/modules/pages/components/archive-page-media";
import { ListingCta } from "@/modules/pages/components/listing-cta";
import { ProjectFilterGrid } from "@/modules/pages/components/project-filter-grid";
import { staticPageMetadata } from "@/modules/pages/metadata";
import { getPublishedPage } from "@/modules/pages/queries";
import type { ListingPageData } from "@/modules/pages/validation";
import { getProjectCategoryOptions } from "@/modules/project-categories/queries";
import { getPublishedProjects } from "@/modules/projects/queries";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> { const result = await getPublishedPage("PROJECTS"); return staticPageMetadata(result.version, result.data, "/projects", result.resolved.heroMedia?.url); }

export default async function ProjectsIndexPage({ searchParams }: { searchParams: Promise<{ page?: string | string[]; category?: string | string[] }> }) {
  const params = await searchParams;
  const requestedCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const [pageContent, categoryOptions, settings] = await Promise.all([getPublishedPage("PROJECTS"), getProjectCategoryOptions(), getSiteSettings()]);
  const activeCategories = categoryOptions.filter((category) => category.isActive);
  const categoryId = activeCategories.some((category) => category.id === requestedCategory) ? requestedCategory : undefined;
  const result = await getPublishedProjects(parsePublicPage(params.page), 12, categoryId);
  const projects = result.items;
  const pageData = pageContent.data as ListingPageData;
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
  const projectMedia = projects.map((project) => project.publishedVersion?.coverMedia).filter(Boolean);
  const heroImage = selectArchiveHeroImage({ configured: pageContent.resolved.heroMedia, configuredAlt: pageData.hero.imageAlt, title: pageData.hero.pageTitle || "", fallbacks: [...projectMedia, settings?.defaultOpenGraphImage] });
  const whatsappHref = settings?.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, { notes: "أرغب في مناقشة مشروع مشابه لأحد مشاريعكم." }) : "/contact";

  return (
    <main className="min-h-screen bg-background">
      <ArchivePageHero currentHref="/projects" currentLabel={pageData.hero.eyebrow || "مشاريعنا"} description={pageData.hero.shortDescription || ""} eyebrow={pageData.hero.eyebrow || ""} image={heroImage} imagePosition="center 55%" title={pageData.hero.pageTitle || ""} />
      <div className="public-container py-12 md:py-16 lg:py-[72px]">
        {items.length || categoryId ? <><ProjectFilterGrid activeCategory={categoryId} categories={activeCategories.map(({ id, name }) => ({ id, name }))} items={items} />{items.length ? <div className="mt-10"><CmsPaginationControls basePath="/projects" pagination={result.pagination} query={{ category: categoryId }} /></div> : null}</> : <section className="border-y border-border py-10"><h2 className="text-2xl font-semibold">نعمل على توثيق المشاريع</h2><p className="mt-2 text-text-secondary">ستضاف دراسات الحالة عند اكتمال صورها وتفاصيلها.</p></section>}
      </div>
      <ListingCta description="شاركنا تفاصيل الموقع والمساحة، وسنناقش معك نطاق التنفيذ والخيار المناسب." href={whatsappHref} title="لديك مشروع مشابه؟" />
    </main>
  );
}
