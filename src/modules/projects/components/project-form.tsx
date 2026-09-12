"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CmsFieldShell, CmsInput, CmsTextarea } from "@/modules/cms/components/form";
import type { CmsRelationOption } from "@/modules/cms/types";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";
import { ServiceEditorSubmit } from "@/modules/services/components/service-editor-submit";
import { ServiceMediaField } from "@/modules/services/components/service-media-field";
import { ServiceRelationSelector } from "@/modules/services/components/service-relation-selector";
import { ServiceTextEditor } from "@/modules/services/components/service-text-editor";

import { submitProjectAction, type ProjectFormState, type ProjectFormValues } from "../actions";
import { ProjectGalleryEditor } from "./project-gallery-editor";

type ProjectFormVersion = {
  title: string | null; slug: string | null; shortDescription: string | null; content: string | null;
  challenge: string | null; solutionSummary: string | null; technicalDetails: string | null; completedAt: Date | null;
  city: string | null; district: string | null; coverMediaId: string | null; seoTitle: string | null;
  seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null;
  openGraphDescription: string | null; openGraphImageId: string | null; updatedAt: Date;
  gallery: { mediaId: string; caption: string | null }[]; services: { serviceId: string }[];
  solutions: { solutionId: string }[]; materials: { materialId: string }[]; articles: { articleId: string }[];
};

type RelationOptions = { services: CmsRelationOption[]; solutions: CmsRelationOption[]; materials: CmsRelationOption[]; articles: CmsRelationOption[] };

