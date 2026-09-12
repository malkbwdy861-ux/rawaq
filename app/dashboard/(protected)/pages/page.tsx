import Link from "next/link";
import { FileCheck2, FilePlus2, FileText, Pencil, Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import { createPageDraftAction } from "@/modules/pages/actions";
import { getPageList, pageDefinitions } from "@/modules/pages/queries";

type PagesPageProps = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function PagesPage({ searchParams }: PagesPageProps) {
  const [pages, messages] = await Promise.all([getPageList(), searchParams]);
  const publishedCount = pages.filter((page) => page.status === "PUBLISHED").length;
  const draftCount = pages.filter((page) => page.draftVersionId).length;
  const missingCount = pageDefinitions.length - pages.length;

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold leading-10">الصفحات الثابتة</h1>
          <p className="mt-1 max-w-[62ch] text-sm leading-6 text-text-secondary">
            إدارة وجهات الموقع الأساسية ذات المخططات المعتمدة: الصفحة الرئيسية، من نحن، التواصل، والأسعار.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-border bg-card px-3">
            <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
            {publishedCount} منشورة
          </span>
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-border bg-secondary/70 px-3">
            {draftCount} بها مسودة
          </span>
          {missingCount > 0 ? (
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-warning/40 bg-warning-soft px-3 text-warning">
              {missingCount} تنتظر الإنشاء
            </span>
          ) : null}
        </div>
      </header>

      {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
      {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}

      <section aria-label="الوجهات الثابتة" className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
        <div className="flex flex-col gap-3 border-b border-border bg-dashboard-canvas/65 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">خريطة الصفحات العامة</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">كل وجهة هنا لها نموذج تحرير ثابت، ولا تنشر إلا بعد اكتمال المسودة.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
            <Route className="size-4" aria-hidden="true" />
            {pageDefinitions.length} وجهات ثابتة
          </span>
        </div>
        <div className="hidden md:block">
          <table className="w-full table-fixed text-start text-sm">
            <thead className="bg-secondary/45 text-xs font-medium text-muted-foreground">
              <tr className="h-11">
                <th className="w-auto px-4 text-start font-medium">الوجهة</th>
                <th className="w-56 px-4 text-start font-medium">دورة النشر</th>
                <th className="w-44 px-4 text-start font-medium">المسار العام</th>
                <th className="w-44 px-4 text-start font-medium">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {pageDefinitions.map((definition) => {
                const page = pages.find((item) => item.key === definition.key);
                return (
                  <tr className="h-16 border-t border-border/80 transition-colors hover:bg-dashboard-hover/55" key={definition.key}>
                    <td className="px-4">
                      <div className="flex min-w-0 items-center gap-3 py-2">
                        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-secondary/70 text-muted-foreground" aria-hidden="true">
                          <FileText className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-foreground">{definition.label}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">صفحة ثابتة ضمن واجهة الموقع</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4">
                      {page ? <CmsStatusBadge status={{ status: page.status, hasDraftVersion: Boolean(page.draftVersionId), hasPublishedVersion: Boolean(page.publishedVersionId) }} /> : <span className="inline-flex min-h-7 items-center rounded-[4px] border border-border bg-secondary/60 px-2 text-xs font-semibold text-muted-foreground">لم تنشأ بعد</span>}
                    </td>
                    <td className="px-4">
                      <bdi className="block truncate rounded-md bg-secondary/55 px-2 py-1 text-xs font-medium text-muted-foreground" dir="ltr">{definition.path}</bdi>
                    </td>
                    <td className="px-4">
                      <PageAction pageKey={definition.key} exists={Boolean(page)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-border md:hidden">
          {pageDefinitions.map((definition) => {
            const page = pages.find((item) => item.key === definition.key);
            return (
              <article className="grid gap-4 px-4 py-4" key={definition.key}>
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-secondary/70 text-muted-foreground" aria-hidden="true">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-foreground">{definition.label}</h2>
                    <bdi className="mt-1 block truncate text-xs font-medium text-muted-foreground" dir="ltr">{definition.path}</bdi>
                    <div className="mt-3">
                      {page ? <CmsStatusBadge status={{ status: page.status, hasDraftVersion: Boolean(page.draftVersionId), hasPublishedVersion: Boolean(page.publishedVersionId) }} /> : <span className="inline-flex min-h-7 items-center rounded-[4px] border border-border bg-secondary/60 px-2 text-xs font-semibold text-muted-foreground">لم تنشأ بعد</span>}
                    </div>
                  </div>
                </div>
                <PageAction pageKey={definition.key} exists={Boolean(page)} />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PageAction({ exists, pageKey }: { exists: boolean; pageKey: string }) {
  if (exists) {
    return (
      <Link className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-border-strong bg-card px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto" href={`/dashboard/pages/${pageKey}`}>
        <Pencil className="size-4" aria-hidden="true" />
        تحرير الصفحة
      </Link>
    );
  }

  return (
    <form action={createPageDraftAction}>
      <input name="key" type="hidden" value={pageKey} />
      <Button className="w-full md:w-auto" type="submit" variant="outline">
        <FilePlus2 aria-hidden="true" />
        إنشاء المسودة
      </Button>
    </form>
  );
}
