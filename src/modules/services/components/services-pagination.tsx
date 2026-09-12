import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { CmsPagination } from "@/modules/cms/types";
import { getCmsPagination } from "@/modules/cms/validation";

export function ServicesPagination({ pagination, query, basePath = "/dashboard/services", ariaLabel = "صفحات الخدمات" }: { pagination: CmsPagination; query: Record<string, string | number | undefined>; basePath?: string; ariaLabel?: string }) {
  const page = getCmsPagination(pagination);
  if (!page.totalItems) return null;
  const first = (page.page - 1) * page.pageSize + 1;
  const last = Math.min(page.page * page.pageSize, page.totalItems);

  return (
    <nav aria-label={ariaLabel} className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="tabular-nums text-muted-foreground"><bdi>{first.toLocaleString("ar-SA")}–{last.toLocaleString("ar-SA")}</bdi> من {page.totalItems.toLocaleString("ar-SA")}</p>
      <div className="flex items-center gap-1">
        <PageLink disabled={!page.hasPreviousPage} href={pageHref(basePath, { ...query, page: page.page - 1 })} label="الصفحة السابقة"><ChevronRight /></PageLink>
        <span className="min-w-10 px-2 text-center text-xs font-semibold tabular-nums">{page.page.toLocaleString("ar-SA")} / {page.totalPages.toLocaleString("ar-SA")}</span>
        <PageLink disabled={!page.hasNextPage} href={pageHref(basePath, { ...query, page: page.page + 1 })} label="الصفحة التالية"><ChevronLeft /></PageLink>
      </div>
    </nav>
  );
}

function PageLink({ disabled, href, label, children }: { disabled: boolean; href: string; label: string; children: React.ReactNode }) {
  const className = "inline-flex size-9 items-center justify-center rounded-[4px] border border-border bg-background [&_svg]:size-4";
  return disabled ? <span aria-disabled="true" className={`${className} text-muted-foreground opacity-50`}>{children}</span> : <Link aria-label={label} className={`${className} hover:bg-dashboard-hover`} href={href}>{children}</Link>;
}

function pageHref(basePath: string, query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); });
  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}