export function ProjectForm({ project, media, relationOptions }: { project?: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; publishedAt: Date | null; updatedAt: Date; draftVersion: ProjectFormVersion | null }; media: MediaPickerItem[]; relationOptions: RelationOptions }) {
  const draft = project?.draftVersion;
  const initialValues = getInitialValues(project?.id, draft);
  const [state, formAction] = useActionState(submitProjectAction, { status: "idle", revision: 0 } satisfies ProjectFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const values = state.values ?? initialValues;
  const title = project ? values.title || draft?.title || "مشروع بدون عنوان" : "مشروع جديد";
  const published = project?.status === "PUBLISHED";

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.message) toast.error(state.message, { toastId: `project-form-${state.revision}` });
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }, [state.message, state.revision, state.status]);

  return (
    <form action={formAction} noValidate ref={formRef}>
      {project ? <input name="projectId" type="hidden" value={project.id} /> : null}
      <header className="mb-6 border-b border-border pb-5">
        <Link className="inline-flex min-h-8 items-center text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" href="/dashboard/projects">المشاريع <span aria-hidden="true" className="mx-1.5">/</span> <span className="text-foreground">{title}</span></Link>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3"><h1 className="truncate text-2xl font-bold leading-10 sm:text-[1.75rem]">{title}</h1>{project ? <ProjectStatus published={published} /> : null}</div>
          <div className="flex flex-wrap items-center gap-2">{project ? <Link className={cn(buttonVariants({ variant: "outline" }), "min-h-10")} href={`/preview/projects/${project.id}`} target="_blank">معاينة<ExternalLink /></Link> : null}<ServiceEditorSubmit kind="save" /><ServiceEditorSubmit kind="publish" /></div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,820px)_300px]" key={state.revision}>
        <div className="rounded-xl border border-border bg-card px-5 sm:px-7">
          <EditorSection title="المعلومات الأساسية">
            <CmsFieldShell error={fieldError(state, "title")} id="title" label="عنوان المشروع"><CmsInput aria-describedby={fieldError(state, "title") ? "title-error" : undefined} aria-invalid={Boolean(fieldError(state, "title"))} autoFocus className="min-h-12 text-lg font-semibold" defaultValue={values.title} id="title" name="title" placeholder="مثال: مظلات مواقف في حي الروضة" /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "shortDescription")} id="shortDescription" label="الوصف المختصر"><CmsTextarea aria-invalid={Boolean(fieldError(state, "shortDescription"))} className="min-h-28" defaultValue={values.shortDescription} id="shortDescription" name="shortDescription" /></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى">
            <label className="text-[0.8125rem] font-semibold" htmlFor="content">تفاصيل المشروع</label><ServiceTextEditor defaultValue={values.content} error={fieldError(state, "content")} />
          </EditorSection>

          <EditorSection title="وقائع المشروع">
            <div className="grid gap-4 sm:grid-cols-2"><CmsFieldShell error={fieldError(state, "city")} id="city" label="المدينة"><CmsInput aria-invalid={Boolean(fieldError(state, "city"))} defaultValue={values.city} id="city" name="city" /></CmsFieldShell><CmsFieldShell error={fieldError(state, "district")} id="district" label="الحي"><CmsInput aria-invalid={Boolean(fieldError(state, "district"))} defaultValue={values.district} id="district" name="district" /></CmsFieldShell></div>
            <CmsFieldShell error={fieldError(state, "completedAt")} id="completedAt" label="تاريخ الإنجاز"><CmsInput aria-invalid={Boolean(fieldError(state, "completedAt"))} defaultValue={values.completedAt} dir="ltr" id="completedAt" name="completedAt" type="date" /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "challenge")} id="challenge" label="التحدي"><CmsTextarea aria-invalid={Boolean(fieldError(state, "challenge"))} className="min-h-28" defaultValue={values.challenge} id="challenge" name="challenge" /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "solutionSummary")} id="solutionSummary" label="الحل المنفذ"><CmsTextarea aria-invalid={Boolean(fieldError(state, "solutionSummary"))} className="min-h-28" defaultValue={values.solutionSummary} id="solutionSummary" name="solutionSummary" /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "technicalDetails")} id="technicalDetails" label="التفاصيل الفنية"><CmsTextarea aria-invalid={Boolean(fieldError(state, "technicalDetails"))} className="min-h-28" defaultValue={values.technicalDetails} id="technicalDetails" name="technicalDetails" /></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى المرتبط">
            <div className="border-y border-border">
              <ServiceRelationSelector label="الخدمات المرتبطة" name="relatedServiceIds" options={relationOptions.services} selectedIds={values.relatedServiceIds} />
              <ServiceRelationSelector label="الحلول المرتبطة" name="relatedSolutionIds" options={relationOptions.solutions} selectedIds={values.relatedSolutionIds} />
              <ServiceRelationSelector label="المواد المرتبطة" name="relatedMaterialIds" options={relationOptions.materials} selectedIds={values.relatedMaterialIds} />
              <ServiceRelationSelector label="الأدلة المرتبطة" name="relatedArticleIds" options={relationOptions.articles} selectedIds={values.relatedArticleIds} />
            </div>
          </EditorSection>
        </div>

        <aside className="grid min-w-0 gap-3 [&>details]:order-2 xl:sticky xl:top-20 xl:[&>details]:order-3">
          <section className="order-3 min-w-0 rounded-xl border border-border bg-card p-4 xl:order-1">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">النشر</h2>{project ? <ProjectStatus published={published} /> : <span className="text-xs font-medium text-muted-foreground">غير محفوظ</span>}</div>
            {project ? <dl className="mt-4 divide-y divide-border text-xs"><MetaRow label="آخر حفظ" value={(draft?.updatedAt ?? project.updatedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })} /><MetaRow label="الظهور" value={project.publishedVersionId ? "ظاهر للعامة" : "غير ظاهر للعامة"} />{project.publishedAt ? <MetaRow label="آخر نشر" value={project.publishedAt.toLocaleDateString("ar-SA", { dateStyle: "medium" })} /> : null}</dl> : <p className="mt-3 text-xs leading-5 text-text-secondary">سيُنشأ السجل عند الحفظ أو النشر.</p>}
          </section>

          <section className="order-1 min-w-0 rounded-xl border border-border bg-card p-4 xl:order-2"><h2 className="mb-4 text-sm font-semibold">الصور</h2><div className="grid min-w-0 gap-5"><ServiceMediaField defaultValue={values.coverMediaId} error={fieldError(state, "coverMediaId")} items={media} label="صورة الغلاف" name="coverMediaId" /><ProjectGalleryEditor error={fieldError(state, "gallery")} initialItems={values.gallery} media={media} /><ServiceMediaField defaultValue={values.openGraphImageId} error={fieldError(state, "openGraphImageId")} items={media} label="صورة المشاركة" name="openGraphImageId" /></div></section>

          <details className="group rounded-xl border border-border bg-card" open={hasSeoError(state) || undefined}><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-sm font-semibold outline-none transition-colors hover:bg-dashboard-hover focus-visible:ring-2 focus-visible:ring-ring marker:content-none">تهيئة محركات البحث<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary><div className="grid gap-4 border-t border-border p-4"><CmsFieldShell error={fieldError(state, "seoTitle")} id="seoTitle" label="عنوان SEO"><CmsInput aria-invalid={Boolean(fieldError(state, "seoTitle"))} defaultValue={values.seoTitle} id="seoTitle" name="seoTitle" /></CmsFieldShell><CmsFieldShell error={fieldError(state, "seoDescription")} id="seoDescription" label="وصف SEO"><CmsTextarea aria-invalid={Boolean(fieldError(state, "seoDescription"))} defaultValue={values.seoDescription} id="seoDescription" name="seoDescription" /></CmsFieldShell><CmsFieldShell error={fieldError(state, "canonicalUrl")} id="canonicalUrl" label="الرابط القانوني"><CmsInput aria-invalid={Boolean(fieldError(state, "canonicalUrl"))} defaultValue={values.canonicalUrl} dir="ltr" id="canonicalUrl" name="canonicalUrl" /></CmsFieldShell><label className="flex min-h-10 items-center gap-2 text-xs font-medium"><input className="size-4 accent-primary" defaultChecked={values.noIndex} name="noIndex" type="checkbox" />منع الفهرسة</label><CmsFieldShell error={fieldError(state, "openGraphTitle")} id="openGraphTitle" label="عنوان المشاركة"><CmsInput aria-invalid={Boolean(fieldError(state, "openGraphTitle"))} defaultValue={values.openGraphTitle} id="openGraphTitle" name="openGraphTitle" /></CmsFieldShell><CmsFieldShell error={fieldError(state, "openGraphDescription")} id="openGraphDescription" label="وصف المشاركة"><CmsTextarea aria-invalid={Boolean(fieldError(state, "openGraphDescription"))} className="min-h-20" defaultValue={values.openGraphDescription} id="openGraphDescription" name="openGraphDescription" /></CmsFieldShell></div></details>
        </aside>
      </div>
    </form>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-5 border-b border-border py-7 last:border-b-0 sm:py-8"><h2 className="text-lg font-semibold">{title}</h2><div className="grid gap-5">{children}</div></section>; }
function MetaRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="text-end font-medium">{value}</dd></div>; }
function ProjectStatus({ published }: { published: boolean }) { return <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${published ? "bg-success-soft text-success" : "bg-secondary text-text-secondary"}`}><span className="size-1.5 rounded-full bg-current" />{published ? "منشور" : "مسودة"}</span>; }
function fieldError(state: ProjectFormState, name: string) { return state.fieldErrors?.[name]?.[0]; }
function hasSeoError(state: ProjectFormState) { return ["seoTitle", "seoDescription", "canonicalUrl", "openGraphTitle", "openGraphDescription", "openGraphImageId"].some((name) => fieldError(state, name)); }

function getInitialValues(projectId: string | undefined, draft: ProjectFormVersion | null | undefined): ProjectFormValues {
  return {
    projectId,
    title: draft?.title ?? "",
    shortDescription: draft?.shortDescription ?? "",
    content: draft?.content ?? "",
    challenge: draft?.challenge ?? "",
    solutionSummary: draft?.solutionSummary ?? "",
    technicalDetails: draft?.technicalDetails ?? "",
    completedAt: draft?.completedAt?.toISOString().slice(0, 10) ?? "",
    city: draft?.city ?? "",
    district: draft?.district ?? "",
    coverMediaId: draft?.coverMediaId ?? "",
    gallery: draft?.gallery.map((item) => ({ mediaId: item.mediaId, caption: item.caption ?? "" })) ?? [],
    seoTitle: draft?.seoTitle ?? "",
    seoDescription: draft?.seoDescription ?? "",
    canonicalUrl: draft?.canonicalUrl ?? "",
    noIndex: draft?.noIndex ?? false,
    openGraphTitle: draft?.openGraphTitle ?? "",
    openGraphDescription: draft?.openGraphDescription ?? "",
    openGraphImageId: draft?.openGraphImageId ?? "",
    relatedServiceIds: draft?.services.map((item) => item.serviceId) ?? [],
    relatedSolutionIds: draft?.solutions.map((item) => item.solutionId) ?? [],
    relatedMaterialIds: draft?.materials.map((item) => item.materialId) ?? [],
    relatedArticleIds: draft?.articles.map((item) => item.articleId) ?? [],
  };
}
