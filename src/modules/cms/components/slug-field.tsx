"use client";

import { useId, useState } from "react";

import { normalizeCmsSlug } from "../validation";
import { CmsFieldShell, cmsInputClassName } from "./form";

export function CmsSlugField({
  name = "slug",
  label = "الرابط المختصر",
  defaultValue,
  routePrefix,
  sourceValue,
  error,
}: {
  name?: string;
  label?: string;
  defaultValue?: string | null;
  routePrefix: string;
  sourceValue?: string;
  error?: string;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <CmsFieldShell
      id={id}
      label={label}
      hint="تغيير الرابط داخل المسودة لا يغير الصفحة العامة إلا بعد النشر. عند تغيير رابط منشور سيحتاج النشر إلى إنشاء إعادة توجيه."
      error={error}
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          className={cmsInputClassName}
          dir="ltr"
          id={id}
          name={name}
          onChange={(event) => setValue(event.target.value)}
          value={value}
        />
        <button
          className="min-h-11 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-[0.8125rem] font-semibold text-[oklch(37%_0.075_155)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]"
          onClick={() => setValue(normalizeCmsSlug(sourceValue ?? value))}
          type="button"
        >
          تنسيق الرابط
        </button>
      </div>
      <p className="text-sm leading-[1.6] text-[oklch(50%_0.014_150)]">
        المسار المتوقع: <bdi dir="ltr">{routePrefix}/{value || "slug"}</bdi>
      </p>
    </CmsFieldShell>
  );
}
