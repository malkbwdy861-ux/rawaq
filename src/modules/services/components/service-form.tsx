import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, cmsInputClassName } from "@/modules/cms/components/form";
import { CmsRelationSelector } from "@/modules/cms/components/relation-selector";
import { CmsSlugField } from "@/modules/cms/components/slug-field";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import type { CmsRelationOption } from "@/modules/cms/types";
import { MediaPicker, type MediaPickerItem } from "@/modules/media/components/media-picker";

import { archiveServiceAction, publishServiceAction, saveServiceDraftAction } from "../actions";

type ServiceFormVersion = {
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
  solutions: { solutionId: string }[];
  materials: { materialId: string }[];
  projects: { projectId: string }[];
  articles: { articleId: string }[];
  faqs: { faqId: string }[];
};

export function ServiceForm({
  service,
  media,
  relationOptions,
}: {
  service: {
    id: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    publishedVersionId: string | null;
    draftVersion: ServiceFormVersion | null;
  };
  media: MediaPickerItem[];
  relationOptions: {
    solutions: CmsRelationOption[];
    materials: CmsRelationOption[];
    projects: CmsRelationOption[];
    articles: CmsRelationOption[];
    faqs: CmsRelationOption[];
  };
}) {
  const draft = service.draftVersion;

  return (
    <form className="space-y-8" action={saveServiceDraftAction}>
      <input name="serviceId" type="hidden" value={service.id} />

      <div className="flex flex-col gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2">
          <CmsStatusBadge status={{ status: service.status, hasDraftVersion: Boolean(draft), hasPublishedVersion: Boolean(service.publishedVersionId) }} />
          <p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">
            الحفظ يغير المسودة فقط. النشر ينسخ المسودة إلى نسخة منشورة مستقلة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">
            حفظ المسودة
          </Button>
          <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" formAction={publishServiceAction} type="submit">
            نشر
          </Button>
          <Button className="min-h-10 rounded-[4px]" formAction={archiveServiceAction} type="submit" variant="outline">
            أرشفة
          </Button>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/preview/services/${service.id}`}>
            معاينة
          </Link>
        </div>
      </div>

      <CmsFieldGroup title="محتوى الخدمة" description="هذه الحقول مطلوبة عند النشر وتبقى كمسودة حتى تضغط نشر.">
        <CmsFieldShell id="title" label="العنوان">
          <input className={cmsInputClassName} id="title" name="title" defaultValue={draft?.title ?? ""} />
        </CmsFieldShell>
        <CmsSlugField defaultValue={draft?.slug} routePrefix="/services" sourceValue={draft?.title ?? undefined} />
        <CmsFieldShell id="shortDescription" label="الوصف المختصر">
          <textarea className={`${cmsInputClassName} min-h-24`} id="shortDescription" name="shortDescription" defaultValue={draft?.shortDescription ?? ""} />
        </CmsFieldShell>
        <CmsFieldShell id="content" label="المحتوى">
          <textarea className={`${cmsInputClassName} min-h-64`} id="content" name="content" defaultValue={draft?.content ?? ""} />
        </CmsFieldShell>
      </CmsFieldGroup>

      <CmsFieldGroup title="الوسائط" description="اختر صورة البطل وصورة المشاركة الاجتماعية من الوسائط الدائمة.">
        <MediaPicker items={media} name="heroMediaId" defaultValue={draft?.heroMediaId} label="صورة البطل" />
        <MediaPicker items={media} name="openGraphImageId" defaultValue={draft?.openGraphImageId} label="صورة Open Graph" />
      </CmsFieldGroup>

      <CmsFieldGroup title="SEO" description="حقول اختيارية لتحسين عنوان ووصف الصفحة العامة بعد النشر.">
        <CmsFieldShell id="seoTitle" label="عنوان SEO">
          <input className={cmsInputClassName} id="seoTitle" name="seoTitle" defaultValue={draft?.seoTitle ?? ""} />
        </CmsFieldShell>
        <CmsFieldShell id="seoDescription" label="وصف SEO">
          <textarea className={`${cmsInputClassName} min-h-24`} id="seoDescription" name="seoDescription" defaultValue={draft?.seoDescription ?? ""} />
        </CmsFieldShell>
        <CmsFieldShell id="canonicalUrl" label="الرابط القانوني">
          <input className={cmsInputClassName} dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={draft?.canonicalUrl ?? ""} />
        </CmsFieldShell>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input className="size-4 accent-[oklch(37%_0.075_155)]" name="noIndex" type="checkbox" defaultChecked={draft?.noIndex ?? false} />
          منع الفهرسة بعد النشر
        </label>
        <CmsFieldShell id="openGraphTitle" label="عنوان Open Graph">
          <input className={cmsInputClassName} id="openGraphTitle" name="openGraphTitle" defaultValue={draft?.openGraphTitle ?? ""} />
        </CmsFieldShell>
        <CmsFieldShell id="openGraphDescription" label="وصف Open Graph">
          <textarea className={`${cmsInputClassName} min-h-24`} id="openGraphDescription" name="openGraphDescription" defaultValue={draft?.openGraphDescription ?? ""} />
        </CmsFieldShell>
      </CmsFieldGroup>

      <CmsFieldGroup title="العلاقات" description="كل علاقة تحفظ داخل نسخة الخدمة الحالية ولا تظهر للعامة قبل النشر.">
        <CmsRelationSelector name="relatedSolutionIds" label="الحلول المرتبطة" options={relationOptions.solutions} selectedIds={draft?.solutions.map((item) => item.solutionId)} />
        <CmsRelationSelector name="relatedMaterialIds" label="المواد المرتبطة" options={relationOptions.materials} selectedIds={draft?.materials.map((item) => item.materialId)} />
        <CmsRelationSelector name="relatedProjectIds" label="المشاريع المرتبطة" options={relationOptions.projects} selectedIds={draft?.projects.map((item) => item.projectId)} />
        <CmsRelationSelector name="relatedArticleIds" label="المقالات المرتبطة" options={relationOptions.articles} selectedIds={draft?.articles.map((item) => item.articleId)} />
        <CmsRelationSelector name="relatedFaqIds" label="الأسئلة المرتبطة" options={relationOptions.faqs} selectedIds={draft?.faqs.map((item) => item.faqId)} />
      </CmsFieldGroup>
    </form>
  );
}
