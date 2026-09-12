"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CmsInput, CmsTextarea } from "@/modules/cms/components/form";

type Item = { title?: string; description?: string };

export function RepeatableItems({ name, initialItems = [], addLabel }: { name: string; initialItems?: Item[]; addLabel: string }) {
  const [items, setItems] = useState(() => initialItems.length ? initialItems : []);
  return <div className="grid gap-3">
    {items.map((item, index) => <div className="grid gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]" key={index}>
      <label className="grid gap-2"><span className="text-[0.8125rem] font-semibold">العنوان</span><CmsInput name={`${name}Titles`} defaultValue={item.title ?? ""} /></label>
      <label className="grid gap-2"><span className="text-[0.8125rem] font-semibold">الوصف</span><CmsTextarea name={`${name}Descriptions`} defaultValue={item.description ?? ""} /></label>
      <Button className="min-h-10 self-end rounded-[4px]" type="button" variant="outline" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>إزالة</Button>
    </div>)}
    <Button className="min-h-10 justify-self-start rounded-[4px]" type="button" variant="outline" onClick={() => setItems((current) => [...current, {}])}>{addLabel}</Button>
  </div>;
}
