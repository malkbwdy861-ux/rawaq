import type { Metadata } from "next";

import { cmsContentPath } from "@/modules/cms/slugs";
import { ArchivePageHero } from "@/modules/pages/components/archive-page-hero";
import { ArchivePageIntro } from "@/modules/pages/components/archive-page-intro";
import { selectArchiveHeroImage } from "@/modules/pages/components/archive-page-media";
import { ListingCta } from "@/modules/pages/components/listing-cta";
import { ServiceCard } from "@/modules/pages/components/service-card";
import { staticPageMetadata } from "@/modules/pages/metadata";
import { getPublishedPage } from "@/modules/pages/queries";
import type { ListingPageData } from "@/modules/pages/validation";
import { getPublishedServices } from "@/modules/services/queries";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const result = await getPublishedPage("SERVICES"); return staticPageMetadata(result.version, result.data, "/services", result.resolved.heroMedia?.url); }

export default async function ServicesIndexPage() {
  const [pageContent, services, settings] = await Promise.all([getPublishedPage("SERVICES"), getPublishedServices(), getSiteSettings()]);
  const pageData = pageContent.data as ListingPageData;
  const items = services.flatMap((service) => {
    const version = service.publishedVersion;
    if (!version?.title) return [];
    return [{ id: service.id, title: version.title, description: version.shortDescription ?? "", href: version.slug ? cmsContentPath("/services", version.slug) : null, image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null }];
  });
  const serviceMedia = services.map((service) => service.publishedVersion?.heroMedia).filter(Boolean);
  const heroImage = selectArchiveHeroImage({ configured: pageContent.resolved.heroMedia, configuredAlt: pageData.hero.imageAlt, title: pageData.hero.pageTitle || "", fallbacks: [...serviceMedia, settings?.defaultOpenGraphImage] });
  const whatsappHref = settings?.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, { notes: "أرغب في معرفة الخدمة المناسبة لمشروعي." }) : "/contact";

  return (
    <main className="min-h-screen bg-background">
      <ArchivePageHero currentHref="/services" currentLabel={pageData.hero.eyebrow || "خدماتنا"} description={pageData.hero.shortDescription || ""} eyebrow={pageData.hero.eyebrow || ""} image={heroImage} imagePosition="center 52%" title={pageData.hero.pageTitle || ""} />
      <ArchivePageIntro description={pageData.intro.description || ""} />
      <div className="public-container pb-16 md:pb-20 lg:pb-24">
        {items.length ? <section aria-label="قائمة الخدمات" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">{items.map((item, index) => <ServiceCard index={index} item={item} key={item.id} />)}</section> : <section className="border-y border-border py-12"><h2 className="text-2xl font-semibold">نعمل على تحديث تفاصيل الخدمات</h2><p className="mt-3 text-text-secondary">يمكنك التواصل معنا مباشرة لمناقشة احتياج موقعك.</p></section>}
      </div>
      <ListingCta description="صف لنا الموقع والنتيجة التي تريدها، وسنساعدك في تحديد نطاق العمل المناسب." href={whatsappHref} title="تبحث عن خدمة مناسبة لمشروعك؟" />
    </main>
  );
}
