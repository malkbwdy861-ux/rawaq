import { Button } from "@/components/ui/button";

import { cmsStatusLabels } from "./status-badge";
import type { CmsStatusFilter } from "../types";

const statusOptions: CmsStatusFilter[] = [
  "ALL",
  "DRAFT",
  "PUBLISHED",
  "UNPUBLISHED_CHANGES",
  "ARCHIVED",
];

export function CmsListToolbar({
  query,
  status = "ALL",
  searchPlaceholder = "ابحث في السجلات",
}: {
  query?: string;
  status?: CmsStatusFilter;
  searchPlaceholder?: string;
}) {
  return (
    <form
      action=""
      className="grid gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 md:grid-cols-[minmax(0,1fr)_220px_auto]"
    >
      <label className="grid gap-2">
        <span className="text-[0.8125rem] font-semibold leading-[1.55]">بحث</span>
        <input
          className="min-h-10 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2"
          defaultValue={query}
          name="q"
          placeholder={searchPlaceholder}
          type="search"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-[0.8125rem] font-semibold leading-[1.55]">الحالة</span>
        <select
          className="min-h-10 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2"
          defaultValue={status}
          name="status"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {cmsStatusLabels[option]}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end">
        <Button className="min-h-10 w-full rounded-[4px] md:w-auto" type="submit">
          تطبيق
        </Button>
      </div>
    </form>
  );
}
