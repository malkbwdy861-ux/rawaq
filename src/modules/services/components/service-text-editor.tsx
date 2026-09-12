"use client";

import { AlignRight } from "lucide-react";
import { useState } from "react";

export function ServiceTextEditor({ defaultValue }: { defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div className="overflow-hidden rounded-[5px] border border-border-strong bg-card transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25">
      <div className="flex h-10 items-center justify-between border-b border-border bg-dashboard-canvas/60 px-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><AlignRight className="size-4" />نص عادي</span><span className="tabular-nums">{value.length.toLocaleString("ar-SA")} حرف</span></div>
      <textarea aria-describedby="content-hint" className="min-h-80 w-full resize-y bg-card px-4 py-4 text-base leading-8 outline-none" id="content" name="content" onChange={(event) => setValue(event.target.value)} value={value} />
    </div>
  );
}
