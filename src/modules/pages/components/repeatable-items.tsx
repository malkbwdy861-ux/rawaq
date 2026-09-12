"use client";

import { useState } from "react";
import { MapPin, Settings2, ShieldCheck, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CmsInput, CmsTextarea } from "@/modules/cms/components/form";

type Item = { title?: string; description?: string; icon?: "location" | "shield" | "team" | "settings" };
const iconOptions = [
  { value: "location", label: "الموقع", icon: MapPin },
  { value: "shield", label: "الجودة", icon: ShieldCheck },
  { value: "team", label: "الفريق", icon: UsersRound },
  { value: "settings", label: "التنفيذ", icon: Settings2 },
] as const;

export function RepeatableItems({ name, initialItems = [], addLabel, showIcon = false, maxItems, minimumRows = 0 }: { name: string; initialItems?: Item[]; addLabel: string; showIcon?: boolean; maxItems?: number; minimumRows?: number }) {
  const [items, setItems] = useState<Item[]>(() => initialItems.length ? initialItems : Array.from({ length: minimumRows }, () => ({})));
  return <div className="grid gap-3">
    {items.map((item, index) => <div className={`grid gap-3 rounded-lg border border-border bg-secondary/30 p-3 ${showIcon ? "sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1.4fr)_auto]" : "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]"}`} key={index}>
      {showIcon ? <div className="grid gap-2"><span className="text-[0.8125rem] font-semibold">الأيقونة</span><Select defaultValue={item.icon ?? "shield"} name={`${name}Icons`}><SelectTrigger className="h-11 border-border-strong bg-card"><SelectValue placeholder="اختر الأيقونة" /></SelectTrigger><SelectContent>{iconOptions.map((option) => { const Icon = option.icon; return <SelectItem key={option.value} value={option.value}><Icon className="size-4 text-primary" />{option.label}</SelectItem>; })}</SelectContent></Select></div> : null}
      <label className="grid gap-2"><span className="text-[0.8125rem] font-semibold">العنوان</span><CmsInput className="max-w-none" name={`${name}Titles`} defaultValue={item.title ?? ""} /></label>
      <label className="grid gap-2"><span className="text-[0.8125rem] font-semibold">الوصف المختصر</span><CmsTextarea className="min-h-11 max-w-none resize-none" name={`${name}Descriptions`} defaultValue={item.description ?? ""} /></label>
      <Button className="min-h-11 self-end rounded-md" type="button" variant="outline" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>إزالة</Button>
    </div>)}
    {!maxItems || items.length < maxItems ? <Button className="min-h-10 justify-self-start rounded-[4px]" type="button" variant="outline" onClick={() => setItems((current) => [...current, {}])}>{addLabel}</Button> : null}
  </div>;
}
