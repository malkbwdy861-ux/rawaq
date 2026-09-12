import type { PageKey } from "@prisma/client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, CmsInput, CmsTextarea } from "@/modules/cms/components/form";
import { CmsRelationSelector } from "@/modules/cms/components/relation-selector";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import type { CmsRelationOption } from "@/modules/cms/types";
import { MediaPicker, type MediaPickerItem } from "@/modules/media/components/media-picker";

import { publishPageAction, savePageDraftAction } from "../actions";
import type { AboutPageData, ContactPageData, HomePageData, PricesPageData, StaticPageData } from "../validation";
import { RepeatableItems } from "./repeatable-items";

type PageFormProps = {
  page: { id: string; key: PageKey; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; draftVersion: SeoVersion | null };
  draftData: StaticPageData | null;
  media: MediaPickerItem[];
  relationOptions: { services: CmsRelationOption[]; solutions: CmsRelationOption[]; projects: CmsRelationOption[]; faqs: CmsRelationOption[]; articles: CmsRelationOption[] };
};
type SeoVersion = { seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImageId: string | null };

export function PageForm({ page, draftData, media, relationOptions }: PageFormProps) {
  return <form className="space-y-8" action={savePageDraftAction}>
    <input name="pageId" type="hidden" value={page.id} /><input name="key" type="hidden" value={page.key} />
    <div className="flex flex-col gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 md:flex-row md:items-center md:justify-between">
      <div className="grid gap-2"><CmsStatusBadge status={{ status: page.status, hasDraftVersion: Boolean(page.draftVersion), hasPublishedVersion: Boolean(page.publishedVersionId) }} /><p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">الحقول والاختيارات تحفظ في مسودة ثابتة المخطط. لن يتغير العرض العام قبل نجاح النشر.</p></div>
      <div className="flex flex-wrap gap-2"><Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">حفظ المسودة</Button><Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" formAction={publishPageAction} type="submit">نشر الصفحة</Button><Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/preview/pages/${page.key}`}>معاينة</Link></div>
    </div>
    {page.key === "HOME" ? <HomeFields data={draftData as HomePageData | null} media={media} options={relationOptions} /> : null}
    {page.key === "ABOUT" ? <AboutFields data={draftData as AboutPageData | null} media={media} /> : null}
    {page.key === "CONTACT" ? <ContactFields data={draftData as ContactPageData | null} /> : null}
    {page.key === "PRICES" ? <PricesFields data={draftData as PricesPageData | null} options={relationOptions} /> : null}
    <SeoFields version={page.draftVersion} media={media} />
  </form>;
}

function HomeFields({ data, media, options }: { data: HomePageData | null; media: MediaPickerItem[]; options: PageFormProps["relationOptions"] }) {
  return <>
    <CmsFieldGroup title="بطل الصفحة" description="رسالة رئيسية واحدة مع إجراء أساسي وإجراء ثانوي اختياري."><Text id="heroTitle" label="العنوان" value={data?.hero.title} /><Area id="heroDescription" label="الوصف" value={data?.hero.description} /><div className="grid gap-4 sm:grid-cols-2"><Text id="primaryCtaText" label="نص الإجراء الرئيسي" value={data?.hero.primaryCtaText} /><Text id="primaryCtaTarget" label="وجهة الإجراء الرئيسي" value={data?.hero.primaryCtaTarget} ltr /></div><div className="grid gap-4 sm:grid-cols-2"><Text id="secondaryCtaText" label="نص الإجراء الثانوي" value={data?.hero.secondaryCtaText} /><Text id="secondaryCtaTarget" label="وجهة الإجراء الثانوي" value={data?.hero.secondaryCtaTarget} ltr /></div><MediaPicker items={media} name="heroMediaId" defaultValue={data?.hero.mediaId} label="صورة البطل" /></CmsFieldGroup>
    <CmsFieldGroup title="الخدمات المختارة"><Text id="servicesTitle" label="عنوان القسم" value={data?.featuredServices.title} /><Area id="servicesDescription" label="وصف القسم" value={data?.featuredServices.description} /><CmsRelationSelector name="selectedServiceIds" label="الخدمات" options={options.services} selectedIds={data?.featuredServices.selectedServiceIds} /></CmsFieldGroup>
    <CmsFieldGroup title="الحلول المختارة"><Text id="solutionsTitle" label="عنوان القسم" value={data?.featuredSolutions.title} /><Area id="solutionsDescription" label="وصف القسم" value={data?.featuredSolutions.description} /><CmsRelationSelector name="selectedSolutionIds" label="الحلول" options={options.solutions} selectedIds={data?.featuredSolutions.selectedSolutionIds} /></CmsFieldGroup>
    <CmsFieldGroup title="المشاريع المختارة"><Text id="projectsTitle" label="عنوان القسم" value={data?.featuredProjects.title} /><Area id="projectsDescription" label="وصف القسم" value={data?.featuredProjects.description} /><CmsRelationSelector name="selectedProjectIds" label="المشاريع" options={options.projects} selectedIds={data?.featuredProjects.selectedProjectIds} /></CmsFieldGroup>
    <CmsFieldGroup title="محتوى الثقة" description="أضف فقط فوائد أو وقائع معتمدة، دون اختلاق أرقام أو شهادات."><Text id="trustTitle" label="عنوان القسم" value={data?.trustSection.title} /><Area id="trustDescription" label="وصف القسم" value={data?.trustSection.description} /><RepeatableItems name="trustItem" initialItems={data?.trustSection.items} addLabel="إضافة بند" /></CmsFieldGroup>
    <CmsFieldGroup title="الأسئلة المختارة"><Text id="faqTitle" label="عنوان القسم" value={data?.faqSection.title} /><CmsRelationSelector name="selectedFaqIds" label="الأسئلة الشائعة" options={options.faqs} selectedIds={data?.faqSection.selectedFaqIds} /></CmsFieldGroup>
    <FinalCta data={data?.finalCta} />
  </>;
}

function AboutFields({ data, media }: { data: AboutPageData | null; media: MediaPickerItem[] }) {
  return <><CmsFieldGroup title="بطل الصفحة"><Text id="heroTitle" label="العنوان" value={data?.hero.title} /><Area id="heroDescription" label="الوصف" value={data?.hero.description} /><MediaPicker items={media} name="heroMediaId" defaultValue={data?.hero.mediaId} label="صورة البطل" /></CmsFieldGroup><CmsFieldGroup title="قصة الشركة"><Text id="storyTitle" label="العنوان" value={data?.companyStory.title} /><Area id="storyContent" label="المحتوى" value={data?.companyStory.content} tall /></CmsFieldGroup><CmsFieldGroup title="القيم" description="لا تضف رسالة أو رؤية أو ادعاءات غير معتمدة."><Text id="valuesTitle" label="عنوان القسم" value={data?.values.title} /><RepeatableItems name="valueItem" initialItems={data?.values.items} addLabel="إضافة قيمة" /></CmsFieldGroup><CmsFieldGroup title="القدرات"><Text id="capabilitiesTitle" label="عنوان القسم" value={data?.capabilities.title} /><Area id="capabilitiesContent" label="المحتوى" value={data?.capabilities.content} tall /></CmsFieldGroup><FinalCta data={data?.finalCta} /></>;
}

function ContactFields({ data }: { data: ContactPageData | null }) {
  const toggles = [["showPhone", "إظهار الهاتف", data?.showPhone], ["showWhatsapp", "إظهار واتساب", data?.showWhatsapp], ["showEmail", "إظهار البريد الإلكتروني", data?.showEmail], ["showAddress", "إظهار العنوان", data?.showAddress], ["showBusinessHours", "إظهار ساعات العمل", data?.showBusinessHours]] as const;
  return <><CmsFieldGroup title="بطل الصفحة"><Text id="heroTitle" label="العنوان" value={data?.hero.title} /><Area id="heroDescription" label="الوصف" value={data?.hero.description} /></CmsFieldGroup><CmsFieldGroup title="مقدمة التواصل"><Text id="contactIntroTitle" label="العنوان" value={data?.contactIntro.title} /><Area id="contactIntroDescription" label="الوصف" value={data?.contactIntro.description} /></CmsFieldGroup><CmsFieldGroup title="بيانات التواصل الظاهرة" description="القيم الفعلية تأتي من إعدادات الموقع، وهذه الخيارات تتحكم في ظهورها فقط.">{toggles.map(([name, label, checked]) => <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" key={name}><input className="size-4 accent-[oklch(37%_0.075_155)]" name={name} type="checkbox" defaultChecked={checked ?? false} />{label}</label>)}</CmsFieldGroup><CmsFieldGroup title="الإرشاد الختامي"><Text id="finalCtaTitle" label="العنوان" value={data?.finalCta.title} /><Area id="finalCtaDescription" label="الوصف" value={data?.finalCta.description} /></CmsFieldGroup></>;
}

function PricesFields({ data, options }: { data: PricesPageData | null; options: PageFormProps["relationOptions"] }) {
  return <><CmsFieldGroup title="بطل الصفحة" description="اشرح منهج التسعير دون اختلاق أسعار."><Text id="heroTitle" label="العنوان" value={data?.hero.title} /><Area id="heroDescription" label="الوصف" value={data?.hero.description} /></CmsFieldGroup><CmsFieldGroup title="مقدمة الأسعار"><Text id="introTitle" label="العنوان" value={data?.intro.title} /><Area id="introContent" label="المحتوى" value={data?.intro.content} tall /></CmsFieldGroup><CmsFieldGroup title="عوامل التسعير"><Text id="pricingFactorsTitle" label="عنوان القسم" value={data?.pricingFactors.title} /><RepeatableItems name="pricingFactor" initialItems={data?.pricingFactors.items} addLabel="إضافة عامل" /></CmsFieldGroup><CmsFieldGroup title="أدلة الأسعار" description="الاختيارات مقالات من نوع دليل أسعار وتظهر تحت /guides فقط."><CmsRelationSelector name="selectedPricingArticleIds" label="أدلة الأسعار المختارة" options={options.articles} selectedIds={data?.selectedPricingArticleIds} /></CmsFieldGroup><CmsFieldGroup title="الأسئلة المختارة"><CmsRelationSelector name="selectedFaqIds" label="الأسئلة الشائعة" options={options.faqs} selectedIds={data?.faqSection.selectedFaqIds} /></CmsFieldGroup><FinalCta data={data?.finalCta} /></>;
}

function FinalCta({ data }: { data?: { title?: string; description?: string; buttonText?: string; target?: string } }) { return <CmsFieldGroup title="الدعوة الختامية"><Text id="finalCtaTitle" label="العنوان" value={data?.title} /><Area id="finalCtaDescription" label="الوصف" value={data?.description} /><div className="grid gap-4 sm:grid-cols-2"><Text id="finalCtaButtonText" label="نص الزر" value={data?.buttonText} /><Text id="finalCtaTarget" label="وجهة الزر" value={data?.target} ltr /></div></CmsFieldGroup>; }
function Text({ id, label, value, ltr }: { id: string; label: string; value?: string | null; ltr?: boolean }) { return <CmsFieldShell id={id} label={label}><CmsInput dir={ltr ? "ltr" : undefined} id={id} name={id} defaultValue={value ?? ""} /></CmsFieldShell>; }
function Area({ id, label, value, tall }: { id: string; label: string; value?: string | null; tall?: boolean }) { return <CmsFieldShell id={id} label={label}><CmsTextarea className={tall ? "min-h-48" : undefined} id={id} name={id} defaultValue={value ?? ""} /></CmsFieldShell>; }
function SeoFields({ version, media }: { version: SeoVersion | null; media: MediaPickerItem[] }) { return <CmsFieldGroup title="SEO" description="حقول اختيارية تخص النسخة المنشورة من هذه الصفحة."><Text id="seoTitle" label="عنوان SEO" value={version?.seoTitle} /><Area id="seoDescription" label="وصف SEO" value={version?.seoDescription} /><Text id="canonicalUrl" label="الرابط القانوني" value={version?.canonicalUrl} ltr /><label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input className="size-4 accent-[oklch(37%_0.075_155)]" name="noIndex" type="checkbox" defaultChecked={version?.noIndex ?? false} />منع الفهرسة بعد النشر</label><Text id="openGraphTitle" label="عنوان Open Graph" value={version?.openGraphTitle} /><Area id="openGraphDescription" label="وصف Open Graph" value={version?.openGraphDescription} /><MediaPicker items={media} name="openGraphImageId" defaultValue={version?.openGraphImageId} label="صورة Open Graph" /></CmsFieldGroup>; }
