import type { PageKey } from "@prisma/client";
import { ArrowUpLeft, ChevronDown, Eye, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CmsFieldShell, CmsInput, CmsTextarea } from "@/modules/cms/components/form";
import { CmsRelationSelector } from "@/modules/cms/components/relation-selector";
import type { CmsRelationOption } from "@/modules/cms/types";
import { MediaPicker, type MediaPickerItem } from "@/modules/media/components/media-picker";

import { publishPageAction } from "../actions";
import type { AboutPageData, ContactPageData, HomePageData, PricesPageData, StaticPageData } from "../validation";
import { RepeatableItems } from "./repeatable-items";

type PageFormProps = {
  page: { id: string; key: PageKey; draftVersion: SeoVersion | null };
  draftData: StaticPageData | null;
  media: MediaPickerItem[];
  path: string;
  relationOptions: { services: CmsRelationOption[]; solutions: CmsRelationOption[]; projects: CmsRelationOption[]; faqs: CmsRelationOption[]; articles: CmsRelationOption[] };
};
type SeoVersion = { seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImageId: string | null };

export function PageForm({ page, draftData, media, path, relationOptions }: PageFormProps) {
  return (
    <form action={publishPageAction} className="space-y-5">
      <input name="pageId" type="hidden" value={page.id} />
      <input name="key" type="hidden" value={page.key} />

      <div className="space-y-3">
        {page.key === "HOME" ? <HomeFields data={draftData as HomePageData | null} media={media} options={relationOptions} /> : null}
        {page.key === "ABOUT" ? <AboutFields data={draftData as AboutPageData | null} media={media} /> : null}
        {page.key === "CONTACT" ? <ContactFields data={draftData as ContactPageData | null} /> : null}
        {page.key === "PRICES" ? <PricesFields data={draftData as PricesPageData | null} options={relationOptions} /> : null}
        <SeoFields version={page.draftVersion} media={media} />
      </div>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-float)] sm:flex-row sm:items-center sm:justify-between">
        <p className="hidden text-sm text-text-secondary sm:block">يحفظ هذا الإجراء الصفحة ويحدّث النسخة العامة.</p>
        <div className="grid gap-2 sm:flex sm:items-center">
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border-strong bg-card px-4 text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={path} target="_blank">
            <Eye className="size-[18px]" aria-hidden="true" />
            عرض الصفحة
            <ArrowUpLeft className="size-4" aria-hidden="true" />
          </Link>
          <Button className="min-h-11 px-5" type="submit">
            <Save aria-hidden="true" />
            حفظ الصفحة
          </Button>
        </div>
      </div>
    </form>
  );
}

