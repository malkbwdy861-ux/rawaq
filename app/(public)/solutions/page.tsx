import type { Metadata } from "next";

import { cmsContentPath } from "@/modules/cms/slugs";
import { ArchivePageHero } from "@/modules/pages/components/archive-page-hero";
import { ArchivePageIntro } from "@/modules/pages/components/archive-page-intro";
import { selectArchiveHeroImage } from "@/modules/pages/components/archive-page-media";
import { SolutionCard, type FeaturedSolutionItem } from "@/modules/pages/components/featured-solutions";
import { ListingCta } from "@/modules/pages/components/listing-cta";
import { staticPageMetadata } from "@/modules/pages/metadata";
import { getPublishedPage } from "@/modules/pages/queries";
import type { ListingPageData } from "@/modules/pages/validation";
import { getPublishedSolutions } from "@/modules/solutions/queries";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const result = await getPublishedPage("SOLUTIONS"); return staticPageMetadata(result.version, result.data, "/solutions", result.resolved.heroMedia?.url); }

export default async function SolutionsIndexPage() {
  const [pageContent, solutions, settings] = await Promise.all([getPublishedPage("SOLUTIONS"), getPublishedSolutions(), getSiteSettings()]);
  const pageData = pageContent.data as ListingPageData;
  const items = solutions.flatMap((solution): FeaturedSolutionItem[] => {
    const version = solution.publishedVersion;
    if (!version?.title) return [];
    return [{ id: solution.id, title: version.title, shortDescription: version.shortDescription ?? "", href: version.slug ? cmsContentPath("/solutions", version.slug) : null, image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null }];
  });
  const solutionMedia = solutions.map((solution) => solution.publishedVersion?.heroMedia).filter(Boolean);
  const heroImage = selectArchiveHeroImage({ configured: pageContent.resolved.heroMedia, configuredAlt: pageData.hero.imageAlt, title: pageData.hero.pageTitle || "", fallbacks: [...solutionMedia, settings?.defaultOpenGraphImage] });
  const whatsappHref = settings?.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, { notes: "أحتاج مساعدة في اختيار حل التظليل المناسب للموقع." }) : "/contact";

  return (
    <main className="min-h-screen bg-background">
      <ArchivePageHero currentHref="/solutions" currentLabel={pageData.hero.eyebrow || "حلولنا"} description={pageData.hero.shortDescription || ""} eyebrow={pageData.hero.eyebrow || ""} image={heroImage} imagePosition="center 48%" title={pageData.hero.pageTitle || ""} />
      <ArchivePageIntro description={pageData.intro.description || ""} />
      <div className="public-container pb-16 md:pb-20 lg:pb-24">
        {items.length ? <section aria-label="قائمة الحلول" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">{items.map((item, index) => <SolutionCard index={index} item={item} key={item.id} total={items.length} />)}</section> : <section className="border-y border-border py-10"><h2 className="text-xl font-semibold">نعمل على إضافة حلول تفصيلية</h2><p className="mt-2 text-text-secondary">تواصل معنا لمناقشة ظروف موقعك والنتيجة المطلوبة.</p></section>}
      </div>
      <ListingCta description="شاركنا استخدام المساحة وظروف الموقع، وسنرشدك إلى الحل الأقرب لاحتياجك." href={whatsappHref} label="ناقش احتياجك" title="غير متأكد من الحل المناسب؟" />
    </main>
  );
}
