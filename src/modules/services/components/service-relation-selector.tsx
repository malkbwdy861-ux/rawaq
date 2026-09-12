"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useId, useState } from "react";

import type { CmsRelationOption } from "@/modules/cms/types";

export function ServiceRelationSelector({ name, label, options, selectedIds = [] }: { name: string; label: string; options: CmsRelationOption[]; selectedIds?: string[] }) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set(selectedIds));
  const normalizedQuery = query.trim().toLowerCase();
  const visible = options.filter((option) => !normalizedQuery || `${option.label} ${option.description ?? ""}`.toLowerCase().includes(normalizedQuery));

  function toggle(id: string) { setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  return (
    <details className="group border-b border-border last:border-b-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 marker:content-none"><span className="text-sm font-medium">{label}</span><span className="flex items-center gap-3"><span className="text-xs tabular-nums text-muted-foreground">{selected.size ? `${selected.size.toLocaleString("ar-SA")} محدد` : "غير محدد"}</span><ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></span></summary>
      {[...selected].map((id) => <input key={id} name={name} type="hidden" value={id} />)}
      <div className="pb-4">
        <label className="relative block" htmlFor={searchId}><span className="sr-only">بحث في {label}</span><Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="h-10 w-full rounded-[4px] border border-border bg-background ps-9 pe-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25" id={searchId} onChange={(event) => setQuery(event.target.value)} placeholder={`بحث في ${label}`} type="search" value={query} /></label>
        <div className="mt-2 max-h-60 overflow-y-auto rounded-[4px] border border-border bg-background p-1">{visible.length ? visible.map((option) => { const active = selected.has(option.id); return <button aria-pressed={active} className="flex min-h-10 w-full items-center gap-3 rounded-[3px] px-2 text-start text-sm hover:bg-dashboard-hover" key={option.id} onClick={() => toggle(option.id)} type="button"><span className={`grid size-4 shrink-0 place-items-center rounded-[3px] border ${active ? "border-primary bg-primary text-primary-foreground" : "border-border-strong"}`}>{active ? <Check className="size-3" /> : null}</span><span className="min-w-0"><span className="block truncate font-medium">{option.label}</span>{option.description ? <bdi className="block truncate text-xs text-muted-foreground" dir="ltr">{option.description}</bdi> : null}</span></button>; }) : <p className="px-3 py-6 text-center text-sm text-muted-foreground">لا توجد نتائج</p>}</div>
      </div>
    </details>
  );
}