function HomeFields({ data, media, options }: { data: HomePageData | null; media: MediaPickerItem[]; options: PageFormProps["relationOptions"] }) {
  return (
    <>
      <PageSection title="الواجهة الرئيسية" description="أول ما يراه الزائر. اجعل العنوان مباشرا والوصف مفيدا دون مبالغة." defaultOpen>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="grid gap-4">
            <Text id="heroEyebrow" label="السطر التمهيدي" value={data?.hero.eyebrow} />
            <Text id="heroTitle" label="العنوان" value={data?.hero.title} />
            <Area id="heroDescription" label="الوصف" value={data?.hero.description} />
          </div>
          <MediaPicker items={media} name="heroMediaId" defaultValue={data?.hero.mediaId} label="صورة الواجهة الرئيسية" />
        </div>
        <TwoColumns>
          <Text id="primaryCtaText" label="نص الإجراء الرئيسي" value={data?.hero.primaryCtaText} />
          <Text id="primaryCtaTarget" label="رابط الإجراء الرئيسي" value={data?.hero.primaryCtaTarget} ltr />
          <Text id="secondaryCtaText" label="نص الإجراء الثانوي" value={data?.hero.secondaryCtaText} />
          <Text id="secondaryCtaTarget" label="رابط الإجراء الثانوي" value={data?.hero.secondaryCtaTarget} ltr />
        </TwoColumns>
        <Text id="heroImageAlt" label="النص البديل للصورة" value={data?.hero.imageAlt} />
        <SubPanel title="قيم الواجهة الرئيسية" description="تظهر داخل الشريط السفلي للواجهة الرئيسية.">
          <RepeatableItems name="trustItem" initialItems={data?.trustSection.items} addLabel="إضافة بند" maxItems={3} minimumRows={3} showIcon />
        </SubPanel>
      </PageSection>
      <PageSection title="الخدمات المختارة" description="اختر الخدمات التي تستحق الظهور في الصفحة الرئيسية.">
        <Text id="servicesTitle" label="عنوان القسم" value={data?.featuredServices.title} />
        <Area id="servicesDescription" label="وصف القسم" value={data?.featuredServices.description} />
        <CmsRelationSelector editBasePath="/dashboard/services" maxSelections={5} name="selectedServiceIds" label="الخدمات" options={options.services} selectedIds={data?.featuredServices.selectedServiceIds} />
      </PageSection>
      <PageSection title="الحلول المختارة" description="اربط الصفحة بالحلول الأكثر صلة بالزائر الجديد.">
        <Text id="solutionsTitle" label="عنوان القسم" value={data?.featuredSolutions.title} />
        <Area id="solutionsDescription" label="وصف القسم" value={data?.featuredSolutions.description} />
        <CmsRelationSelector name="selectedSolutionIds" label="الحلول" options={options.solutions} selectedIds={data?.featuredSolutions.selectedSolutionIds} />
      </PageSection>
      <PageSection title="لماذا مظلات جدة؟" description="قدّم أسباب الاختيار في قسم بصري موجز بين الحلول والمشاريع.">
        <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-dashboard-canvas/45 px-3 text-sm font-semibold transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft/45">
          <input className="size-4 accent-primary" defaultChecked={data?.valueProposition.enabled ?? true} name="valuePropositionEnabled" type="checkbox" />
          إظهار القسم في الصفحة الرئيسية
        </label>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="grid gap-4">
            <Text id="valuePropositionEyebrow" label="السطر التمهيدي" value={data?.valueProposition.eyebrow} />
            <Text id="valuePropositionHeading" label="العنوان" value={data?.valueProposition.heading} />
            <Area id="valuePropositionDescription" label="الوصف" value={data?.valueProposition.description} />
          </div>
          <MediaPicker items={media} name="valuePropositionMediaId" defaultValue={data?.valueProposition.mediaId} label="صورة القسم" />
        </div>
        <TwoColumns>
          <Text id="valuePropositionCtaLabel" label="نص الرابط" value={data?.valueProposition.ctaLabel} />
          <Text id="valuePropositionCtaUrl" label="وجهة الرابط" value={data?.valueProposition.ctaUrl} ltr />
        </TwoColumns>
        <SubPanel title="نقاط القيمة" description="يمكن إخفاء كل بند وترتيبه برقم مستقل.">
          <RepeatableItems name="valuePropositionItem" initialItems={data?.valueProposition.items} addLabel="إضافة نقطة" maxItems={8} minimumRows={4} showIcon />
        </SubPanel>
      </PageSection>
      <PageSection title="المشاريع المختارة" description="اعرض أدلة تنفيذ حقيقية تدعم ثقة الزائر.">
        <Text id="projectsTitle" label="عنوان القسم" value={data?.featuredProjects.title} />
        <Area id="projectsDescription" label="وصف القسم" value={data?.featuredProjects.description} />
        <CmsRelationSelector name="selectedProjectIds" label="المشاريع" options={options.projects} selectedIds={data?.featuredProjects.selectedProjectIds} />
      </PageSection>
      <PageSection title="الأسئلة المختارة" description="اختر الأسئلة التي تعالج تردد الزائر قبل التواصل.">
        <Text id="faqTitle" label="عنوان القسم" value={data?.faqSection.title} />
        <CmsRelationSelector name="selectedFaqIds" label="الأسئلة الشائعة" options={options.faqs} selectedIds={data?.faqSection.selectedFaqIds} />
      </PageSection>
      <FinalCta data={data?.finalCta} />
    </>
  );
}

