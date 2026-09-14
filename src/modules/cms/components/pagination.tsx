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
      className="flex flex-col gap-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between"
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
      <span className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-border bg-muted px-4 py-2 text-[0.8125rem] font-semibold text-text-disabled">
        {children}
      </span>
    );
  }

  return (
    <Link
      className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-control-border bg-card px-4 py-2 text-[0.8125rem] font-semibold text-brand-accent-strong hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
