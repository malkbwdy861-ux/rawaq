import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createFaqAction } from "@/modules/faqs/actions";
import { getFaqList } from "@/modules/faqs/queries";
import { CmsListToolbar } from "@/modules/cms/components/list-toolbar";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { CmsEmptyState, CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";

type FaqsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function FaqsPage({ searchParams }: FaqsPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, faqs } = await getFaqList(rawParams);
  return <div className="space-y-8">
    <CmsPageHeader title="الأسئلة الشائعة" description="أدر أسئلة قابلة لإعادة الاستخدام، ثم اربط النسخ المنشورة بالمحتوى والصفحات." action={<form action={createFaqAction}><Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" type="submit">سؤال جديد</Button></form>} />
    {typeof rawParams.success === "string" ? <CmsStateBlock tone="success" title="اكتملت العملية" description={rawParams.success} /> : null}
    {typeof rawParams.error === "string" ? <CmsStateBlock tone="error" title="تعذرت العملية" description={rawParams.error} /> : null}
    <CmsListToolbar query={params.q} status={params.status} searchPlaceholder="ابحث بنص السؤال" />
    {faqs.length === 0 ? <CmsEmptyState title="لا توجد أسئلة" description="أنشئ مسودة سؤال، أضف إجابته، ثم عاينه وانشره قبل ربطه بالصفحات." /> : <div className="overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)]">
      {faqs.map((faq) => { const version = faq.draftVersion ?? faq.publishedVersion; return <article className="grid gap-3 border-b border-[oklch(82%_0.012_145)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center" key={faq.id}>
        <div className="grid gap-1"><h2 className="text-lg font-semibold leading-[1.55]">{version?.question ?? "سؤال بدون عنوان"}</h2>{version?.sortOrder !== null && version?.sortOrder !== undefined ? <p className="text-sm text-[oklch(50%_0.014_150)]">الترتيب: <span className="tabular-nums">{version.sortOrder}</span></p> : null}</div>
        <CmsStatusBadge status={{ status: faq.status, hasDraftVersion: Boolean(faq.draftVersionId), hasPublishedVersion: Boolean(faq.publishedVersionId) }} />
        <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/dashboard/faqs/${faq.id}`}>تحرير</Link>
      </article>; })}
    </div>}
    <CmsPaginationControls pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} basePath="/dashboard/faqs" query={{ q: params.q, status: params.status, pageSize: params.pageSize }} />
  </div>;
}
