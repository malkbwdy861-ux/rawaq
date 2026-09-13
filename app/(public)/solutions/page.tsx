import type { Metadata } from "next";

import { cmsContentPath } from "@/modules/cms/slugs";
import { ListingCta } from "@/modules/pages/components/listing-cta";
import { ListingHero } from "@/modules/pages/components/listing-hero";
import { SolutionCard, type FeaturedSolutionItem } from "@/modules/pages/components/featured-solutions";
import { listingMetadata } from "@/modules/seo/metadata";
import { getPublishedSolutions } from "@/modules/solutions/queries";
import { buildWhatsAppUrl } from "@/modules/settings/contact";
import { getSiteSettings } from "@/modules/settings/queries";

export const metadata: Metadata = listingMetadata("الحلول", "تصفح حلول جده شيدنج المنشورة لاحتياجات التظليل والاستخدامات الخارجية.", "/solutions");
export const dynamic = "force-dynamic";

export default async function SolutionsIndexPage() {
  const [solutions, settings] = await Promise.all([getPublishedSolutions(), getSiteSettings()]);
  const items = solutions.flatMap((solution): FeaturedSolutionItem[] => {
    const version = solution.publishedVersion;
    if (!version?.title) return [];
    return [{ id: solution.id, title: version.title, shortDescription: version.shortDescription ?? "", href: version.slug ? cmsContentPath("/solutions", version.slug) : null, image: version.heroMedia ? { url: version.heroMedia.url, altText: version.heroMedia.altText || version.title } : null }];
  });
  const heroSolution = items.find((item) => item.image);
  const heroImage = heroSolution?.image ?? (settings?.defaultOpenGraphImage ? { url: settings.defaultOpenGraphImage.url, altText: "" } : null);
  const whatsappHref = settings?.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, settings.defaultWhatsappText, { notes: "أحتاج مساعدة في اختيار حل التظليل المناسب للموقع." }) : "/contact";

  return (
    <main className="min-h-screen bg-background">
      <ListingHero currentHref="/solutions" currentLabel="حلولنا" description="نساعدك في اختيار الحل المناسب حسب استخدام المساحة وطبيعة المشروع." eyebrow="حلولنا" image={heroImage} title="حلول تظليل مصممة حسب احتياج الموقع" />
      <div className="public-container py-12 md:py-16 lg:py-20">
        {items.length ? <section aria-label="قائمة الحلول" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">{items.map((item, index) => <SolutionCard index={index} item={item} key={item.id} total={items.length} />)}</section> : <section className="border-y border-border py-10"><h2 className="text-xl font-semibold">نعمل على إضافة حلول تفصيلية</h2><p className="mt-2 text-text-secondary">تواصل معنا لمناقشة ظروف موقعك والنتيجة المطلوبة.</p></section>}
      </div>
      <ListingCta description="شاركنا استخدام المساحة وظروف الموقع، وسنرشدك إلى الحل الأقرب لاحتياجك." href={whatsappHref} label="ناقش احتياجك" title="غير متأكد من الحل المناسب؟" />
    </main>
  );
}
