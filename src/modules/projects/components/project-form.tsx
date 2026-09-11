import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, cmsInputClassName } from "@/modules/cms/components/form";
import { CmsRelationSelector } from "@/modules/cms/components/relation-selector";
import { CmsSlugField } from "@/modules/cms/components/slug-field";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import type { CmsRelationOption } from "@/modules/cms/types";
import { MediaPicker, type MediaPickerItem } from "@/modules/media/components/media-picker";

import { archiveProjectAction, publishProjectAction, saveProjectDraftAction } from "../actions";
import { ProjectGalleryEditor } from "./project-gallery-editor";

type ProjectFormVersion = {
  title: string | null;
  slug: string | null;
  shortDescription: string | null;
  content: string | null;
  challenge: string | null;
  solutionSummary: string | null;
  technicalDetails: string | null;
  completedAt: Date | null;
  city: string | null;
  district: string | null;
  coverMediaId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  openGraphTitle: string | null;
  openGraphDescription: string | null;
  openGraphImageId: string | null;
  gallery: { mediaId: string; caption: string | null }[];
  services: { serviceId: string }[];
  solutions: { solutionId: string }[];
  materials: { materialId: string }[];
  articles: { articleId: string }[];
};

type RelationOptions = { services: CmsRelationOption[]; solutions: CmsRelationOption[]; materials: CmsRelationOption[]; articles: CmsRelationOption[] };

export function ProjectForm({ project, media, relationOptions }: { project: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; draftVersion: ProjectFormVersion | null }; media: MediaPickerItem[]; relationOptions: RelationOptions }) {
  const draft = project.draftVersion;
  return (
    <form className="space-y-8" action={saveProjectDraftAction}>
      <input name="projectId" type="hidden" value={project.id} />
      <div className="flex flex-col gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2">
          <CmsStatusBadge status={{ status: project.status, hasDraftVersion: Boolean(draft), hasPublishedVersion: Boolean(project.publishedVersionId) }} />
          <p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">الحفظ يغير المسودة فقط، بما في ذلك الموقع والعلاقات وترتيب المعرض. انشر فقط معلومات مشروع حقيقية.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">حفظ المسودة</Button>
          <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" formAction={publishProjectAction} type="submit">نشر</Button>
          <Button className="min-h-10 rounded-[4px]" formAction={archiveProjectAction} type="submit" variant="outline">أرشفة</Button>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/preview/projects/${project.id}`}>معاينة</Link>
        </div>
      </div>

      <CmsFieldGroup title="محتوى المشروع" description="العنوان والرابط والوصف المختصر مطلوبة عند النشر. يمكن حفظ المسودة قبل اكتمالها.">
        <CmsFieldShell id="title" label="عنوان المشروع"><input className={cmsInputClassName} id="title" name="title" defaultValue={draft?.title ?? ""} /></CmsFieldShell>
        <CmsSlugField defaultValue={draft?.slug} routePrefix="/projects" sourceValue={draft?.title ?? undefined} />
        <CmsFieldShell id="shortDescription" label="الوصف المختصر"><textarea className={`${cmsInputClassName} min-h-24`} id="shortDescription" name="shortDescription" defaultValue={draft?.shortDescription ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="content" label="المحتوى"><textarea className={`${cmsInputClassName} min-h-48`} id="content" name="content" defaultValue={draft?.content ?? ""} /></CmsFieldShell>
      </CmsFieldGroup>

      <CmsFieldGroup title="وقائع المشروع" description="اترك أي معلومة غير موثقة فارغة، ولا تستنتج الموقع أو النطاق أو التفاصيل الفنية.">
        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFieldShell id="city" label="المدينة"><input className={cmsInputClassName} id="city" name="city" defaultValue={draft?.city ?? ""} /></CmsFieldShell>
          <CmsFieldShell id="district" label="الحي"><input className={cmsInputClassName} id="district" name="district" defaultValue={draft?.district ?? ""} /></CmsFieldShell>
        </div>
        <CmsFieldShell id="completedAt" label="تاريخ الإنجاز"><input className={cmsInputClassName} dir="ltr" id="completedAt" name="completedAt" type="date" defaultValue={draft?.completedAt ? draft.completedAt.toISOString().slice(0, 10) : ""} /></CmsFieldShell>
        <CmsFieldShell id="challenge" label="التحدي"><textarea className={`${cmsInputClassName} min-h-32`} id="challenge" name="challenge" defaultValue={draft?.challenge ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="solutionSummary" label="الحل المنفذ"><textarea className={`${cmsInputClassName} min-h-32`} id="solutionSummary" name="solutionSummary" defaultValue={draft?.solutionSummary ?? ""} /></CmsFieldShell>
        <CmsFieldShell id="technicalDetails" label="التفاصيل الفنية"><textarea className={`${cmsInputClassName} min-h-32`} id="technicalDetails" name="technicalDetails" defaultValue={draft?.technicalDetails ?? ""} /></CmsFieldShell>
      </CmsFieldGroup>

      <CmsFieldGroup title="الوسائط" description="اختر غلاف المشروع ثم رتب صور المعرض. يمكن إعادة استخدام أي وسيط دائم.">
        <MediaPicker items={media} name="coverMediaId" defaultValue={draft?.coverMediaId} label="صورة الغلاف" />
        <ProjectGalleryEditor media={media} initialItems={draft?.gallery ?? []} />
        <MediaPicker items={media} name="openGraphImageId" defaultValue={draft?.openGraphImageId} label="صورة Open Graph" />
      </CmsFieldGroup>

      <CmsFieldGroup title="العلاقات" description="تظهر العلاقات العامة فقط بعد نشر نسخة المشروع، وتعرض المحتوى المنشور المرتبط.">
        <CmsRelationSelector name="relatedServiceIds" label="الخدمات المرتبطة" options={relationOptions.services} selectedIds={draft?.services.map((item) => item.serviceId)} />
        <CmsRelationSelector name="relatedSolutionIds" label="الحلول المرتبطة" options={relationOptions.solutions} selectedIds={draft?.solutions.map((item) => item.solutionId)} />
        <CmsRelationSelector name="relatedMaterialIds" label="المواد المرتبطة" options={relationOptions.materials} selectedIds={draft?.materials.map((item) => item.materialId)} />
        <CmsRelationSelector name="relatedArticleIds" label="المقالات المرتبطة" options={relationOptions.articles} selectedIds={draft?.articles.map((item) => item.articleId)} />
      </CmsFieldGroup>

      <CmsFieldGroup title="SEO" description="حقول اختيارية لتحسين عنوان ووصف صفحة المشروع بعد النشر.">
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
