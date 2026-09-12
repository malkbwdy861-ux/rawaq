import type { Prisma } from "@prisma/client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, CmsInput, CmsTextarea } from "@/modules/cms/components/form";
import { CmsRelationSelector } from "@/modules/cms/components/relation-selector";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import type { CmsRelationOption } from "@/modules/cms/types";
import { MediaPicker, type MediaPickerItem } from "@/modules/media/components/media-picker";

import { archiveMaterialAction, publishMaterialAction, saveMaterialDraftAction } from "../actions";
import { jsonStringArray } from "../queries";

type MaterialFormVersion = {
  name: string | null;
  slug: string | null;
  shortDescription: string | null;
  content: string | null;
  advantages: Prisma.JsonValue | null;
  limitations: Prisma.JsonValue | null;
  maintenanceNotes: string | null;
  recommendedUses: Prisma.JsonValue | null;
  heroMediaId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  openGraphTitle: string | null;
  openGraphDescription: string | null;
  openGraphImageId: string | null;
  services: { serviceId: string }[];
  solutions: { solutionId: string }[];
  projects: { projectId: string }[];
  articles: { articleId: string }[];
  faqs: { faqId: string }[];
};

export function MaterialForm({ material, media, relationOptions }: { material: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; draftVersion: MaterialFormVersion | null }; media: MediaPickerItem[]; relationOptions: { services: CmsRelationOption[]; solutions: CmsRelationOption[]; projects: CmsRelationOption[]; articles: CmsRelationOption[]; faqs: CmsRelationOption[] } }) {
  const draft = material.draftVersion;

  return (
    <form className="space-y-8" action={saveMaterialDraftAction}>
      <input name="materialId" type="hidden" value={material.id} />
      <div className="flex flex-col gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2">
          <CmsStatusBadge status={{ status: material.status, hasDraftVersion: Boolean(draft), hasPublishedVersion: Boolean(material.publishedVersionId) }} />
          <p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">الحفظ يغير المسودة فقط. لا تضف مزايا أو استخدامات غير مؤكدة من العمل الفعلي.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">حفظ المسودة</Button>
          <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" formAction={publishMaterialAction} type="submit">نشر</Button>
          <Button className="min-h-10 rounded-[4px]" formAction={archiveMaterialAction} type="submit" variant="outline">أرشفة</Button>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/preview/materials/${material.id}`}>معاينة</Link>
        </div>
      </div>

      <CmsFieldGroup title="محتوى المادة" description="هذه الحقول مطلوبة عند النشر وتبقى كمسودة حتى تضغط نشر. يتم إنشاء الرابط المختصر تلقائيًا من الاسم.">
        <CmsFieldShell id="name" label="اسم المادة"><CmsInput id="name" name="name" defaultValue={draft?.name ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="shortDescription" label="الوصف المختصر"><CmsTextarea id="shortDescription" name="shortDescription" defaultValue={draft?.shortDescription ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="content" label="المحتوى"><CmsTextarea className="min-h-64" id="content" name="content" defaultValue={draft?.content ?? ""} /></CmsFieldShell>
      </CmsFieldGroup>

      <CmsFieldGroup title="حقائق المادة" description="اكتب كل بند في سطر مستقل، واترك الحقول غير المؤكدة فارغة.">
        <CmsFieldShell id="advantages" label="المزايا"><CmsTextarea className="min-h-32" id="advantages" name="advantages" defaultValue={jsonStringArray(draft?.advantages).join("\n")} /></CmsFieldShell>
        <CmsFieldShell id="limitations" label="القيود"><CmsTextarea className="min-h-32" id="limitations" name="limitations" defaultValue={jsonStringArray(draft?.limitations).join("\n")} /></CmsFieldShell>
        <CmsFieldShell id="recommendedUses" label="الاستخدامات الموصى بها"><CmsTextarea className="min-h-32" id="recommendedUses" name="recommendedUses" defaultValue={jsonStringArray(draft?.recommendedUses).join("\n")} /></CmsFieldShell>
        <CmsFieldShell id="maintenanceNotes" label="ملاحظات الصيانة"><CmsTextarea className="min-h-32" id="maintenanceNotes" name="maintenanceNotes" defaultValue={draft?.maintenanceNotes ?? ""} /></CmsFieldShell>
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

      <CmsFieldGroup title="العلاقات" description="كل علاقة تحفظ داخل نسخة المادة الحالية ولا تظهر للعامة قبل النشر.">
        <CmsRelationSelector name="relatedServiceIds" label="الخدمات المرتبطة" options={relationOptions.services} selectedIds={draft?.services.map((item) => item.serviceId)} />
        <CmsRelationSelector name="relatedSolutionIds" label="الحلول المرتبطة" options={relationOptions.solutions} selectedIds={draft?.solutions.map((item) => item.solutionId)} />
        <CmsRelationSelector name="relatedProjectIds" label="المشاريع المرتبطة" options={relationOptions.projects} selectedIds={draft?.projects.map((item) => item.projectId)} />
        <CmsRelationSelector name="relatedArticleIds" label="المقالات المرتبطة" options={relationOptions.articles} selectedIds={draft?.articles.map((item) => item.articleId)} />
        <CmsRelationSelector name="relatedFaqIds" label="الأسئلة المرتبطة" options={relationOptions.faqs} selectedIds={draft?.faqs.map((item) => item.faqId)} />
      </CmsFieldGroup>
    </form>
  );
}
