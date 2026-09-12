"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ServiceStatusFilter = "ALL" | "DRAFT" | "PUBLISHED";
const statusLabels: Record<ServiceStatusFilter, string> = { ALL: "كل الخدمات", DRAFT: "مسودة", PUBLISHED: "منشور" };
const statusOptions: ServiceStatusFilter[] = ["ALL", "DRAFT", "PUBLISHED"];

export function ServicesToolbar({ query = "", status = "ALL", pageSize, totalItems, statusCounts }: { query?: string; status?: ServiceStatusFilter; pageSize: number; totalItems: number; statusCounts: Record<ServiceStatusFilter, number> }) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<number>(undefined);

  useEffect(() => {
    if (search.trim() === query) return;
    debounceRef.current = window.setTimeout(() => {
      startTransition(() => router.replace(serviceListHref(search, status, pageSize), { scroll: false }));
    }, 400);
    return () => window.clearTimeout(debounceRef.current);
  }, [pageSize, query, router, search, status]);

  function navigate(nextQuery: string, nextStatus: ServiceStatusFilter) {
    window.clearTimeout(debounceRef.current);
    startTransition(() => router.replace(serviceListHref(nextQuery, nextStatus, pageSize), { scroll: false }));
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-card px-3 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1 sm:max-w-md">
          <span className="sr-only">البحث في الخدمات</span>
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-10 border-border-strong bg-card ps-9 pe-9 text-sm focus-visible:border-primary focus-visible:ring-ring/25" onChange={(event) => setSearch(event.target.value)} placeholder="البحث في الخدمات..." type="search" value={search} />
          {pending ? <LoaderCircle aria-label="جارٍ تحديث النتائج" className="absolute end-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" /> : null}
        </label>
        <label className="grid gap-1 sm:w-48">
          <span className="sr-only">تصفية حسب الحالة</span>
          <Select onValueChange={(value) => navigate(search, value as ServiceStatusFilter)} value={status}>
            <SelectTrigger className="h-10 border-border-strong bg-card focus-visible:border-primary focus-visible:ring-ring/25">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {statusOptions.map((option) => <SelectItem key={option} value={option}>{statusLabels[option]} ({statusCounts[option].toLocaleString("ar-SA")})</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
      </div>
      <p aria-live="polite" className="shrink-0 text-xs tabular-nums text-muted-foreground">{totalItems.toLocaleString("ar-SA")} خدمة</p>
    </div>
  );
}

function serviceListHref(query: string, status: ServiceStatusFilter, pageSize: number) {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();
  if (normalizedQuery) params.set("q", normalizedQuery);
  if (status !== "ALL") params.set("status", status);
  if (pageSize !== 10) params.set("pageSize", String(pageSize));
  return params.size ? `/dashboard/services?${params}` : "/dashboard/services";
}
