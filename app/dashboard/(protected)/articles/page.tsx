import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createArticleAction } from "@/modules/articles/actions";
import { getArticleList } from "@/modules/articles/queries";
import { CmsListToolbar } from "@/modules/cms/components/list-toolbar";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { CmsEmptyState, CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";

type ArticlesPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const typeLabels = { GUIDE: "دليل", PRICING: "أسعار", COMPARISON: "مقارنة", MAINTENANCE: "صيانة", GENERAL: "عام" } as const;

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, articles } = await getArticleList(rawParams);
  return <div className="space-y-8">
    <CmsPageHeader title="المقالات" description="أنشئ أدلة عربية منظمة وانشرها حصريًا تحت /guides." action={<form action={createArticleAction}><Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" type="submit">مقال جديد</Button></form>} />
    {typeof rawParams.success === "string" ? <CmsStateBlock tone="success" title="اكتملت العملية" description={rawParams.success} /> : null}
    {typeof rawParams.error === "string" ? <CmsStateBlock tone="error" title="تعذرت العملية" description={rawParams.error} /> : null}
    <CmsListToolbar query={params.q} status={params.status} searchPlaceholder="ابحث بالعنوان أو الرابط" />
    {articles.length === 0 ? <CmsEmptyState title="لا توجد مقالات" description="أنشئ مسودة دليل، أضف محتواها المنظم وعلاقاتها، ثم عاينها وانشرها." /> : <div className="overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)]">
      {articles.map((article) => { const version = article.draftVersion ?? article.publishedVersion; return <article className="grid gap-3 border-b border-[oklch(82%_0.012_145)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center" key={article.id}>
        <div className="grid gap-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold leading-[1.55]">{version?.title ?? "مقال بدون عنوان"}</h2>{version?.articleType ? <span className="rounded-[4px] bg-[oklch(95%_0.012_110)] px-2 py-1 text-xs font-semibold text-[oklch(42%_0.018_150)]">{typeLabels[version.articleType]}</span> : null}</div>{version?.slug ? <p className="text-xs font-medium text-[oklch(50%_0.014_150)]" dir="ltr">/guides/{version.slug}</p> : <p className="text-sm text-[oklch(50%_0.014_150)]">لم يحدد الرابط بعد.</p>}</div>
        <CmsStatusBadge status={{ status: article.status, hasDraftVersion: Boolean(article.draftVersionId), hasPublishedVersion: Boolean(article.publishedVersionId) }} />
        <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/dashboard/articles/${article.id}`}>تحرير</Link>
      </article>; })}
    </div>}
    <CmsPaginationControls pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} basePath="/dashboard/articles" query={{ q: params.q, status: params.status, pageSize: params.pageSize }} />
  </div>;
}
