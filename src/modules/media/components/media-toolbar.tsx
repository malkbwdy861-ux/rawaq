"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MediaSort = "latest" | "oldest" | "name";

export function MediaToolbar({ query = "", sort, totalItems }: { query?: string; sort: MediaSort; totalItems: number }) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<number>(undefined);

  useEffect(() => {
    if (search.trim() === query) return;
    debounceRef.current = window.setTimeout(() => startTransition(() => router.replace(mediaHref(search, sort), { scroll: false })), 400);
    return () => window.clearTimeout(debounceRef.current);
  }, [query, router, search, sort]);

  function navigate(nextQuery: string, nextSort: MediaSort) {
    window.clearTimeout(debounceRef.current);
    startTransition(() => router.replace(mediaHref(nextQuery, nextSort), { scroll: false }));
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-card px-3 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1 sm:max-w-md"><span className="sr-only">البحث في الصور</span><Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-10 border-border-strong bg-card ps-9 pe-9 text-sm focus-visible:border-primary focus-visible:ring-ring/25" onChange={(event) => setSearch(event.target.value)} placeholder="البحث باسم الصورة أو وصفها..." type="search" value={search} />{pending ? <LoaderCircle aria-label="جارٍ تحديث الصور" className="absolute end-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground motion-reduce:animate-none" /> : null}</label>
        <label className="sm:w-48"><span className="sr-only">ترتيب الصور</span><Select onValueChange={(value) => navigate(search, value as MediaSort)} value={sort}><SelectTrigger className="h-10 border-border-strong bg-card focus-visible:border-primary focus-visible:ring-ring/25"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="latest">الأحدث أولاً</SelectItem><SelectItem value="oldest">الأقدم أولاً</SelectItem><SelectItem value="name">حسب اسم الصورة</SelectItem></SelectContent></Select></label>
      </div>
      <p aria-live="polite" className="shrink-0 text-xs tabular-nums text-muted-foreground">{totalItems.toLocaleString("ar-SA")} صورة</p>
    </div>
  );
}

function mediaHref(query: string, sort: MediaSort) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (sort !== "latest") params.set("sort", sort);
  return params.size ? `/dashboard/media?${params}` : "/dashboard/media";
}
