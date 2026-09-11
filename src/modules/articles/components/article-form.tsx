import type { ArticleType, Prisma } from "@prisma/client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, cmsInputClassName } from "@/modules/cms/components/form";
import { CmsRelationSelector } from "@/modules/cms/components/relation-selector";
import { CmsSlugField } from "@/modules/cms/components/slug-field";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import type { CmsRelationOption } from "@/modules/cms/types";
import { MediaPicker, type MediaPickerItem } from "@/modules/media/components/media-picker";

import { archiveArticleAction, publishArticleAction, saveArticleDraftAction } from "../actions";
import { isTipTapDocument } from "../content";
import { RichTextEditor } from "./rich-text-editor";

type ArticleFormVersion = {
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: Prisma.JsonValue;
  heroMediaId: string | null;
  articleType: ArticleType | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  openGraphTitle: string | null;
  openGraphDescription: string | null;
  openGraphImageId: string | null;
  services: { serviceId: string }[];
  solutions: { solutionId: string }[];
  materials: { materialId: string }[];
  projects: { projectId: string }[];
  faqs: { faqId: string }[];
};

type RelationOptions = { services: CmsRelationOption[]; solutions: CmsRelationOption[]; materials: CmsRelationOption[]; projects: CmsRelationOption[]; faqs: CmsRelationOption[] };

const articleTypes = [
  ["", "بدون تصنيف"], ["GUIDE", "دليل"], ["PRICING", "دليل أسعار"], ["COMPARISON", "مقارنة"], ["MAINTENANCE", "صيانة"], ["GENERAL", "عام"],
] as const;

export function ArticleForm({ article, media, relationOptions }: { article: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; draftVersion: ArticleFormVersion | null }; media: MediaPickerItem[]; relationOptions: RelationOptions }) {
  const draft = article.draftVersion;
  return (
    <form className="space-y-8" action={saveArticleDraftAction}>
      <input name="articleId" type="hidden" value={article.id} />
      <div className="flex flex-col gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2">
          <CmsStatusBadge status={{ status: article.status, hasDraftVersion: Boolean(draft), hasPublishedVersion: Boolean(article.publishedVersionId) }} />
          <p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">الحفظ يغير مسودة المقال وعلاقاتها فقط. النشر ينشئ نسخة عامة مستقلة تحت /guides.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">حفظ المسودة</Button>
          <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" formAction={publishArticleAction} type="submit">نشر</Button>
          <Button className="min-h-10 rounded-[4px]" formAction={archiveArticleAction} type="submit" variant="outline">أرشفة</Button>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/preview/articles/${article.id}`}>معاينة</Link>
        </div>
      </div>

      <CmsFieldGroup title="محتوى المقال" description="العنوان والرابط والمقتطف والمحتوى مطلوبة عند النشر. يمكن حفظ مسودة غير مكتملة.">
        <CmsFieldShell id="title" label="عنوان المقال"><input className={cmsInputClassName} id="title" name="title" defaultValue={draft?.title ?? ""} /></CmsFieldShell>
        <CmsSlugField defaultValue={draft?.slug} routePrefix="/guides" sourceValue={draft?.title ?? undefined} />
        <CmsFieldShell id="excerpt" label="المقتطف"><textarea className={`${cmsInputClassName} min-h-24`} id="excerpt" name="excerpt" defaultValue={draft?.excerpt ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="articleType" label="نوع المقال"><select className={cmsInputClassName} id="articleType" name="articleType" defaultValue={draft?.articleType ?? ""}>{articleTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></CmsFieldShell>
        <CmsFieldShell id="article-content" label="المحتوى" hint="التنسيقات المتاحة محصورة في العناوين والقوائم والاقتباس والروابط الآمنة."><RichTextEditor defaultValue={isTipTapDocument(draft?.content) ? draft.content : null} /></CmsFieldShell>
      </CmsFieldGroup>

      <CmsFieldGroup title="الوسائط" description="اختر صورة بطل بنسبة مناسبة للدليل وصورة مشاركة اجتماعية من الوسائط الدائمة.">
        <MediaPicker items={media} name="heroMediaId" defaultValue={draft?.heroMediaId} label="صورة البطل" />
        <MediaPicker items={media} name="openGraphImageId" defaultValue={draft?.openGraphImageId} label="صورة Open Graph" />
      </CmsFieldGroup>

      <CmsFieldGroup title="العلاقات" description="العلاقات محفوظة داخل نسخة المقال، ولا تظهر للعامة حتى نشرها ونشر المحتوى المرتبط.">
        <CmsRelationSelector name="relatedServiceIds" label="الخدمات المرتبطة" options={relationOptions.services} selectedIds={draft?.services.map((item) => item.serviceId)} />
        <CmsRelationSelector name="relatedSolutionIds" label="الحلول المرتبطة" options={relationOptions.solutions} selectedIds={draft?.solutions.map((item) => item.solutionId)} />
        <CmsRelationSelector name="relatedMaterialIds" label="المواد المرتبطة" options={relationOptions.materials} selectedIds={draft?.materials.map((item) => item.materialId)} />
        <CmsRelationSelector name="relatedProjectIds" label="المشاريع المرتبطة" options={relationOptions.projects} selectedIds={draft?.projects.map((item) => item.projectId)} />
        <CmsRelationSelector name="relatedFaqIds" label="الأسئلة المرتبطة" options={relationOptions.faqs} selectedIds={draft?.faqs.map((item) => item.faqId)} />
      </CmsFieldGroup>

      <CmsFieldGroup title="SEO" description="حقول اختيارية لتحسين عنوان ووصف الدليل العام بعد النشر.">
        <CmsFieldShell id="seoTitle" label="عنوان SEO"><input className={cmsInputClassName} id="seoTitle" name="seoTitle" defaultValue={draft?.seoTitle ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="seoDescription" label="وصف SEO"><textarea className={`${cmsInputClassName} min-h-24`} id="seoDescription" name="seoDescription" defaultValue={draft?.seoDescription ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="canonicalUrl" label="الرابط القانوني"><input className={cmsInputClassName} dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={draft?.canonicalUrl ?? ""} /></CmsFieldShell>
        <label className="flex items-center gap-3 text-sm font-semibold"><input className="size-4 accent-[oklch(37%_0.075_155)]" name="noIndex" type="checkbox" defaultChecked={draft?.noIndex ?? false} />منع الفهرسة بعد النشر</label>
        <CmsFieldShell id="openGraphTitle" label="عنوان Open Graph"><input className={cmsInputClassName} id="openGraphTitle" name="openGraphTitle" defaultValue={draft?.openGraphTitle ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="openGraphDescription" label="وصف Open Graph"><textarea className={`${cmsInputClassName} min-h-24`} id="openGraphDescription" name="openGraphDescription" defaultValue={draft?.openGraphDescription ?? ""} /></CmsFieldShell>
      </CmsFieldGroup>
    </form>
  );
}
