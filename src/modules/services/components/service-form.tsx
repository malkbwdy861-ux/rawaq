import { Archive, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CmsFieldShell, CmsTextarea, cmsInputClassName } from "@/modules/cms/components/form";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import type { CmsRelationOption } from "@/modules/cms/types";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";

import { archiveServiceAction, publishServiceAction, saveServiceDraftAction } from "../actions";
import { ServiceEditorSubmit } from "./service-editor-submit";
import { ServiceMediaField } from "./service-media-field";
import { ServiceRelationSelector } from "./service-relation-selector";
import { ServiceTextEditor } from "./service-text-editor";

type ServiceFormVersion = {
  title: string | null; slug: string | null; shortDescription: string | null; content: string | null; heroMediaId: string | null; seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImageId: string | null; updatedAt: Date;
  solutions: { solutionId: string }[]; materials: { materialId: string }[]; projects: { projectId: string }[]; articles: { articleId: string }[]; faqs: { faqId: string }[];
};

export function ServiceForm({ service, media, relationOptions }: { service: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedVersionId: string | null; publishedAt: Date | null; updatedAt: Date; draftVersion: ServiceFormVersion | null }; media: MediaPickerItem[]; relationOptions: { solutions: CmsRelationOption[]; materials: CmsRelationOption[]; projects: CmsRelationOption[]; articles: CmsRelationOption[]; faqs: CmsRelationOption[] } }) {
  const draft = service.draftVersion;
  const title = draft?.title || "خدمة بدون عنوان";
  const savedAt = draft?.updatedAt ?? service.updatedAt;

  return (
    <form action={saveServiceDraftAction}>
      <input name="serviceId" type="hidden" value={service.id} />
      <header className="mb-6 border-b border-border pb-5">
        <Link className="inline-flex min-h-9 items-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary" href="/dashboard/services">الخدمات / <span className="ms-1 text-foreground">{title}</span></Link>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0"><h1 className="truncate text-[1.75rem] font-bold leading-10">{title}</h1><p className="mt-0.5 text-xs text-muted-foreground">حرر المسودة وعاينها قبل تحديث الموقع.</p></div>
          <div className="flex flex-wrap items-center gap-2"><Link className={cn(buttonVariants({ variant: "outline" }), "min-h-10")} href={`/preview/services/${service.id}`} target="_blank">معاينة<ExternalLink /></Link><ServiceEditorSubmit action={saveServiceDraftAction} kind="save" /><ServiceEditorSubmit action={publishServiceAction} kind="publish" /></div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,820px)_300px]">
        <div className="rounded-xl border border-border bg-card px-5 shadow-[var(--shadow-rest)] sm:px-7">
          <EditorSection title="المعلومات الأساسية" description="العنوان والملخص الظاهر في قوائم الموقع. يتم إنشاء الرابط المختصر تلقائيًا من العنوان.">
            <CmsFieldShell id="title" label="عنوان الخدمة"><input className={`${cmsInputClassName} min-h-13 text-lg font-semibold`} id="title" name="title" defaultValue={draft?.title ?? ""} /></CmsFieldShell>
            <CmsFieldShell id="shortDescription" label="الوصف المختصر" hint="جملة أو جملتان تساعدان الزائر على فهم الخدمة بسرعة."><CmsTextarea id="shortDescription" name="shortDescription" defaultValue={draft?.shortDescription ?? ""} /></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى" description="نص واضح يشرح الخدمة ونطاقها. يدعم هذا الحقل النص العادي حالياً.">
            <label className="text-[0.8125rem] font-semibold" htmlFor="content">تفاصيل الخدمة</label><ServiceTextEditor defaultValue={draft?.content} /><p className="text-xs leading-5 text-muted-foreground" id="content-hint">استخدم فقرات قصيرة وأسطر منفصلة لتحسين القراءة.</p>
          </EditorSection>

          <EditorSection title="العلاقات" description="اربط الخدمة بالمحتوى الذي يساعد الزائر على اتخاذ القرار.">
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
          <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-rest)]">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">النشر</h2><CmsStatusBadge status={{ status: service.status, hasDraftVersion: Boolean(draft), hasPublishedVersion: Boolean(service.publishedVersionId) }} /></div>
            <dl className="mt-4 divide-y divide-border text-xs"><MetaRow label="آخر حفظ" value={savedAt.toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })} /><MetaRow label="ظهور الموقع" value={service.publishedVersionId ? "نسخة منشورة متاحة" : "غير ظاهر للعامة"} />{service.publishedAt ? <MetaRow label="آخر نشر" value={service.publishedAt.toLocaleDateString("ar-SA", { dateStyle: "medium" })} /> : null}</dl>
            <p className="mt-4 rounded-lg bg-dashboard-canvas px-3 py-2.5 text-xs leading-5 text-text-secondary">الحفظ يحدّث المسودة فقط. النشر يستبدل النسخة العامة بالمسودة الحالية.</p>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-rest)]"><h2 className="mb-4 text-sm font-semibold">الصور</h2><div className="grid gap-5"><ServiceMediaField defaultValue={draft?.heroMediaId} items={media} label="الصورة الرئيسية" name="heroMediaId" /><ServiceMediaField defaultValue={draft?.openGraphImageId} items={media} label="صورة المشاركة" name="openGraphImageId" /></div></section>

          <details className="group rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-sm font-semibold transition-colors hover:bg-dashboard-hover marker:content-none">تهيئة محركات البحث<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary><div className="grid gap-4 border-t border-border p-4"><CmsFieldShell id="seoTitle" label="عنوان SEO"><input className={cmsInputClassName} id="seoTitle" name="seoTitle" defaultValue={draft?.seoTitle ?? ""} /></CmsFieldShell><CmsFieldShell id="seoDescription" label="وصف SEO"><CmsTextarea id="seoDescription" name="seoDescription" defaultValue={draft?.seoDescription ?? ""} /></CmsFieldShell><CmsFieldShell id="canonicalUrl" label="الرابط القانوني"><input className={cmsInputClassName} dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={draft?.canonicalUrl ?? ""} /></CmsFieldShell><label className="flex min-h-10 items-center gap-2 text-xs font-medium"><input className="size-4 accent-primary" name="noIndex" type="checkbox" defaultChecked={draft?.noIndex ?? false} />منع الفهرسة</label><CmsFieldShell id="openGraphTitle" label="عنوان المشاركة"><input className={cmsInputClassName} id="openGraphTitle" name="openGraphTitle" defaultValue={draft?.openGraphTitle ?? ""} /></CmsFieldShell><CmsFieldShell id="openGraphDescription" label="وصف المشاركة"><CmsTextarea className="min-h-20" id="openGraphDescription" name="openGraphDescription" defaultValue={draft?.openGraphDescription ?? ""} /></CmsFieldShell></div></details>

          <details className="group rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-dashboard-hover marker:content-none">إجراءات إضافية<ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary><div className="border-t border-border p-3"><p className="mb-3 text-xs leading-5 text-text-secondary">الأرشفة تزيل الخدمة من القوائم العامة مع الاحتفاظ بسجلها.</p><Button className="w-full" formAction={archiveServiceAction} type="submit" variant="destructive"><Archive />أرشفة الخدمة</Button></div></details>
        </aside>
      </div>
    </form>
  );
}

function EditorSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="grid gap-5 border-b border-border py-7 last:border-b-0 sm:py-8"><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 max-w-[58ch] text-sm leading-6 text-text-secondary">{description}</p></div><div className="grid gap-5">{children}</div></section>; }
function MetaRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="text-end font-medium">{value}</dd></div>; }
