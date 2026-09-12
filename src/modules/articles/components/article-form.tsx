"use client";

import type { ArticleType, Prisma } from "@prisma/client";
import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CmsFieldShell, CmsInput, CmsTextarea } from "@/modules/cms/components/form";
import type { CmsRelationOption } from "@/modules/cms/types";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";
import { ServiceEditorSubmit } from "@/modules/services/components/service-editor-submit";
import { ServiceMediaField } from "@/modules/services/components/service-media-field";
import { ServiceRelationSelector } from "@/modules/services/components/service-relation-selector";

import { submitArticleAction, type ArticleFormState, type ArticleFormValues } from "../actions";
import { isTipTapDocument } from "../content";
import { RichTextEditor } from "./rich-text-editor";

type ArticleFormVersion = {
  title: string | null; slug: string | null; excerpt: string | null; content: Prisma.JsonValue; heroMediaId: string | null; articleType: ArticleType | null; seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImageId: string | null; updatedAt: Date;
  services: { serviceId: string }[]; solutions: { solutionId: string }[]; materials: { materialId: string }[]; projects: { projectId: string }[]; faqs: { faqId: string }[];
};

type RelationOptions = { services: CmsRelationOption[]; solutions: CmsRelationOption[]; materials: CmsRelationOption[]; projects: CmsRelationOption[]; faqs: CmsRelationOption[] };

const articleTypes = [
  ["NONE", "بدون تصنيف"], ["GUIDE", "دليل"], ["PRICING", "دليل أسعار"], ["COMPARISON", "مقارنة"], ["MAINTENANCE", "صيانة"], ["GENERAL", "عام"],
] as const;

