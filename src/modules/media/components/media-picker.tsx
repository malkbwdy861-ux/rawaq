"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export type MediaPickerItem = {
  id: string;
  url: string;
  originalFilename: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export function MediaPicker({
  items,
  name,
  defaultValue,
  label = "اختيار وسيط موجود",
}: {
  items: MediaPickerItem[];
  name: string;
  defaultValue?: string | null;
  label?: string;
}) {
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");

  return (
    <fieldset className="grid gap-3">
      <legend className="text-[0.8125rem] font-semibold leading-[1.55]">{label}</legend>
      <input name={name} type="hidden" value={selectedId} />

      {items.length === 0 ? (
        <p className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">
          لا توجد وسائط متاحة بعد. استخدم صفحة الوسائط لرفع صورة جديدة ثم عد لاختيارها.
        </p>
      ) : (
        <div className="grid max-h-[420px] gap-3 overflow-auto rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const selected = item.id === selectedId;

            return (
              <button
                aria-pressed={selected}
                className={`grid gap-2 rounded-[4px] border p-2 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)] ${
                  selected
                    ? "border-[oklch(37%_0.075_155)] bg-[oklch(90%_0.035_150)]"
                    : "border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] hover:bg-[oklch(95.5%_0.018_145)]"
                }`}
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                type="button"
              >
                <span className="relative aspect-square overflow-hidden rounded-[4px] bg-[oklch(95%_0.012_110)]">
                  <Image
                    alt={item.altText ?? ""}
                    className="object-contain p-1"
                    fill
                    sizes="(min-width: 1024px) 180px, (min-width: 640px) 50vw, 100vw"
                    src={item.url}
                  />
                </span>
                <span className="break-words text-sm font-medium leading-[1.6]" dir="ltr">
                  {item.originalFilename}
                </span>
                {item.width && item.height ? (
                  <span className="text-xs font-medium text-[oklch(50%_0.014_150)]" dir="ltr">
                    {item.width} x {item.height}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {selectedId ? (
        <Button
          className="min-h-10 justify-self-start rounded-[4px]"
          onClick={() => setSelectedId("")}
          type="button"
          variant="outline"
        >
          إزالة الاختيار
        </Button>
      ) : null}
    </fieldset>
  );
}
