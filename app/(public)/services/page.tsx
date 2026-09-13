import type { Metadata } from "next";

import { cmsContentPath } from "@/modules/cms/slugs";
import { ListingCta } from "@/modules/pages/components/listing-cta";
import { ListingHero } from "@/modules/pages/components/listing-hero";
import { ServiceCard } from "@/modules/pages/components/service-card";
import { listingMetadata } from "@/modules/seo/metadata";
import { getPublishedServices } from "@/modules/services/queries";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

export const metadata: Metadata = listingMetadata("الخدمات", "خدمات التظليل والإنشاءات الخارجية المتاحة للمنازل والمواقع التجارية.", "/services");
export const dynamic = "force-dynamic";

export default async function ServicesIndexPage() {
  const [services, settings] = await Promise.all([getPublishedServices(), getSiteSettings()]);
  const items = services.flatMap((service) => {
    const version = service.publishedVersion;
    if (!version?.title) return [];
    return [{ id: service.id, title: version.title, description: version.shortDescription ?? "", href: version.slug ? cmsContentPath("/services", version.slug) : null, image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null }];
  });
  const heroService = items.find((item) => item.image);
  const heroImage = heroService?.image ?? (settings?.defaultOpenGraphImage ? { url: settings.defaultOpenGraphImage.url, altText: "" } : null);
  const whatsappHref = settings?.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, { notes: "أرغب في معرفة الخدمة المناسبة لمشروعي." }) : "/contact";

  return (
    <main className="min-h-screen bg-background">
      <ListingHero currentHref="/services" currentLabel="خدماتنا" description="حلول تنفيذ احترافية للمنازل والمنشآت والمساحات المختلفة." eyebrow="خدماتنا" image={heroImage} title="خدمات تظليل وتنفيذ تناسب احتياجك" />
      <div className="public-container py-12 md:py-16 lg:py-20">
        {items.length ? <section aria-label="قائمة الخدمات" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">{items.map((item, index) => <ServiceCard index={index} item={item} key={item.id} />)}</section> : <section className="border-y border-border py-12"><h2 className="text-2xl font-semibold">نعمل على تحديث تفاصيل الخدمات</h2><p className="mt-3 text-text-secondary">يمكنك التواصل معنا مباشرة لمناقشة احتياج موقعك.</p></section>}
      </div>
      <ListingCta description="صف لنا الموقع والنتيجة التي تريدها، وسنساعدك في تحديد نطاق العمل المناسب." href={whatsappHref} title="تبحث عن خدمة مناسبة لمشروعك؟" />
    </main>
  );
}
