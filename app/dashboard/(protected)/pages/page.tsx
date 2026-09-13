import Link from "next/link";
import { ArrowUpLeft, FilePlus2, FileText, Pencil, Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CmsRouteToast } from "@/modules/cms/components/route-toast";
import { createPageDraftAction } from "@/modules/pages/actions";
import { getPageList, pageDefinitions } from "@/modules/pages/queries";

type PagesPageProps = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function PagesPage({ searchParams }: PagesPageProps) {
  const [pages, messages] = await Promise.all([getPageList(), searchParams]);
  const missingCount = pageDefinitions.length - pages.length;

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold leading-10">الصفحات الثابتة</h1>
          <p className="mt-1 max-w-[62ch] text-sm leading-6 text-text-secondary">
            إدارة صفحات الموقع الأساسية ومحتواها المعتمد، بما فيها صفحات الخدمات والحلول والمشاريع.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-border bg-card px-3">
            <Route className="size-4 text-primary" aria-hidden="true" />
            {pageDefinitions.length} صفحات ثابتة
          </span>
          {missingCount > 0 ? (
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-warning/40 bg-warning-soft px-3 text-warning">
              {missingCount} تحتاج إنشاء
            </span>
          ) : null}
        </div>
      </header>

      <CmsRouteToast cleanHref="/dashboard/pages" error={messages.error} success={messages.success} />

      <section aria-label="الصفحات الثابتة" className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
        <div className="flex flex-col gap-3 border-b border-border bg-dashboard-canvas/65 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">صفحات الموقع العامة</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">اختيار سريع للصفحات الثابتة التي تظهر في الموقع العام.</p>
          </div>
          <Link className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-border-strong bg-card px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href="/" target="_blank">
            فتح الموقع
            <ArrowUpLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="hidden md:block">
          <table className="w-full table-fixed text-start text-sm">
            <thead className="bg-secondary/45 text-xs font-medium text-muted-foreground">
              <tr className="h-11">
                <th className="w-auto px-4 text-start font-medium">الصفحة</th>
                <th className="w-44 px-4 text-start font-medium">المسار العام</th>
                <th className="w-44 px-4 text-start font-medium">إدارة</th>
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
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">صفحة ثابتة في الموقع العام</span>
                        </span>
                      </div>
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
        <div className="grid gap-3 bg-dashboard-canvas/40 p-3 md:hidden">
          {pageDefinitions.map((definition) => {
            const page = pages.find((item) => item.key === definition.key);
            return (
              <article className="rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-rest)]" key={definition.key}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-secondary/70 text-primary" aria-hidden="true">
                      <FileText className="size-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-foreground">{definition.label}</h2>
                      <p className="mt-1 text-xs leading-5 text-text-secondary">صفحة عامة ثابتة</p>
                    </div>
                  </div>
                  <bdi className="shrink-0 rounded-md bg-secondary/65 px-2 py-1 text-xs font-semibold text-muted-foreground" dir="ltr">{definition.path}</bdi>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <PageAction pageKey={definition.key} exists={Boolean(page)} />
                </div>
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
        إنشاء الصفحة
      </Button>
    </form>
  );
}
