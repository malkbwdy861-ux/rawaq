"use client";

import type { Prisma } from "@prisma/client";
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

import { submitMaterialAction, type MaterialFormState, type MaterialFormValues } from "../actions";
import { jsonStringArray } from "../queries";

type MaterialFormVersion = {
  name: string | null; slug: string | null; shortDescription: string | null; content: string | null; advantages: Prisma.JsonValue | null; limitations: Prisma.JsonValue | null; maintenanceNotes: string | null; recommendedUses: Prisma.JsonValue | null; heroMediaId: string | null; seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImageId: string | null; updatedAt: Date;
  services: { serviceId: string }[]; solutions: { solutionId: string }[]; projects: { projectId: string }[]; articles: { articleId: string }[]; faqs: { faqId: string }[];
};

type MaterialEditorRecord = {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedVersionId: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  draftVersion: MaterialFormVersion | null;
};

type RelationOptions = {
  services: CmsRelationOption[];
  solutions: CmsRelationOption[];
  projects: CmsRelationOption[];
  articles: CmsRelationOption[];
  faqs: CmsRelationOption[];
};

export function MaterialForm({ material, media, relationOptions }: { material?: MaterialEditorRecord; media: MediaPickerItem[]; relationOptions: RelationOptions }) {
  const draft = material?.draftVersion;
  const initialValues = getInitialValues(material?.id, draft);
  const [state, formAction] = useActionState(submitMaterialAction, { status: "idle", revision: 0 } satisfies MaterialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const values = state.values ?? initialValues;
  const title = material ? values.name || draft?.name || "مادة بدون عنوان" : "مادة جديدة";

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.message) toast.error(state.message, { toastId: `material-form-${state.revision}` });
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }, [state.message, state.revision, state.status]);

  return (
    <form action={formAction} noValidate ref={formRef}>
      {material ? <input name="materialId" type="hidden" value={material.id} /> : null}
      <header className="mb-6 border-b border-border pb-5">
        <Link className="inline-flex min-h-8 items-center text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" href="/dashboard/materials">المواد <span aria-hidden="true" className="mx-1.5">/</span> <span className="text-foreground">{title}</span></Link>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3"><h1 className="truncate text-2xl font-bold leading-10 sm:text-[1.75rem]">{title}</h1>{material ? <MaterialStatus status={material.status} /> : null}</div>
          <div className="flex flex-wrap items-center gap-2">{material ? <Link className={cn(buttonVariants({ variant: "outline" }), "min-h-10")} href={`/preview/materials/${material.id}`} target="_blank">معاينة<ExternalLink /></Link> : null}<ServiceEditorSubmit kind="save" /><ServiceEditorSubmit kind="publish" /></div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,820px)_300px]" key={state.revision}>
        <div className="rounded-xl border border-border bg-card px-5 sm:px-7">
          <EditorSection title="المعلومات الأساسية">
            <CmsFieldShell error={fieldError(state, "name")} id="name" label="اسم المادة"><CmsInput aria-describedby={fieldError(state, "name") ? "name-error" : undefined} aria-invalid={Boolean(fieldError(state, "name"))} autoFocus className="min-h-12 text-lg font-semibold" id="name" name="name" defaultValue={values.name} placeholder="مثال: قماش PVC" /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "shortDescription")} id="shortDescription" label="الوصف المختصر"><CmsTextarea aria-describedby={fieldError(state, "shortDescription") ? "shortDescription-error" : undefined} aria-invalid={Boolean(fieldError(state, "shortDescription"))} className="min-h-28" id="shortDescription" name="shortDescription" defaultValue={values.shortDescription} /></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى">
            <label className="text-[0.8125rem] font-semibold" htmlFor="content">تفاصيل المادة</label><ServiceTextEditor defaultValue={values.content} error={fieldError(state, "content")} />
          </EditorSection>

          <EditorSection title="حقائق المادة">
            <p className="text-sm leading-6 text-text-secondary">اكتب كل بند في سطر مستقل، واترك المعلومات غير المؤكدة فارغة.</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <CmsFieldShell error={fieldError(state, "advantages")} id="advantages" label="المزايا"><CmsTextarea aria-invalid={Boolean(fieldError(state, "advantages"))} className="min-h-36" id="advantages" name="advantages" defaultValue={values.advantages.join("\n")} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "limitations")} id="limitations" label="القيود"><CmsTextarea aria-invalid={Boolean(fieldError(state, "limitations"))} className="min-h-36" id="limitations" name="limitations" defaultValue={values.limitations.join("\n")} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "recommendedUses")} id="recommendedUses" label="الاستخدامات الموصى بها"><CmsTextarea aria-invalid={Boolean(fieldError(state, "recommendedUses"))} className="min-h-36" id="recommendedUses" name="recommendedUses" defaultValue={values.recommendedUses.join("\n")} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "maintenanceNotes")} id="maintenanceNotes" label="ملاحظات الصيانة"><CmsTextarea aria-invalid={Boolean(fieldError(state, "maintenanceNotes"))} className="min-h-36" id="maintenanceNotes" name="maintenanceNotes" defaultValue={values.maintenanceNotes} /></CmsFieldShell>
            </div>
          </EditorSection>

          <EditorSection title="المحتوى المرتبط">
            <div className="border-y border-border">
              <ServiceRelationSelector label="الخدمات المرتبطة" name="relatedServiceIds" options={relationOptions.services} selectedIds={values.relatedServiceIds} />
              <ServiceRelationSelector label="الحلول المرتبطة" name="relatedSolutionIds" options={relationOptions.solutions} selectedIds={values.relatedSolutionIds} />
              <ServiceRelationSelector label="المشاريع المرتبطة" name="relatedProjectIds" options={relationOptions.projects} selectedIds={values.relatedProjectIds} />
              <ServiceRelationSelector label="المقالات المرتبطة" name="relatedArticleIds" options={relationOptions.articles} selectedIds={values.relatedArticleIds} />
              <ServiceRelationSelector label="الأسئلة المرتبطة" name="relatedFaqIds" options={relationOptions.faqs} selectedIds={values.relatedFaqIds} />
            </div>
          </EditorSection>
        </div>

        <aside className="grid min-w-0 gap-3 [&>details]:order-2 xl:sticky xl:top-20 xl:[&>details]:order-3">
          <section className="order-3 min-w-0 rounded-xl border border-border bg-card p-4 xl:order-1">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">النشر</h2>{material ? <MaterialStatus status={material.status} /> : <span className="text-xs font-medium text-muted-foreground">غير محفوظة</span>}</div>
            {material ? <dl className="mt-4 divide-y divide-border text-xs"><MetaRow label="آخر حفظ" value={(draft?.updatedAt ?? material.updatedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })} /><MetaRow label="الظهور" value={material.publishedVersionId ? "ظاهرة للعامة" : "غير ظاهرة للعامة"} />{material.publishedAt ? <MetaRow label="آخر نشر" value={material.publishedAt.toLocaleDateString("ar-SA", { dateStyle: "medium" })} /> : null}</dl> : <p className="mt-3 text-xs leading-5 text-text-secondary">سيُنشأ السجل عند الحفظ أو النشر.</p>}
          </section>

          <section className="order-1 min-w-0 rounded-xl border border-border bg-card p-4 xl:order-2"><h2 className="mb-4 text-sm font-semibold">الصور</h2><div className="grid min-w-0 gap-5"><ServiceMediaField defaultValue={values.heroMediaId} error={fieldError(state, "heroMediaId")} items={media} label="الصورة الرئيسية" name="heroMediaId" /><ServiceMediaField defaultValue={values.openGraphImageId} error={fieldError(state, "openGraphImageId")} items={media} label="صورة المشاركة" name="openGraphImageId" /></div></section>

          <details className="group rounded-xl border border-border bg-card" open={hasSeoError(state) || undefined}>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-sm font-semibold outline-none transition-colors hover:bg-dashboard-hover focus-visible:ring-2 focus-visible:ring-ring marker:content-none">محركات البحث<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
            <div className="grid gap-4 border-t border-border p-4">
              <CmsFieldShell error={fieldError(state, "seoTitle")} id="seoTitle" label="عنوان محركات البحث"><CmsInput aria-invalid={Boolean(fieldError(state, "seoTitle"))} id="seoTitle" name="seoTitle" defaultValue={values.seoTitle} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "seoDescription")} id="seoDescription" label="وصف محركات البحث"><CmsTextarea aria-invalid={Boolean(fieldError(state, "seoDescription"))} id="seoDescription" name="seoDescription" defaultValue={values.seoDescription} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "canonicalUrl")} id="canonicalUrl" label="الرابط الأساسي"><CmsInput aria-invalid={Boolean(fieldError(state, "canonicalUrl"))} dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={values.canonicalUrl} /></CmsFieldShell>
              <label className="flex min-h-10 items-center gap-2 text-xs font-medium"><input className="size-4 accent-primary" name="noIndex" type="checkbox" defaultChecked={values.noIndex} />منع الفهرسة</label>
              <CmsFieldShell error={fieldError(state, "openGraphTitle")} id="openGraphTitle" label="عنوان المشاركة"><CmsInput aria-invalid={Boolean(fieldError(state, "openGraphTitle"))} id="openGraphTitle" name="openGraphTitle" defaultValue={values.openGraphTitle} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "openGraphDescription")} id="openGraphDescription" label="وصف المشاركة"><CmsTextarea aria-invalid={Boolean(fieldError(state, "openGraphDescription"))} className="min-h-20" id="openGraphDescription" name="openGraphDescription" defaultValue={values.openGraphDescription} /></CmsFieldShell>
            </div>
          </details>
        </aside>
      </div>
    </form>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-5 border-b border-border py-7 last:border-b-0 sm:py-8"><h2 className="text-lg font-semibold">{title}</h2><div className="grid gap-5">{children}</div></section>; }
function MetaRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="text-end font-medium">{value}</dd></div>; }
function MaterialStatus({ status }: { status: MaterialEditorRecord["status"] }) { const label = status === "PUBLISHED" ? "منشور" : status === "ARCHIVED" ? "مؤرشف" : "مسودة"; const tone = status === "PUBLISHED" ? "bg-success-soft text-success" : status === "ARCHIVED" ? "bg-muted text-muted-foreground" : "bg-secondary text-text-secondary"; return <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${tone}`}><span className="size-1.5 rounded-full bg-current" />{label}</span>; }
function fieldError(state: MaterialFormState, name: string) { return state.fieldErrors?.[name]?.[0]; }
function hasSeoError(state: MaterialFormState) { return ["seoTitle", "seoDescription", "canonicalUrl", "openGraphTitle", "openGraphDescription", "openGraphImageId"].some((name) => fieldError(state, name)); }

function getInitialValues(materialId: string | undefined, draft: MaterialFormVersion | null | undefined): MaterialFormValues {
  return {
    materialId,
    name: draft?.name ?? "",
    shortDescription: draft?.shortDescription ?? "",
    content: draft?.content ?? "",
    advantages: jsonStringArray(draft?.advantages),
    limitations: jsonStringArray(draft?.limitations),
    maintenanceNotes: draft?.maintenanceNotes ?? "",
    recommendedUses: jsonStringArray(draft?.recommendedUses),
    heroMediaId: draft?.heroMediaId ?? "",
    seoTitle: draft?.seoTitle ?? "",
    seoDescription: draft?.seoDescription ?? "",
    canonicalUrl: draft?.canonicalUrl ?? "",
    noIndex: draft?.noIndex ?? false,
    openGraphTitle: draft?.openGraphTitle ?? "",
    openGraphDescription: draft?.openGraphDescription ?? "",
    openGraphImageId: draft?.openGraphImageId ?? "",
    relatedServiceIds: draft?.services.map((item) => item.serviceId) ?? [],
    relatedSolutionIds: draft?.solutions.map((item) => item.solutionId) ?? [],
    relatedProjectIds: draft?.projects.map((item) => item.projectId) ?? [],
    relatedArticleIds: draft?.articles.map((item) => item.articleId) ?? [],
    relatedFaqIds: draft?.faqs.map((item) => item.faqId) ?? [],
  };
}
