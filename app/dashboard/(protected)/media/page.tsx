import { MediaType, type Prisma } from "@prisma/client";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { getCmsPagination } from "@/modules/cms/validation";
import { CmsRouteToast } from "@/modules/cms/components/route-toast";
import { MediaActions } from "@/modules/media/components/media-edit-dialog";
import { MediaToolbar } from "@/modules/media/components/media-toolbar";
import { MediaUploadDialog } from "@/modules/media/components/media-upload-dialog";
import { ServicesPagination } from "@/modules/services/components/services-pagination";
import { prisma } from "@/server/db/prisma";

type MediaPageSearchParams = Promise<{ q?: string; sort?: string; page?: string; success?: string; error?: string }>;
type MediaSort = "latest" | "oldest" | "name";

const dateFormatter = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" });

export default async function MediaPage({ searchParams }: { searchParams: MediaPageSearchParams }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const sort: MediaSort = params.sort === "oldest" || params.sort === "name" ? params.sort : "latest";
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const where: Prisma.MediaWhereInput = {
    type: MediaType.IMAGE,
    OR: query ? [
      { originalFilename: { contains: query, mode: "insensitive" } },
      { altText: { contains: query, mode: "insensitive" } },
      { caption: { contains: query, mode: "insensitive" } },
    ] : undefined,
  };
  const totalItems = await prisma.media.count({ where });
  const pagination = getCmsPagination({ page: requestedPage, pageSize: 10, totalItems });
  const mediaItems = await prisma.media.findMany({
    where,
    select: { id: true, url: true, originalFilename: true, altText: true, caption: true, width: true, height: true, sizeBytes: true, createdAt: true },
    orderBy: sort === "name" ? [{ originalFilename: "asc" }, { id: "asc" }] : [{ createdAt: sort === "oldest" ? "asc" : "desc" }, { id: sort === "oldest" ? "asc" : "desc" }],
    skip: pagination.skip,
    take: pagination.take,
  });

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[1.75rem] font-bold leading-10">مكتبة الصور</h1><p className="mt-1 text-sm leading-6 text-text-secondary">رفع الصور المستخدمة في الموقع وتحرير أوصافها وروابطها.</p></div><MediaUploadDialog /></header>
      <CmsRouteToast cleanHref="/dashboard/media" error={params.error} success={params.success} />

      <section aria-label="مكتبة الصور" className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
        <MediaToolbar query={query} sort={sort} totalItems={totalItems} />
        {mediaItems.length === 0 ? <div className="grid min-h-72 place-items-center px-6 py-12 text-center"><div><span className="mx-auto grid size-10 place-items-center rounded-md bg-secondary text-muted-foreground"><ImageIcon className="size-5" /></span><h2 className="mt-4 text-lg font-semibold">{query ? "لا توجد صور مطابقة" : "لا توجد صور بعد"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{query ? "غيّر عبارة البحث لعرض صور أخرى." : "ارفع أول صورة لتصبح متاحة في محررات المحتوى."}</p></div></div> : <>
          <div className="hidden md:block"><table className="w-full table-fixed text-start text-sm"><thead className="bg-dashboard-canvas/65 text-xs font-medium text-muted-foreground"><tr className="h-11"><th className="w-auto px-4 text-start font-medium">الصورة</th><th className="w-48 px-4 text-start font-medium">الحجم والأبعاد</th><th className="w-64 px-4 text-start font-medium">النص البديل</th><th className="w-40 px-4 text-start font-medium">تاريخ الرفع</th><th className="w-24 px-3"><span className="sr-only">الإجراءات</span></th></tr></thead><tbody>{mediaItems.map((item) => <tr className="h-[72px] border-t border-border/80 transition-colors hover:bg-dashboard-hover/55" key={item.id}><td className="px-4"><div className="flex min-w-0 items-center gap-3"><span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary"><Image alt={item.altText ?? ""} className="object-contain p-1" fill sizes="48px" src={item.url} unoptimized /></span><span className="min-w-0"><bdi className="block truncate font-semibold" dir="ltr" title={item.originalFilename}>{item.originalFilename}</bdi><bdi className="mt-0.5 block truncate text-xs text-muted-foreground" dir="ltr" title={item.url}>{item.url}</bdi></span></div></td><td className="px-4 text-xs text-text-secondary"><span className="block tabular-nums">{formatBytes(item.sizeBytes)}</span>{item.width && item.height ? <span className="mt-1 block tabular-nums">{item.width} × {item.height}</span> : null}</td><td className="px-4"><p className="line-clamp-2 text-xs leading-5 text-text-secondary">{item.altText || "لم يضف نص بديل"}</p></td><td className="px-4 text-xs text-text-secondary"><time dateTime={item.createdAt.toISOString()}>{dateFormatter.format(item.createdAt)}</time></td><td className="px-3"><MediaActions item={item} /></td></tr>)}</tbody></table></div>
          <div className="divide-y divide-border md:hidden">{mediaItems.map((item) => <article className="grid grid-cols-[64px_minmax(0,1fr)_auto] gap-3 px-4 py-4" key={item.id}><span className="relative size-16 overflow-hidden rounded-md bg-secondary"><Image alt={item.altText ?? ""} className="object-contain p-1" fill sizes="64px" src={item.url} unoptimized /></span><div className="min-w-0"><bdi className="block truncate text-sm font-semibold" dir="ltr">{item.originalFilename}</bdi><bdi className="mt-1 block truncate text-xs text-muted-foreground" dir="ltr">{item.url}</bdi><p className="mt-2 text-xs text-text-secondary"><span className="tabular-nums">{formatBytes(item.sizeBytes)}</span>{item.width && item.height ? <> · <span className="tabular-nums">{item.width} × {item.height}</span></> : null}</p></div><MediaActions item={item} /></article>)}</div>
        </>}
        <ServicesPagination ariaLabel="صفحات الصور" basePath="/dashboard/media" pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} query={{ q: query || undefined, sort: sort === "latest" ? undefined : sort }} />
      </section>
    </div>
  );
}

function formatBytes(bytes: number) {
  const formatter = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 });
  return bytes < 1024 * 1024 ? `${formatter.format(bytes / 1024)} كيلوبايت` : `${formatter.format(bytes / 1024 / 1024)} ميجابايت`;
}
