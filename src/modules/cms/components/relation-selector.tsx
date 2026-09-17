"use client";

import { ArrowDown, ArrowUp, Check, ImageIcon, Pencil, Plus, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { Input } from "@/components/ui/input";

import type { CmsRelationOption } from "../types";
import { retainExistingSelectedIds } from "../reference-values";
import { CmsStatusBadge } from "./status-badge";

export function CmsRelationSelector({
  name,
  label,
  options,
  selectedIds = [],
  emptyText = "لا توجد علاقات محددة.",
  editBasePath,
  maxSelections,
}: {
  name: string;
  label: string;
  options: CmsRelationOption[];
  selectedIds?: string[];
  emptyText?: string;
  editBasePath?: string;
  maxSelections?: number;
}) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => retainExistingSelectedIds(selectedIds, options.map((option) => option.id)));
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = options.filter((option) => {
    if (!normalizedQuery) return true;
    return `${option.label} ${option.description ?? ""}`.toLowerCase().includes(normalizedQuery);
  });
  const selectedOptions = selected.flatMap((id) => {
    const option = options.find((item) => item.id === id);
    return option ? [option] : [];
  });
  const reachedLimit = maxSelections !== undefined && selected.length >= maxSelections;

  function toggle(id: string) {
    setSelected((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : maxSelections === undefined || current.length < maxSelections ? [...current, id] : current);
  }

  function move(id: string, direction: -1 | 1) {
    setSelected((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-[1.55]">{label}</h3>
          <p className="max-w-[55ch] text-sm leading-[1.6] text-text-secondary">
            اختر العناصر من القائمة أدناه، ثم رتّبها حسب أولوية ظهورها.
          </p>
        </div>
        <span className="w-fit rounded-md bg-brand-accent-soft px-2.5 py-1.5 text-xs font-semibold text-brand-accent-strong" aria-live="polite">
          تم اختيار {selected.length}{maxSelections ? ` من ${maxSelections}` : ""}
        </span>
      </div>

      {selected.map((id) => (
        <input key={id} name={name} type="hidden" value={id} />
      ))}

      <div className="rounded-lg border border-border bg-secondary/35 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">سيظهر في الصفحة</h4>
            <p className="mt-0.5 text-xs leading-5 text-text-secondary">العنصر الأول يحصل على المساحة الأكبر في التصميم.</p>
          </div>
        </div>
        <div className="grid gap-2">
        {selectedOptions.length ? (
          selectedOptions.map((option, index) => (
            <SelectedRelation
              editHref={editBasePath ? `${editBasePath}/${option.id}` : undefined}
              isFirst={index === 0}
              isLast={index === selectedOptions.length - 1}
              key={option.id}
              onMoveDown={() => move(option.id, 1)}
              onMoveUp={() => move(option.id, -1)}
              option={option}
              onRemove={() => toggle(option.id)}
            />
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border-strong bg-card px-4 py-6 text-center">
            <p className="text-sm font-semibold text-foreground">لم تختر أي عنصر بعد</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">اضغط «إضافة للقسم» من القائمة التالية.</p>
            <span className="sr-only">{emptyText}</span>
          </div>
        )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">اختر من العناصر المتاحة</h4>
          <p className="mt-0.5 text-xs leading-5 text-text-secondary">اضغط على أي عنصر لإضافته إلى القسم.</p>
        </div>
        <label className="relative block" htmlFor={searchId}>
          <span className="sr-only">بحث في {label}</span>
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="min-h-11 bg-card pe-3 ps-10 text-base" id={searchId} onChange={(event) => setQuery(event.target.value)} placeholder={`ابحث في ${label}`} type="search" value={query} />
        </label>
        {reachedLimit ? <p className="rounded-md bg-warning-soft px-3 py-2 text-xs font-semibold leading-5 text-warning" role="status">اكتمل الحد الأقصى. أزل عنصراً أو غيّر الترتيب قبل إضافة عنصر آخر.</p> : null}
        <div className="grid gap-2 sm:grid-cols-2">
        {visibleOptions.map((option) => {
          const isSelected = selected.includes(option.id);
          const isDisabled = reachedLimit && !isSelected;
          return (
            <button
              className="flex min-h-16 items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-start outline-none transition-colors hover:border-primary hover:bg-primary-soft/45 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-pressed:border-primary aria-pressed:bg-primary-soft disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
              aria-pressed={isSelected}
              disabled={isDisabled}
              key={option.id}
              onClick={() => toggle(option.id)}
              type="button"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                <OptionThumbnail option={option} />
                <span aria-hidden="true" className={`absolute bottom-0.5 end-0.5 grid size-5 place-items-center rounded-sm border border-card ${isSelected ? "bg-primary text-primary-foreground" : "bg-card text-brand-accent-strong"}`}>{isSelected ? <Check className="size-3" /> : <Plus className="size-3" />}</span>
              </div>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-text-secondary">{isSelected ? "مضاف إلى القسم" : "إضافة للقسم"}</span>
              </span>
            </button>
          );
        })}
        </div>
        {!visibleOptions.length ? <p className="rounded-md border border-dashed border-border-strong px-4 py-6 text-center text-sm text-text-secondary">لا توجد نتائج مطابقة للبحث.</p> : null}
      </div>
    </section>
  );
}

function SelectedRelation({
  option,
  onRemove,
  editHref,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  option: CmsRelationOption;
  onRemove: () => void;
  editHref?: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary"><OptionThumbnail option={option} /></div>
        <div className="grid min-w-0 gap-1">
        <span className="truncate font-semibold">{option.label}</span>
        {option.description ? (
          <span className="truncate text-sm text-text-secondary">{option.description}</span>
        ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {option.status ? (
          <CmsStatusBadge status={{ status: option.status }} />
        ) : null}
        <button aria-label={`رفع ${option.label} في الترتيب`} className="grid size-10 place-items-center rounded-md border border-border-strong text-foreground outline-none hover:border-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground" disabled={isFirst} onClick={onMoveUp} title="رفع في الترتيب" type="button"><ArrowUp aria-hidden="true" className="size-4" /></button>
        <button aria-label={`خفض ${option.label} في الترتيب`} className="grid size-10 place-items-center rounded-md border border-border-strong text-foreground outline-none hover:border-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground" disabled={isLast} onClick={onMoveDown} title="خفض في الترتيب" type="button"><ArrowDown aria-hidden="true" className="size-4" /></button>
        {editHref ? (
          <Link aria-label={`تعديل ${option.label}`} className="grid size-10 place-items-center rounded-md border border-border-strong bg-card text-foreground outline-none transition-colors hover:border-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={editHref} title="تعديل الخدمة">
            <Pencil aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
        <button
          aria-label={`إزالة ${option.label} من القسم`}
          className="grid size-10 place-items-center rounded-md border border-border-strong text-destructive outline-none hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onRemove}
          title="إزالة من القسم"
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

function OptionThumbnail({ option }: { option: CmsRelationOption }) {
  return option.imageUrl
    ? <Image alt="" className="object-cover" fill sizes="56px" src={option.imageUrl} />
    : <span aria-hidden="true" className="grid size-full place-items-center text-muted-foreground"><ImageIcon className="size-5" /></span>;
}
