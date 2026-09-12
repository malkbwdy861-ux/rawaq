import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, CmsInput, CmsTextarea } from "@/modules/cms/components/form";
import { CmsRelationSelector } from "@/modules/cms/components/relation-selector";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import type { CmsRelationOption } from "@/modules/cms/types";
import { MediaPicker, type MediaPickerItem } from "@/modules/media/components/media-picker";

import { archiveSolutionAction, publishSolutionAction, saveSolutionDraftAction } from "../actions";

type SolutionFormVersion = {
  title: string | null;
  slug: string | null;
  shortDescription: string | null;
  content: string | null;
  heroMediaId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  openGraphTitle: string | null;
  openGraphDescription: string | null;
  openGraphImageId: string | null;
  services: { serviceId: string }[];
  materials: { materialId: string }[];
  projects: { projectId: string }[];
  articles: { articleId: string }[];
  faqs: { faqId: string }[];
};

export function SolutionForm({ solution, media, relationOptions }: { solution: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; draftVersion: SolutionFormVersion | null }; media: MediaPickerItem[]; relationOptions: { services: CmsRelationOption[]; materials: CmsRelationOption[]; projects: CmsRelationOption[]; articles: CmsRelationOption[]; faqs: CmsRelationOption[] } }) {
  const draft = solution.draftVersion;

  return (
    <form className="space-y-8" action={saveSolutionDraftAction}>
      <input name="solutionId" type="hidden" value={solution.id} />
      <div className="flex flex-col gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2">
          <CmsStatusBadge status={{ status: solution.status, hasDraftVersion: Boolean(draft), hasPublishedVersion: Boolean(solution.publishedVersionId) }} />
          <p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">الحفظ يغير المسودة فقط. النشر ينسخ المسودة إلى نسخة منشورة مستقلة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">حفظ المسودة</Button>
          <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" formAction={publishSolutionAction} type="submit">نشر</Button>
          <Button className="min-h-10 rounded-[4px]" formAction={archiveSolutionAction} type="submit" variant="outline">أرشفة</Button>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/preview/solutions/${solution.id}`}>معاينة</Link>
        </div>
      </div>

      <CmsFieldGroup title="محتوى الحل" description="هذه الحقول مطلوبة عند النشر وتبقى كمسودة حتى تضغط نشر. يتم إنشاء الرابط المختصر تلقائيًا من العنوان.">
        <CmsFieldShell id="title" label="العنوان"><CmsInput id="title" name="title" defaultValue={draft?.title ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="shortDescription" label="الوصف المختصر"><CmsTextarea id="shortDescription" name="shortDescription" defaultValue={draft?.shortDescription ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="content" label="المحتوى"><CmsTextarea className="min-h-64" id="content" name="content" defaultValue={draft?.content ?? ""} /></CmsFieldShell>
      </CmsFieldGroup>

      <CmsFieldGroup title="الوسائط" description="اختر صورة البطل وصورة المشاركة الاجتماعية من الوسائط الدائمة.">
        <MediaPicker items={media} name="heroMediaId" defaultValue={draft?.heroMediaId} label="صورة البطل" />
        <MediaPicker items={media} name="openGraphImageId" defaultValue={draft?.openGraphImageId} label="صورة Open Graph" />
      </CmsFieldGroup>

      <CmsFieldGroup title="SEO" description="حقول اختيارية لتحسين عنوان ووصف الصفحة العامة بعد النشر.">
        <CmsFieldShell id="seoTitle" label="عنوان SEO"><CmsInput id="seoTitle" name="seoTitle" defaultValue={draft?.seoTitle ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="seoDescription" label="وصف SEO"><CmsTextarea id="seoDescription" name="seoDescription" defaultValue={draft?.seoDescription ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="canonicalUrl" label="الرابط القانوني"><CmsInput dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={draft?.canonicalUrl ?? ""} /></CmsFieldShell>
        <label className="flex items-center gap-3 text-sm font-semibold"><input className="size-4 accent-[oklch(37%_0.075_155)]" name="noIndex" type="checkbox" defaultChecked={draft?.noIndex ?? false} />منع الفهرسة بعد النشر</label>
        <CmsFieldShell id="openGraphTitle" label="عنوان Open Graph"><CmsInput id="openGraphTitle" name="openGraphTitle" defaultValue={draft?.openGraphTitle ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="openGraphDescription" label="وصف Open Graph"><CmsTextarea id="openGraphDescription" name="openGraphDescription" defaultValue={draft?.openGraphDescription ?? ""} /></CmsFieldShell>
      </CmsFieldGroup>

      <CmsFieldGroup title="العلاقات" description="كل علاقة تحفظ داخل نسخة الحل الحالية ولا تظهر للعامة قبل النشر.">
        <CmsRelationSelector name="relatedServiceIds" label="الخدمات المرتبطة" options={relationOptions.services} selectedIds={draft?.services.map((item) => item.serviceId)} />
        <CmsRelationSelector name="relatedMaterialIds" label="المواد المرتبطة" options={relationOptions.materials} selectedIds={draft?.materials.map((item) => item.materialId)} />
        <CmsRelationSelector name="relatedProjectIds" label="المشاريع المرتبطة" options={relationOptions.projects} selectedIds={draft?.projects.map((item) => item.projectId)} />
        <CmsRelationSelector name="relatedArticleIds" label="المقالات المرتبطة" options={relationOptions.articles} selectedIds={draft?.articles.map((item) => item.articleId)} />
        <CmsRelationSelector name="relatedFaqIds" label="الأسئلة المرتبطة" options={relationOptions.faqs} selectedIds={draft?.faqs.map((item) => item.faqId)} />
      </CmsFieldGroup>
    </form>
  );
}
