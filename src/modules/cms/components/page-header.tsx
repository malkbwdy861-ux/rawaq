import type { ReactNode } from "react";

export function CmsPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold leading-[1.45] md:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-[55ch] text-base leading-[1.65] text-[oklch(42%_0.018_150)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
