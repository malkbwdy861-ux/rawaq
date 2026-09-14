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

import { submitServiceAction, type ServiceFormState, type ServiceFormValues } from "../actions";
import { ServiceEditorSubmit } from "./service-editor-submit";
import { ServiceMediaField } from "./service-media-field";
import { ServiceRelationSelector } from "./service-relation-selector";
import { ServiceTextEditor } from "./service-text-editor";

type ServiceFormVersion = {
  title: string | null; slug: string | null; shortDescription: string | null; content: string | null; heroMediaId: string | null; seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImageId: string | null; updatedAt: Date;
  solutions: { solutionId: string }[]; materials: { materialId: string }[]; projects: { projectId: string }[]; articles: { articleId: string }[]; faqs: { faqId: string }[];
};

export function ServiceForm({ service, media, relationOptions }: { service?: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; publishedAt: Date | null; updatedAt: Date; draftVersion: ServiceFormVersion | null }; media: MediaPickerItem[]; relationOptions: { solutions: CmsRelationOption[]; materials: CmsRelationOption[]; projects: CmsRelationOption[]; articles: CmsRelationOption[]; faqs: CmsRelationOption[] } }) {
  const draft = service?.draftVersion;
  const initialValues = getInitialValues(service?.id, draft);
  const [state, formAction] = useActionState(submitServiceAction, { status: "idle", revision: 0 } satisfies ServiceFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const values = state.values ?? initialValues;
  const title = service ? values.title || draft?.title || "خدمة بدون عنوان" : "خدمة جديدة";
  const published = service?.status === "PUBLISHED";

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.message) toast.error(state.message, { toastId: `service-form-${state.revision}` });
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }, [state.message, state.revision, state.status]);

  return (
    <form action={formAction} noValidate ref={formRef}>
      {service ? <input name="serviceId" type="hidden" value={service.id} /> : null}
      <header className="mb-6 border-b border-border pb-5">
        <Link className="inline-flex min-h-8 items-center text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-brand-accent-strong focus-visible:ring-2 focus-visible:ring-ring" href="/dashboard/services">الخدمات <span aria-hidden="true" className="mx-1.5">/</span> <span className="text-foreground">{title}</span></Link>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3"><h1 className="truncate text-2xl font-bold leading-10 sm:text-[1.75rem]">{title}</h1>{service ? <ServiceStatus published={published} /> : null}</div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,820px)_300px]" key={state.revision}>
        <div className="rounded-xl border border-border bg-card px-5 sm:px-7">
          <EditorSection title="المعلومات الأساسية">
            <CmsFieldShell error={fieldError(state, "title")} id="title" label="عنوان الخدمة"><CmsInput aria-describedby={fieldError(state, "title") ? "title-error" : undefined} aria-invalid={Boolean(fieldError(state, "title"))} autoFocus className="min-h-12 text-lg font-semibold" id="title" name="title" defaultValue={values.title} placeholder="مثال: مظلات السيارات" /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "shortDescription")} id="shortDescription" label="الوصف المختصر"><CmsTextarea aria-describedby={fieldError(state, "shortDescription") ? "shortDescription-error" : undefined} aria-invalid={Boolean(fieldError(state, "shortDescription"))} className="min-h-28" id="shortDescription" name="shortDescription" defaultValue={values.shortDescription} /></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى">
            <label className="text-[0.8125rem] font-semibold" htmlFor="content">تفاصيل الخدمة</label><ServiceTextEditor defaultValue={values.content} error={fieldError(state, "content")} />
          </EditorSection>

          <EditorSection title="المحتوى المرتبط">
            <div className="border-y border-border">
              <ServiceRelationSelector label="الحلول المرتبطة" name="relatedSolutionIds" options={relationOptions.solutions} selectedIds={values.relatedSolutionIds} />
              <ServiceRelationSelector label="المواد المرتبطة" name="relatedMaterialIds" options={relationOptions.materials} selectedIds={values.relatedMaterialIds} />
              <ServiceRelationSelector label="المشاريع المرتبطة" name="relatedProjectIds" options={relationOptions.projects} selectedIds={values.relatedProjectIds} />
              <ServiceRelationSelector label="المقالات المرتبطة" name="relatedArticleIds" options={relationOptions.articles} selectedIds={values.relatedArticleIds} />
              <ServiceRelationSelector label="الأسئلة المرتبطة" name="relatedFaqIds" options={relationOptions.faqs} selectedIds={values.relatedFaqIds} />
            </div>
          </EditorSection>
        </div>

        <aside className="grid min-w-0 gap-3 [&>details]:order-2 xl:sticky xl:top-20 xl:[&>details]:order-3">
          <section className="order-3 min-w-0 rounded-xl border border-border bg-card p-4 xl:order-1">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">النشر</h2>{service ? <ServiceStatus published={published} /> : <span className="text-xs font-medium text-muted-foreground">غير محفوظة</span>}</div>
            {service ? <dl className="mt-4 divide-y divide-border text-xs"><MetaRow label="آخر حفظ" value={(draft?.updatedAt ?? service.updatedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })} /><MetaRow label="الظهور" value={service.publishedVersionId ? "ظاهرة للعامة" : "غير ظاهرة للعامة"} />{service.publishedAt ? <MetaRow label="آخر نشر" value={service.publishedAt.toLocaleDateString("ar-SA", { dateStyle: "medium" })} /> : null}</dl> : <p className="mt-3 text-xs leading-5 text-text-secondary">سيُنشأ السجل عند الحفظ أو النشر.</p>}
          </section>

          <section className="order-1 min-w-0 rounded-xl border border-border bg-card p-4 xl:order-2"><h2 className="mb-4 text-sm font-semibold">الصور</h2><div className="grid min-w-0 gap-5"><ServiceMediaField defaultValue={values.heroMediaId} error={fieldError(state, "heroMediaId")} items={media} label="الصورة الرئيسية" name="heroMediaId" /><ServiceMediaField defaultValue={values.openGraphImageId} error={fieldError(state, "openGraphImageId")} items={media} label="صورة المشاركة" name="openGraphImageId" /></div></section>

          <details className="group rounded-xl border border-border bg-card" open={hasSeoError(state) || undefined}><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-sm font-semibold outline-none transition-colors hover:bg-dashboard-hover focus-visible:ring-2 focus-visible:ring-ring marker:content-none">محركات البحث<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary><div className="grid gap-4 border-t border-border p-4"><CmsFieldShell error={fieldError(state, "seoTitle")} id="seoTitle" label="عنوان محركات البحث"><CmsInput aria-invalid={Boolean(fieldError(state, "seoTitle"))} id="seoTitle" name="seoTitle" defaultValue={values.seoTitle} /></CmsFieldShell><CmsFieldShell error={fieldError(state, "seoDescription")} id="seoDescription" label="وصف محركات البحث"><CmsTextarea aria-invalid={Boolean(fieldError(state, "seoDescription"))} id="seoDescription" name="seoDescription" defaultValue={values.seoDescription} /></CmsFieldShell><CmsFieldShell error={fieldError(state, "canonicalUrl")} id="canonicalUrl" label="الرابط الأساسي"><CmsInput aria-invalid={Boolean(fieldError(state, "canonicalUrl"))} dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={values.canonicalUrl} /></CmsFieldShell><label className="flex min-h-10 items-center gap-2 text-xs font-medium"><input className="size-4 accent-primary" name="noIndex" type="checkbox" defaultChecked={values.noIndex} />منع الفهرسة</label><CmsFieldShell error={fieldError(state, "openGraphTitle")} id="openGraphTitle" label="عنوان المشاركة"><CmsInput aria-invalid={Boolean(fieldError(state, "openGraphTitle"))} id="openGraphTitle" name="openGraphTitle" defaultValue={values.openGraphTitle} /></CmsFieldShell><CmsFieldShell error={fieldError(state, "openGraphDescription")} id="openGraphDescription" label="وصف المشاركة"><CmsTextarea aria-invalid={Boolean(fieldError(state, "openGraphDescription"))} className="min-h-20" id="openGraphDescription" name="openGraphDescription" defaultValue={values.openGraphDescription} /></CmsFieldShell></div></details>
        </aside>
      </div>

      <div className="sticky bottom-4 z-10 mt-5 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-float)] sm:flex-row sm:items-center sm:justify-between">
        <p className="hidden text-sm leading-6 text-text-secondary sm:block">احفظ الخدمة كمسودة للمراجعة، أو انشرها عند اكتمال المحتوى والصور.</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {service ? <Link className={cn(buttonVariants({ variant: "outline" }), "min-h-11 w-full px-5 sm:w-auto")} href={`/preview/services/${service.id}`} target="_blank">معاينة<ExternalLink /></Link> : null}
          <ServiceEditorSubmit className="min-h-11 w-full px-5 sm:w-auto" kind="save" />
          <ServiceEditorSubmit className="min-h-11 w-full px-5 sm:w-auto" kind="publish" />
        </div>
      </div>
    </form>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-5 border-b border-border py-7 last:border-b-0 sm:py-8"><h2 className="text-lg font-semibold">{title}</h2><div className="grid gap-5">{children}</div></section>; }
function MetaRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="text-end font-medium">{value}</dd></div>; }
function ServiceStatus({ published }: { published: boolean }) { return <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${published ? "bg-success-soft text-success" : "bg-secondary text-text-secondary"}`}><span className="size-1.5 rounded-full bg-current" />{published ? "منشور" : "مسودة"}</span>; }

function fieldError(state: ServiceFormState, name: string) { return state.fieldErrors?.[name]?.[0]; }
function hasSeoError(state: ServiceFormState) { return ["seoTitle", "seoDescription", "canonicalUrl", "openGraphTitle", "openGraphDescription", "openGraphImageId"].some((name) => fieldError(state, name)); }
function getInitialValues(serviceId: string | undefined, draft: ServiceFormVersion | null | undefined): ServiceFormValues {
  return {
    serviceId,
    title: draft?.title ?? "",
    shortDescription: draft?.shortDescription ?? "",
    content: draft?.content ?? "",
    heroMediaId: draft?.heroMediaId ?? "",
    seoTitle: draft?.seoTitle ?? "",
    seoDescription: draft?.seoDescription ?? "",
    canonicalUrl: draft?.canonicalUrl ?? "",
    noIndex: draft?.noIndex ?? false,
    openGraphTitle: draft?.openGraphTitle ?? "",
    openGraphDescription: draft?.openGraphDescription ?? "",
    openGraphImageId: draft?.openGraphImageId ?? "",
    relatedSolutionIds: draft?.solutions.map((item) => item.solutionId) ?? [],
    relatedMaterialIds: draft?.materials.map((item) => item.materialId) ?? [],
    relatedProjectIds: draft?.projects.map((item) => item.projectId) ?? [],
    relatedArticleIds: draft?.articles.map((item) => item.articleId) ?? [],
    relatedFaqIds: draft?.faqs.map((item) => item.faqId) ?? [],
  };
}
