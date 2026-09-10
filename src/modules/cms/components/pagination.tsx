import Link from "next/link";

import type { CmsPagination } from "../types";
import { getCmsPagination } from "../validation";

export function CmsPaginationControls({
  pagination,
  basePath,
  query,
}: {
  pagination: CmsPagination;
  basePath: string;
  query?: Record<string, string | number | undefined>;
}) {
  const page = getCmsPagination(pagination);

  return (
    <nav
      aria-label="صفحات النتائج"
      className="flex flex-col gap-3 text-sm text-[oklch(42%_0.018_150)] sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="tabular-nums">
        صفحة {page.page} من {page.totalPages}، {page.totalItems} سجل
      </p>
      <div className="flex gap-2">
        <PaginationLink
          disabled={!page.hasPreviousPage}
          href={pageHref(basePath, { ...query, page: page.page - 1 })}
        >
          السابق
        </PaginationLink>
        <PaginationLink
          disabled={!page.hasNextPage}
          href={pageHref(basePath, { ...query, page: page.page + 1 })}
        >
          التالي
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  disabled,
  href,
  children,
}: {
  disabled: boolean;
  href: string;
  children: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(82%_0.012_145)] bg-[oklch(95%_0.012_110)] px-4 py-2 text-[0.8125rem] font-semibold text-[oklch(53%_0.012_150)]">
        {children}
      </span>
    );
  }

  return (
    <Link
      className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-4 py-2 text-[0.8125rem] font-semibold text-[oklch(37%_0.075_155)] hover:bg-[oklch(95.5%_0.018_145)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]"
      href={href}
    >
      {children}
    </Link>
  );
}

function pageHref(path: string, query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}
