import type { ReactNode } from "react";

type CmsStateTone = "empty" | "loading" | "error" | "success" | "warning";

const toneClasses: Record<CmsStateTone, string> = {
  empty: "border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] text-[oklch(22%_0.018_155)]",
  loading: "border-[oklch(82%_0.012_145)] bg-[oklch(96.5%_0.009_120)] text-[oklch(22%_0.018_155)]",
  error: "border-[oklch(46%_0.16_28)] bg-[oklch(94%_0.025_28)] text-[oklch(46%_0.16_28)]",
  success: "border-[oklch(44%_0.085_155)] bg-[oklch(95.5%_0.018_145)] text-[oklch(44%_0.085_155)]",
  warning: "border-[oklch(47%_0.10_75)] bg-[oklch(94%_0.035_80)] text-[oklch(47%_0.10_75)]",
};

export function CmsStateBlock({
  tone = "empty",
  title,
  description,
  action,
}: {
  tone?: CmsStateTone;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`rounded-[8px] border p-5 ${toneClasses[tone]}`}>
      <h2 className="text-xl font-semibold leading-[1.5]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-[55ch] text-base leading-[1.65]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function CmsEmptyState({
  title = "لا توجد سجلات بعد",
  description,
  actionHref,
  actionLabel,
}: {
  title?: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <CmsStateBlock
      title={title}
      description={description}
      action={
        actionHref && actionLabel ? (
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-[4px] bg-[oklch(37%_0.075_155)] px-4 py-2 text-[0.8125rem] font-semibold text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]"
            href={actionHref}
          >
            {actionLabel}
          </a>
        ) : null
      }
    />
  );
}

export function CmsListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)]">
      {Array.from({ length: rows }, (_, index) => (
        <div
          className="grid gap-3 border-b border-[oklch(82%_0.012_145)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_160px_140px]"
          key={index}
        >
          <div className="h-5 animate-pulse rounded-[4px] bg-[oklch(95%_0.012_110)]" />
          <div className="h-5 animate-pulse rounded-[4px] bg-[oklch(95%_0.012_110)]" />
          <div className="h-5 animate-pulse rounded-[4px] bg-[oklch(95%_0.012_110)]" />
        </div>
      ))}
    </div>
  );
}