function AboutFields({ data, media }: { data: AboutPageData | null; media: MediaPickerItem[] }) {
  return (
    <>
      <PageSection title="الواجهة الرئيسية" description="قدّم الشركة بوضوح قبل الدخول في التفاصيل." defaultOpen>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="grid gap-4">
            <Text id="heroTitle" label="العنوان" value={data?.hero.title} />
            <Area id="heroDescription" label="الوصف" value={data?.hero.description} />
          </div>
          <MediaPicker items={media} name="heroMediaId" defaultValue={data?.hero.mediaId} label="صورة الواجهة الرئيسية" />
        </div>
      </PageSection>
      <PageSection title="قصة الشركة" description="النص الأساسي الذي يشرح الخبرة وطبيعة العمل.">
        <Text id="storyTitle" label="العنوان" value={data?.companyStory.title} />
        <Area id="storyContent" label="المحتوى" value={data?.companyStory.content} tall />
      </PageSection>
      <PageSection title="القيم" description="لا تضف رسالة أو رؤية أو ادعاءات غير معتمدة.">
        <Text id="valuesTitle" label="عنوان القسم" value={data?.values.title} />
        <RepeatableItems name="valueItem" initialItems={data?.values.items} addLabel="إضافة قيمة" />
      </PageSection>
      <PageSection title="القدرات" description="اشرح ما تستطيع الشركة تنفيذه فعليا.">
        <Text id="capabilitiesTitle" label="عنوان القسم" value={data?.capabilities.title} />
        <Area id="capabilitiesContent" label="المحتوى" value={data?.capabilities.content} tall />
      </PageSection>
      <FinalCta data={data?.finalCta} />
    </>
  );
}

function ContactFields({ data }: { data: ContactPageData | null }) {
  const toggles = [["showPhone", "إظهار الهاتف", data?.showPhone], ["showWhatsapp", "إظهار واتساب", data?.showWhatsapp], ["showEmail", "إظهار البريد الإلكتروني", data?.showEmail], ["showAddress", "إظهار العنوان", data?.showAddress], ["showBusinessHours", "إظهار ساعات العمل", data?.showBusinessHours]] as const;

  return (
    <>
      <PageSection title="الواجهة الرئيسية" description="مهّد للزائر قبل عرض طرق التواصل." defaultOpen>
        <Text id="heroTitle" label="العنوان" value={data?.hero.title} />
        <Area id="heroDescription" label="الوصف" value={data?.hero.description} />
      </PageSection>
      <PageSection title="مقدمة التواصل" description="النص الذي يظهر قبل بيانات الاتصال ونموذج واتساب.">
        <Text id="contactIntroTitle" label="العنوان" value={data?.contactIntro.title} />
        <Area id="contactIntroDescription" label="الوصف" value={data?.contactIntro.description} />
      </PageSection>
      <PageSection title="بيانات التواصل الظاهرة" description="القيم الفعلية تأتي من إعدادات الموقع، وهذه الخيارات تتحكم في ظهورها فقط.">
        <div className="grid gap-3 sm:grid-cols-2">
          {toggles.map(([name, label, checked]) => (
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-dashboard-canvas/45 px-3 text-sm font-semibold transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft/45" key={name}>
              <input className="size-4 accent-primary" name={name} type="checkbox" defaultChecked={checked ?? false} />
              {label}
            </label>
          ))}
        </div>
      </PageSection>
      <PageSection title="الإرشاد الختامي" description="خاتمة قصيرة تدفع الزائر لاختيار قناة التواصل المناسبة.">
        <Text id="finalCtaTitle" label="العنوان" value={data?.finalCta.title} />
        <Area id="finalCtaDescription" label="الوصف" value={data?.finalCta.description} />
      </PageSection>
    </>
  );
}

