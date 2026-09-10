"use client";

import { useId, useState } from "react";

import type { CmsRelationOption } from "../types";
import { CmsStatusBadge } from "./status-badge";

export function CmsRelationSelector({
  name,
  label,
  options,
  selectedIds = [],
  emptyText = "لا توجد علاقات محددة.",
}: {
  name: string;
  label: string;
  options: CmsRelationOption[];
  selectedIds?: string[];
  emptyText?: string;
}) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set(selectedIds));
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = options.filter((option) => {
    if (!normalizedQuery) return true;
    return `${option.label} ${option.description ?? ""}`.toLowerCase().includes(normalizedQuery);
  });
  const selectedOptions = options.filter((option) => selected.has(option.id));

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold leading-[1.55]">{label}</h3>
        <p className="max-w-[55ch] text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">
          العلاقات تحفظ داخل نسخة المسودة فقط ولا تغير النسخة المنشورة حتى يتم النشر.
        </p>
      </div>

      {[...selected].map((id) => (
        <input key={id} name={name} type="hidden" value={id} />
      ))}

      <label className="grid gap-2" htmlFor={searchId}>
        <span className="text-[0.8125rem] font-semibold leading-[1.55]">بحث في العلاقات</span>
        <input
          className="min-h-11 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2"
          id={searchId}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          value={query}
        />
      </label>

      <div className="grid gap-2 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-3">
        {selectedOptions.length ? (
          selectedOptions.map((option) => (
            <SelectedRelation key={option.id} option={option} onRemove={() => toggle(option.id)} />
          ))
        ) : (
          <p className="text-sm leading-[1.6] text-[oklch(50%_0.014_150)]">{emptyText}</p>
        )}
      </div>

      <div className="grid gap-2">
        {visibleOptions.map((option) => {
          const isSelected = selected.has(option.id);
          return (
            <button
              className="grid min-h-11 gap-1 rounded-[4px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)] aria-pressed:border-[oklch(37%_0.075_155)] aria-pressed:bg-[oklch(95.5%_0.018_145)]"
              aria-pressed={isSelected}
              key={option.id}
              onClick={() => toggle(option.id)}
              type="button"
            >
              <span className="font-semibold">{option.label}</span>
              {option.description ? (
                <span className="text-sm text-[oklch(42%_0.018_150)]">{option.description}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SelectedRelation({
  option,
  onRemove,
}: {
  option: CmsRelationOption;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[4px] border border-[oklch(82%_0.012_145)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid gap-1">
        <span className="font-semibold">{option.label}</span>
        {option.description ? (
          <span className="text-sm text-[oklch(42%_0.018_150)]">{option.description}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {option.status ? (
          <CmsStatusBadge status={{ status: option.status }} />
        ) : null}
        <button
          className="min-h-10 rounded-[4px] border border-[oklch(64%_0.018_145)] px-3 py-2 text-[0.8125rem] font-semibold text-[oklch(46%_0.16_28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]"
          onClick={onRemove}
          type="button"
        >
          إزالة
        </button>
      </div>
    </div>
  );
}
