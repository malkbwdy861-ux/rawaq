import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import { createPageDraftAction } from "@/modules/pages/actions";
import { getPageList, pageDefinitions } from "@/modules/pages/queries";

type PagesPageProps = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function PagesPage({ searchParams }: PagesPageProps) {
  const [pages, messages] = await Promise.all([getPageList(), searchParams]);
  return <div className="space-y-8"><CmsPageHeader title="الصفحات الثابتة" description="حرر الصفحات الأربع ضمن مخططاتها المعتمدة. لا توجد أقسام حرة أو أداة بناء صفحات." />{messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}{messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}<div className="overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)]">{pageDefinitions.map((definition) => { const page = pages.find((item) => item.key === definition.key); return <article className="grid gap-3 border-b border-[oklch(82%_0.012_145)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center" key={definition.key}><div><h2 className="text-lg font-semibold">{definition.label}</h2><p className="mt-1 text-sm text-[oklch(50%_0.014_150)]" dir="ltr">{definition.path}</p></div>{page ? <CmsStatusBadge status={{ status: page.status, hasDraftVersion: Boolean(page.draftVersionId), hasPublishedVersion: Boolean(page.publishedVersionId) }} /> : <span className="text-sm text-[oklch(50%_0.014_150)]">لم تنشأ بعد</span>}{page ? <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/dashboard/pages/${definition.key}`}>تحرير</Link> : <form action={createPageDraftAction}><input name="key" type="hidden" value={definition.key} /><Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">إنشاء المسودة</Button></form>}</article>; })}</div></div>;
}
