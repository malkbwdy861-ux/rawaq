"use client";

import { AlignRight } from "lucide-react";
import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";

export function ServiceTextEditor({ defaultValue, error }: { defaultValue?: string | null; error?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div>
    <div className="overflow-hidden rounded-[5px] border border-border-strong bg-card transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25" data-invalid={Boolean(error) || undefined}>
      <div className="flex h-10 items-center justify-between border-b border-border bg-dashboard-canvas/60 px-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><AlignRight className="size-4" />نص عادي</span><span className="tabular-nums">{value.length.toLocaleString("ar-SA")} حرف</span></div>
      <Textarea aria-describedby={error ? "content-error" : undefined} aria-invalid={Boolean(error)} className="min-h-72 resize-y rounded-none border-0 bg-card px-4 py-4 text-base leading-8 shadow-none focus-visible:ring-0" id="content" name="content" onChange={(event) => setValue(event.target.value)} value={value} />
    </div>
    {error ? <p className="mt-2 text-sm font-medium text-destructive" id="content-error">{error}</p> : null}
    </div>
  );
}
