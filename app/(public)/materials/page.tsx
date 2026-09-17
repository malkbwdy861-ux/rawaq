import type { Metadata } from "next";

import { cmsContentPath } from "@/modules/cms/slugs";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { parsePublicPage } from "@/modules/cms/validation";
import { getPublishedMaterials } from "@/modules/materials/queries";
import { ArchivePageHero } from "@/modules/pages/components/archive-page-hero";
import { ArchivePageIntro } from "@/modules/pages/components/archive-page-intro";
import { selectArchiveHeroImage } from "@/modules/pages/components/archive-page-media";
import { ListingCta } from "@/modules/pages/components/listing-cta";
import { MaterialArchiveCard } from "@/modules/pages/components/material-archive-card";
import { staticPageMetadata } from "@/modules/pages/metadata";
import { getPublishedPage } from "@/modules/pages/queries";
import type { ListingPageData } from "@/modules/pages/validation";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> { const result = await getPublishedPage("MATERIALS"); return staticPageMetadata(result.version, result.data, "/materials", result.resolved.heroMedia?.url); }

export default async function MaterialsIndexPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePublicPage((await searchParams).page);
  const [pageContent, result, settings] = await Promise.all([getPublishedPage("MATERIALS"), getPublishedMaterials(page), getSiteSettings()]);
  const pageData = pageContent.data as ListingPageData;
  const materials = result.items;
  const items = materials.flatMap((material) => {
    const version = material.publishedVersion;
    if (!version?.name || !version.slug) return [];
    return [{ id: material.id, name: version.name, description: version.shortDescription ?? "", href: cmsContentPath("/materials", version.slug), image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.name } : null }];
  });
  const heroImage = selectArchiveHeroImage({ configured: pageContent.resolved.heroMedia, configuredAlt: pageData.hero.imageAlt, title: pageData.hero.pageTitle || "", fallbacks: [...materials.map((material) => material.publishedVersion?.heroMedia), settings?.defaultOpenGraphImage] });
  const whatsappHref = settings?.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, { notes: "أرغب في معرفة المادة الأنسب لمشروعي." }) : "/contact";

  return (
    <main className="min-h-screen bg-background">
      <ArchivePageHero currentHref="/materials" currentLabel={pageData.hero.eyebrow || "المواد"} description={pageData.hero.shortDescription || ""} eyebrow={pageData.hero.eyebrow || ""} image={heroImage} imagePosition="center 52%" title={pageData.hero.pageTitle || ""} />
      <ArchivePageIntro description={pageData.intro.description || ""} />
      <div className="public-container pb-16 md:pb-20 lg:pb-24">
        {items.length ? <><section aria-label="قائمة المواد" className="divide-y divide-border border-y border-border">{items.map((item, index) => <MaterialArchiveCard index={index} item={item} key={item.id} />)}</section><div className="mt-10"><CmsPaginationControls basePath="/materials" pagination={result.pagination} /></div></> : <section className="border-y border-border py-12"><h2 className="text-2xl font-semibold">نعمل على توثيق المواد المتاحة</h2><p className="mt-3 text-text-secondary">يمكنك التواصل معنا للسؤال عن مادة أو استخدام محدد.</p></section>}
      </div>
      <ListingCta description="صف لنا الموقع والاستخدام المتوقع، ونساعدك في مقارنة الخيارات المناسبة قبل التنفيذ." href={whatsappHref} label="اسأل عن المادة المناسبة" title="تحتاج مساعدة في اختيار المادة؟" />
    </main>
  );
}