export function ArticleForm({ article, media, relationOptions }: { article?: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; publishedAt: Date | null; updatedAt: Date; draftVersion: ArticleFormVersion | null }; media: MediaPickerItem[]; relationOptions: RelationOptions }) {
  const draft = article?.draftVersion;
  const initialValues = getInitialValues(article?.id, draft);
  const [state, formAction] = useActionState(submitArticleAction, { status: "idle", revision: 0 } satisfies ArticleFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const values = state.values ?? initialValues;
  const title = article ? values.title || draft?.title || "دليل بدون عنوان" : "دليل جديد";
  const editorDocument = parseEditorDocument(values.content);

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.message) toast.error(state.message, { toastId: `article-form-${state.revision}` });
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }, [state.message, state.revision, state.status]);

  return (
    <form action={formAction} noValidate ref={formRef}>
      {article ? <input name="articleId" type="hidden" value={article.id} /> : null}
      <header className="mb-5 border-b border-border pb-4">
        <Link className="inline-flex min-h-8 items-center text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" href="/dashboard/articles">الأدلة <span aria-hidden="true" className="mx-1.5">/</span> <span className="text-foreground">{title}</span></Link>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3"><h1 className="truncate text-2xl font-bold leading-10 sm:text-[1.75rem]">{title}</h1>{article ? <ArticleStatus status={article.status} /> : null}</div>
          <div className="flex flex-wrap items-center gap-2">{article ? <Link className={cn(buttonVariants({ variant: "outline" }), "min-h-10")} href={`/preview/articles/${article.id}`} target="_blank">معاينة<ExternalLink /></Link> : null}<ServiceEditorSubmit kind="save" /><ServiceEditorSubmit kind="publish" /></div>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,820px)_300px]" key={state.revision}>
        <div className="rounded-xl border border-border bg-card px-5 sm:px-7">
          <EditorSection title="المعلومات الأساسية">
            <CmsFieldShell error={fieldError(state, "title")} id="title" label="عنوان الدليل"><CmsInput aria-describedby={fieldError(state, "title") ? "title-error" : undefined} aria-invalid={Boolean(fieldError(state, "title"))} autoFocus className="min-h-12 text-lg font-semibold" id="title" name="title" defaultValue={values.title} placeholder="مثال: دليل اختيار مظلة السيارة المناسبة" /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "excerpt")} id="excerpt" label="المقتطف"><CmsTextarea aria-describedby={fieldError(state, "excerpt") ? "excerpt-error" : undefined} aria-invalid={Boolean(fieldError(state, "excerpt"))} className="min-h-24" id="excerpt" name="excerpt" defaultValue={values.excerpt} /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "articleType")} id="articleType" label="نوع الدليل"><Select defaultValue={values.articleType || "NONE"} name="articleType"><SelectTrigger aria-invalid={Boolean(fieldError(state, "articleType"))} className="min-h-11 max-w-[760px] border-border-strong bg-card text-base focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-2" id="articleType"><SelectValue /></SelectTrigger><SelectContent align="end">{articleTypes.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى">
            <CmsFieldShell error={fieldError(state, "content")} hint="التنسيقات المتاحة محصورة في العناوين والقوائم والاقتباس والروابط الآمنة." id="article-content" label="محتوى الدليل"><RichTextEditor defaultValue={editorDocument} error={fieldError(state, "content")} /></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى المرتبط">
            <div className="border-y border-border">
              <ServiceRelationSelector label="الخدمات المرتبطة" name="relatedServiceIds" options={relationOptions.services} selectedIds={values.relatedServiceIds} />
              <ServiceRelationSelector label="الحلول المرتبطة" name="relatedSolutionIds" options={relationOptions.solutions} selectedIds={values.relatedSolutionIds} />
              <ServiceRelationSelector label="المواد المرتبطة" name="relatedMaterialIds" options={relationOptions.materials} selectedIds={values.relatedMaterialIds} />
              <ServiceRelationSelector label="المشاريع المرتبطة" name="relatedProjectIds" options={relationOptions.projects} selectedIds={values.relatedProjectIds} />
              <ServiceRelationSelector label="الأسئلة المرتبطة" name="relatedFaqIds" options={relationOptions.faqs} selectedIds={values.relatedFaqIds} />
            </div>
          </EditorSection>
        </div>

        <aside className="grid min-w-0 gap-3 xl:sticky xl:top-20">
          <section className="min-w-0 rounded-xl border border-border bg-card p-4"><h2 className="mb-4 text-sm font-semibold">الصور</h2><div className="grid min-w-0 gap-5"><ServiceMediaField defaultValue={values.heroMediaId} error={fieldError(state, "heroMediaId")} items={media} label="الصورة الرئيسية" name="heroMediaId" /><ServiceMediaField defaultValue={values.openGraphImageId} error={fieldError(state, "openGraphImageId")} items={media} label="صورة المشاركة" name="openGraphImageId" /></div></section>

          <details className="group rounded-xl border border-border bg-card" open={hasSeoError(state) || undefined}><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-sm font-semibold outline-none transition-colors hover:bg-dashboard-hover focus-visible:ring-2 focus-visible:ring-ring marker:content-none">تهيئة محركات البحث<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary><div className="grid gap-4 border-t border-border p-4"><CmsFieldShell error={fieldError(state, "seoTitle")} id="seoTitle" label="عنوان SEO"><CmsInput aria-invalid={Boolean(fieldError(state, "seoTitle"))} id="seoTitle" name="seoTitle" defaultValue={values.seoTitle} /></CmsFieldShell><CmsFieldShell error={fieldError(state, "seoDescription")} id="seoDescription" label="وصف SEO"><CmsTextarea aria-invalid={Boolean(fieldError(state, "seoDescription"))} id="seoDescription" name="seoDescription" defaultValue={values.seoDescription} /></CmsFieldShell><CmsFieldShell error={fieldError(state, "canonicalUrl")} id="canonicalUrl" label="الرابط القانوني"><CmsInput aria-invalid={Boolean(fieldError(state, "canonicalUrl"))} dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={values.canonicalUrl} /></CmsFieldShell><label className="flex min-h-10 items-center gap-2 text-xs font-medium"><input className="size-4 accent-primary" name="noIndex" type="checkbox" defaultChecked={values.noIndex} />منع الفهرسة</label><CmsFieldShell error={fieldError(state, "openGraphTitle")} id="openGraphTitle" label="عنوان المشاركة"><CmsInput aria-invalid={Boolean(fieldError(state, "openGraphTitle"))} id="openGraphTitle" name="openGraphTitle" defaultValue={values.openGraphTitle} /></CmsFieldShell><CmsFieldShell error={fieldError(state, "openGraphDescription")} id="openGraphDescription" label="وصف المشاركة"><CmsTextarea aria-invalid={Boolean(fieldError(state, "openGraphDescription"))} className="min-h-20" id="openGraphDescription" name="openGraphDescription" defaultValue={values.openGraphDescription} /></CmsFieldShell></div></details>

          <section className="min-w-0 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">النشر</h2>{article ? <ArticleStatus status={article.status} /> : <span className="text-xs font-medium text-muted-foreground">غير محفوظ</span>}</div>
            {article ? <dl className="mt-4 divide-y divide-border text-xs"><MetaRow label="آخر حفظ" value={(draft?.updatedAt ?? article.updatedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })} /><MetaRow label="الظهور" value={article.publishedVersionId && article.status === "PUBLISHED" ? "ظاهر للعامة" : "غير ظاهر للعامة"} />{article.publishedAt ? <MetaRow label="آخر نشر" value={article.publishedAt.toLocaleDateString("ar-SA", { dateStyle: "medium" })} /> : null}</dl> : <p className="mt-3 text-xs leading-5 text-text-secondary">سيُنشأ السجل فقط عند الحفظ أو النشر.</p>}
          </section>
        </aside>
      </div>
    </form>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-4 border-b border-border py-6 last:border-b-0 sm:py-7"><h2 className="text-lg font-semibold">{title}</h2><div className="grid gap-4">{children}</div></section>; }
function MetaRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="text-end font-medium">{value}</dd></div>; }
function ArticleStatus({ status }: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) { const label = status === "PUBLISHED" ? "منشور" : status === "ARCHIVED" ? "مؤرشف" : "مسودة"; const tone = status === "PUBLISHED" ? "bg-success-soft text-success" : status === "ARCHIVED" ? "bg-muted text-muted-foreground" : "bg-secondary text-text-secondary"; return <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${tone}`}><span className="size-1.5 rounded-full bg-current" />{label}</span>; }
function fieldError(state: ArticleFormState, name: string) { return state.fieldErrors?.[name]?.[0]; }
function hasSeoError(state: ArticleFormState) { return ["seoTitle", "seoDescription", "canonicalUrl", "openGraphTitle", "openGraphDescription", "openGraphImageId"].some((name) => fieldError(state, name)); }
function parseEditorDocument(content: string) { try { const value: unknown = content ? JSON.parse(content) : null; return isTipTapDocument(value) ? value : null; } catch { return null; } }
function getInitialValues(articleId: string | undefined, draft: ArticleFormVersion | null | undefined): ArticleFormValues {
  return {
    articleId,
    title: draft?.title ?? "",
    excerpt: draft?.excerpt ?? "",
    content: isTipTapDocument(draft?.content) ? JSON.stringify(draft.content) : "",
    heroMediaId: draft?.heroMediaId ?? "",
    articleType: draft?.articleType ?? "",
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
    relatedProjectIds: draft?.projects.map((item) => item.projectId) ?? [],
    relatedFaqIds: draft?.faqs.map((item) => item.faqId) ?? [],
  };
}
