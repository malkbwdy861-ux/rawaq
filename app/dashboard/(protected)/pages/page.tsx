import Link from "next/link";
import { FilePlus2, FileText, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import { createPageDraftAction } from "@/modules/pages/actions";
import { getPageList, pageDefinitions } from "@/modules/pages/queries";

type PagesPageProps = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function PagesPage({ searchParams }: PagesPageProps) {
  const [pages, messages] = await Promise.all([getPageList(), searchParams]);
  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <CmsPageHeader title="الصفحات الثابتة" description="أربع وجهات ثابتة بمخططات معتمدة. أنشئ المسودة أو انتقل مباشرة إلى تحرير الصفحة وحالة نشرها." />
      {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
      {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}

      <section aria-label="الوجهات الثابتة" className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(180px,240px)_auto] items-center gap-4 border-b border-border bg-secondary/70 px-5 py-3 text-xs font-semibold text-text-secondary md:grid">
          <span>الوجهة</span>
          <span>دورة النشر</span>
          <span>الإجراء</span>
        </div>
        <div className="divide-y divide-border">
          {pageDefinitions.map((definition) => {
            const page = pages.find((item) => item.key === definition.key);
            return (
              <article className="grid min-h-[72px] gap-4 px-4 py-4 transition-colors hover:bg-dashboard-hover/50 md:grid-cols-[minmax(0,1fr)_minmax(180px,240px)_auto] md:items-center md:px-5" key={definition.key}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground" aria-hidden="true">
                    <FileText className="size-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-foreground">{definition.label}</h2>
                    <bdi className="mt-0.5 block truncate text-sm text-muted-foreground" dir="ltr">{definition.path}</bdi>
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium text-muted-foreground md:hidden">دورة النشر</span>
                  {page ? <CmsStatusBadge status={{ status: page.status, hasDraftVersion: Boolean(page.draftVersionId), hasPublishedVersion: Boolean(page.publishedVersionId) }} /> : <span className="text-sm font-medium text-muted-foreground">لم تنشأ بعد</span>}
                </div>
                <div className="md:justify-self-start">
                  {page ? (
                    <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border-strong bg-card px-4 text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={`/dashboard/pages/${definition.key}`}>
                      <Pencil className="size-4" aria-hidden="true" />
                      تحرير الصفحة
                    </Link>
                  ) : (
                    <form action={createPageDraftAction}>
                      <input name="key" type="hidden" value={definition.key} />
                      <Button className="min-h-11" type="submit" variant="outline"><FilePlus2 aria-hidden="true" />إنشاء المسودة</Button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
