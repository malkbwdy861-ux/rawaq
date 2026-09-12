import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      className="grid gap-3 border-y border-border bg-card px-4 py-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
    >
      <label className="grid gap-2">
        <span className="text-[0.8125rem] font-semibold leading-[1.55]">بحث</span>
        <span className="relative"><Search aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" /><Input
          className="min-h-10 rounded-[4px] border-border-strong bg-background pe-10 text-base focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-2"
          defaultValue={query}
          name="q"
          placeholder={searchPlaceholder}
          type="search"
        /></span>
      </label>

      <label className="grid gap-2">
        <span className="text-[0.8125rem] font-semibold leading-[1.55]">الحالة</span>
        <Select defaultValue={status} name="status">
          <SelectTrigger className="min-h-10 rounded-[4px] border-border-strong bg-background text-base focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
          {statusOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {cmsStatusLabels[option]}
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
      </label>

      <div className="flex items-end">
        <Button className="min-h-10 w-full rounded-[4px] md:w-auto" type="submit">
          تطبيق
        </Button>
      </div>
    </form>
  );
}