function PricesFields({ data, options }: { data: PricesPageData | null; options: PageFormProps["relationOptions"] }) {
  return (
    <>
      <PageSection title="الواجهة الرئيسية" description="اشرح منهج التسعير دون اختلاق أسعار." defaultOpen>
        <Text id="heroTitle" label="العنوان" value={data?.hero.title} />
        <Area id="heroDescription" label="الوصف" value={data?.hero.description} />
      </PageSection>
      <PageSection title="مقدمة الأسعار" description="النص الذي يشرح كيف تتغير التكلفة حسب الموقع والمساحة والمواد.">
        <Text id="introTitle" label="العنوان" value={data?.intro.title} />
        <Area id="introContent" label="المحتوى" value={data?.intro.content} tall />
      </PageSection>
      <PageSection title="عوامل التسعير" description="حوّل العوامل المهمة إلى نقاط واضحة يسهل مسحها بصريا.">
        <Text id="pricingFactorsTitle" label="عنوان القسم" value={data?.pricingFactors.title} />
        <RepeatableItems name="pricingFactor" initialItems={data?.pricingFactors.items} addLabel="إضافة عامل" />
      </PageSection>
      <PageSection title="أدلة الأسعار" description="الاختيارات مقالات من نوع دليل أسعار وتظهر تحت /guides فقط.">
        <CmsRelationSelector name="selectedPricingArticleIds" label="أدلة الأسعار المختارة" options={options.articles} selectedIds={data?.selectedPricingArticleIds} />
      </PageSection>
      <PageSection title="الأسئلة المختارة" description="اختر الأسئلة المرتبطة بالسعر وطلب المعاينة.">
        <CmsRelationSelector name="selectedFaqIds" label="الأسئلة الشائعة" options={options.faqs} selectedIds={data?.faqSection.selectedFaqIds} />
      </PageSection>
      <FinalCta data={data?.finalCta} />
    </>
  );
}

function FinalCta({ data }: { data?: { title?: string; description?: string; buttonText?: string; target?: string } }) {
  return (
    <PageSection title="الدعوة الختامية" description="آخر توجيه قبل مغادرة الزائر للصفحة أو التواصل.">
      <Text id="finalCtaTitle" label="العنوان" value={data?.title} />
      <Area id="finalCtaDescription" label="الوصف" value={data?.description} />
      <TwoColumns>
        <Text id="finalCtaButtonText" label="نص الزر" value={data?.buttonText} />
        <Text id="finalCtaTarget" label="وجهة الزر" value={data?.target} ltr />
      </TwoColumns>
    </PageSection>
  );
}

function SeoFields({ version, media }: { version: SeoVersion | null; media: MediaPickerItem[] }) {
  return (
    <PageSection title="SEO" description="حقول اختيارية تستخدم عند حفظ الصفحة وتحديث بيانات المشاركة والفهرسة.">
      <TwoColumns>
        <Text id="seoTitle" label="عنوان SEO" value={version?.seoTitle} />
        <Text id="canonicalUrl" label="الرابط القانوني" value={version?.canonicalUrl} ltr />
      </TwoColumns>
      <Area id="seoDescription" label="وصف SEO" value={version?.seoDescription} />
      <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-dashboard-canvas/45 px-3 text-sm font-semibold transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft/45">
        <input className="size-4 accent-primary" name="noIndex" type="checkbox" defaultChecked={version?.noIndex ?? false} />
        منع الفهرسة
      </label>
      <TwoColumns>
        <Text id="openGraphTitle" label="عنوان Open Graph" value={version?.openGraphTitle} />
        <Area id="openGraphDescription" label="وصف Open Graph" value={version?.openGraphDescription} />
      </TwoColumns>
      <MediaPicker items={media} name="openGraphImageId" defaultValue={version?.openGraphImageId} label="صورة Open Graph" />
    </PageSection>
  );
}

function PageSection({ title, description, children, defaultOpen = false }: { title: string; description?: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 outline-none transition-colors hover:bg-dashboard-hover/45 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-base font-bold leading-7 text-foreground">{title}</span>
          {description ? <span className="mt-0.5 block max-w-[68ch] text-sm leading-6 text-text-secondary">{description}</span> : null}
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-secondary/55 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true">
          <ChevronDown className="size-4" />
        </span>
      </summary>
      <div className="grid gap-4 border-t border-border px-4 py-5 sm:px-6">
        {children}
      </div>
    </details>
  );
}

function Text({ id, label, value, ltr }: { id: string; label: string; value?: string | null; ltr?: boolean }) {
  return <CmsFieldShell id={id} label={label}><CmsInput dir={ltr ? "ltr" : undefined} id={id} name={id} defaultValue={value ?? ""} /></CmsFieldShell>;
}

function Area({ id, label, value, tall }: { id: string; label: string; value?: string | null; tall?: boolean }) {
  return <CmsFieldShell id={id} label={label}><CmsTextarea className={tall ? "min-h-48" : undefined} id={id} name={id} defaultValue={value ?? ""} /></CmsFieldShell>;
}

function TwoColumns({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function SubPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-dashboard-canvas/45 p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-[1.6] text-text-secondary">{description}</p>
      </div>
      {children}
    </div>
  );
}
