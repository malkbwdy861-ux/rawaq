import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CmsFieldShell, CmsInput, CmsTextarea } from "@/modules/cms/components/form";
import type { CmsRelationOption } from "@/modules/cms/types";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";

import { publishServiceAction, saveServiceDraftAction } from "../actions";
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
  const title = service ? draft?.title || "خدمة بدون عنوان" : "خدمة جديدة";
  const published = service?.status === "PUBLISHED";

  return (
    <form action={saveServiceDraftAction}>
      {service ? <input name="serviceId" type="hidden" value={service.id} /> : null}
      <header className="mb-6 border-b border-border pb-5">
        <Link className="inline-flex min-h-8 items-center text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" href="/dashboard/services">الخدمات <span aria-hidden="true" className="mx-1.5">/</span> <span className="text-foreground">{title}</span></Link>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3"><h1 className="truncate text-2xl font-bold leading-10 sm:text-[1.75rem]">{title}</h1>{service ? <ServiceStatus published={published} /> : null}</div>
          <div className="flex flex-wrap items-center gap-2">{service ? <Link className={cn(buttonVariants({ variant: "outline" }), "min-h-10")} href={`/preview/services/${service.id}`} target="_blank">معاينة<ExternalLink /></Link> : null}<ServiceEditorSubmit action={saveServiceDraftAction} kind="save" /><ServiceEditorSubmit action={publishServiceAction} kind="publish" /></div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,820px)_300px]">
        <div className="rounded-xl border border-border bg-card px-5 sm:px-7">
          <EditorSection title="المعلومات الأساسية">
            <CmsFieldShell id="title" label="عنوان الخدمة"><CmsInput autoFocus className="min-h-12 text-lg font-semibold" id="title" name="title" defaultValue={draft?.title ?? ""} placeholder="مثال: مظلات السيارات" /></CmsFieldShell>
            <CmsFieldShell id="shortDescription" label="الوصف المختصر"><CmsTextarea className="min-h-28" id="shortDescription" name="shortDescription" defaultValue={draft?.shortDescription ?? ""} /></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى">
            <label className="text-[0.8125rem] font-semibold" htmlFor="content">تفاصيل الخدمة</label><ServiceTextEditor defaultValue={draft?.content} />
          </EditorSection>

          <EditorSection title="المحتوى المرتبط">
            <div className="border-y border-border">
              <ServiceRelationSelector label="الحلول المرتبطة" name="relatedSolutionIds" options={relationOptions.solutions} selectedIds={draft?.solutions.map((item) => item.solutionId)} />
              <ServiceRelationSelector label="المواد المرتبطة" name="relatedMaterialIds" options={relationOptions.materials} selectedIds={draft?.materials.map((item) => item.materialId)} />
              <ServiceRelationSelector label="المشاريع المرتبطة" name="relatedProjectIds" options={relationOptions.projects} selectedIds={draft?.projects.map((item) => item.projectId)} />
              <ServiceRelationSelector label="الأدلة المرتبطة" name="relatedArticleIds" options={relationOptions.articles} selectedIds={draft?.articles.map((item) => item.articleId)} />
              <ServiceRelationSelector label="الأسئلة المرتبطة" name="relatedFaqIds" options={relationOptions.faqs} selectedIds={draft?.faqs.map((item) => item.faqId)} />
            </div>
          </EditorSection>
        </div>

        <aside className="space-y-3 xl:sticky xl:top-20">
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">النشر</h2>{service ? <ServiceStatus published={published} /> : <span className="text-xs font-medium text-muted-foreground">غير محفوظة</span>}</div>
            {service ? <dl className="mt-4 divide-y divide-border text-xs"><MetaRow label="آخر حفظ" value={(draft?.updatedAt ?? service.updatedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })} /><MetaRow label="الظهور" value={service.publishedVersionId ? "ظاهرة للعامة" : "غير ظاهرة للعامة"} />{service.publishedAt ? <MetaRow label="آخر نشر" value={service.publishedAt.toLocaleDateString("ar-SA", { dateStyle: "medium" })} /> : null}</dl> : <p className="mt-3 text-xs leading-5 text-text-secondary">سيُنشأ السجل عند الحفظ أو النشر.</p>}
          </section>

          <section className="rounded-xl border border-border bg-card p-4"><h2 className="mb-4 text-sm font-semibold">الصور</h2><div className="grid gap-5"><ServiceMediaField defaultValue={draft?.heroMediaId} items={media} label="الصورة الرئيسية" name="heroMediaId" /><ServiceMediaField defaultValue={draft?.openGraphImageId} items={media} label="صورة المشاركة" name="openGraphImageId" /></div></section>

          <details className="group rounded-xl border border-border bg-card"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-sm font-semibold outline-none transition-colors hover:bg-dashboard-hover focus-visible:ring-2 focus-visible:ring-ring marker:content-none">تهيئة محركات البحث<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary><div className="grid gap-4 border-t border-border p-4"><CmsFieldShell id="seoTitle" label="عنوان SEO"><CmsInput id="seoTitle" name="seoTitle" defaultValue={draft?.seoTitle ?? ""} /></CmsFieldShell><CmsFieldShell id="seoDescription" label="وصف SEO"><CmsTextarea id="seoDescription" name="seoDescription" defaultValue={draft?.seoDescription ?? ""} /></CmsFieldShell><CmsFieldShell id="canonicalUrl" label="الرابط القانوني"><CmsInput dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={draft?.canonicalUrl ?? ""} /></CmsFieldShell><label className="flex min-h-10 items-center gap-2 text-xs font-medium"><input className="size-4 accent-primary" name="noIndex" type="checkbox" defaultChecked={draft?.noIndex ?? false} />منع الفهرسة</label><CmsFieldShell id="openGraphTitle" label="عنوان المشاركة"><CmsInput id="openGraphTitle" name="openGraphTitle" defaultValue={draft?.openGraphTitle ?? ""} /></CmsFieldShell><CmsFieldShell id="openGraphDescription" label="وصف المشاركة"><CmsTextarea className="min-h-20" id="openGraphDescription" name="openGraphDescription" defaultValue={draft?.openGraphDescription ?? ""} /></CmsFieldShell></div></details>
        </aside>
      </div>
    </form>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-5 border-b border-border py-7 last:border-b-0 sm:py-8"><h2 className="text-lg font-semibold">{title}</h2><div className="grid gap-5">{children}</div></section>; }
function MetaRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="text-end font-medium">{value}</dd></div>; }
function ServiceStatus({ published }: { published: boolean }) { return <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${published ? "bg-success-soft text-success" : "bg-secondary text-text-secondary"}`}><span className="size-1.5 rounded-full bg-current" />{published ? "منشور" : "مسودة"}</span>; }
