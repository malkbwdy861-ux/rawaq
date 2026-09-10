import type { CmsListItemStatus, CmsStatus, CmsStatusFilter } from "../types";

const statusLabels: Record<CmsStatusFilter, string> = {
  ALL: "كل الحالات",
  DRAFT: "مسودة",
  PUBLISHED: "منشور",
  ARCHIVED: "مؤرشف",
  UNPUBLISHED_CHANGES: "منشور مع تعديلات غير منشورة",
};

const statusClasses: Record<CmsStatus, string> = {
  DRAFT: "border-[oklch(46%_0.09_240)] bg-[oklch(94%_0.025_240)] text-[oklch(46%_0.09_240)]",
  PUBLISHED: "border-[oklch(44%_0.085_155)] bg-[oklch(95.5%_0.018_145)] text-[oklch(44%_0.085_155)]",
  ARCHIVED: "border-[oklch(46%_0.16_28)] bg-[oklch(94%_0.025_28)] text-[oklch(46%_0.16_28)]",
};

export function getCmsStatusLabel(status: CmsListItemStatus | CmsStatusFilter) {
  if (typeof status === "string") {
    return statusLabels[status];
  }

  if (
    status.status === "PUBLISHED" &&
    status.hasPublishedVersion &&
    status.hasDraftVersion
  ) {
    return statusLabels.UNPUBLISHED_CHANGES;
  }

  return statusLabels[status.status];
}

export function CmsStatusBadge({ status }: { status: CmsListItemStatus }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-[4px] border px-2 py-1 text-[0.8125rem] font-semibold leading-[1.55] ${statusClasses[status.status]}`}
    >
      {getCmsStatusLabel(status)}
    </span>
  );
}

export { statusLabels as cmsStatusLabels };
