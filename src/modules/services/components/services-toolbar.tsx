import { ChevronDown, Search, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cmsStatusLabels } from "@/modules/cms/components/status-badge";
import type { CmsStatusFilter } from "@/modules/cms/types";

const statusOptions: CmsStatusFilter[] = ["ALL", "DRAFT", "PUBLISHED", "UNPUBLISHED_CHANGES", "ARCHIVED"];

export function ServicesToolbar({ query, status = "ALL", totalItems, statusCounts }: { query?: string; status?: CmsStatusFilter; totalItems: number; statusCounts: Record<CmsStatusFilter, number> }) {
  const filtered = Boolean(query || status !== "ALL");

  return (
    <div className="border-b border-border bg-card">
      <nav aria-label="تصفية الخدمات حسب الحالة" className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-3">
        {statusOptions.map((option) => {
          const active = status === option;
          const params = new URLSearchParams();
          if (query) params.set("q", query);
          if (option !== "ALL") params.set("status", option);
          const search = params.toString();
          return <Link aria-current={active ? "page" : undefined} className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-t-md px-3 text-xs font-semibold transition-colors ${active ? "bg-primary-soft text-primary shadow-[inset_0_-2px_0_var(--primary)]" : "text-muted-foreground hover:bg-dashboard-hover hover:text-foreground"}`} href={search ? `/dashboard/services?${search}` : "/dashboard/services"} key={option}>{cmsStatusLabels[option]}<span className="rounded-full bg-card/80 px-1.5 py-0.5 text-[10px] tabular-nums">{statusCounts[option].toLocaleString("ar-SA")}</span></Link>;
        })}
      </nav>
      <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center">
      <form action="" className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1 sm:max-w-md">
          <span className="sr-only">البحث في الخدمات</span>
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input className="h-10 w-full rounded-md border border-border-strong bg-card ps-9 pe-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25" defaultValue={query} name="q" placeholder="البحث في الخدمات..." type="search" />
        </label>
        <label className="relative sm:w-48">
          <span className="sr-only">تصفية حسب الحالة</span>
          <select className="h-10 w-full appearance-none rounded-md border border-border-strong bg-card px-3 pe-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25" defaultValue={status} name="status">
            {statusOptions.map((option) => <option key={option} value={option}>{cmsStatusLabels[option]}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </label>
        <Button className="h-10 min-h-10" type="submit" variant="secondary">تطبيق</Button>
        {filtered ? <Link aria-label="مسح البحث والتصفية" className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-dashboard-hover hover:text-foreground" href="/dashboard/services"><X className="size-4" /></Link> : null}
      </form>
      <p aria-live="polite" className="shrink-0 text-xs tabular-nums text-muted-foreground">{totalItems.toLocaleString("ar-SA")} خدمة</p>
      </div>
    </div>
  );
}
