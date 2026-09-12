import { MediaType, type Prisma } from "@prisma/client";
import { ChevronDown, File, Grid2X2, ImageIcon, List, Search, SlidersHorizontal, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { deleteMediaAction, updateMediaMetadataAction, uploadMediaAction } from "@/modules/media/actions";
import { mediaConfig } from "@/modules/media/config";
import { prisma } from "@/server/db/prisma";

type MediaPageSearchParams = Promise<{ q?: string; type?: string; sort?: string; view?: string; success?: string; error?: string }>;

const dateFormatter = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" });

export default async function MediaPage({ searchParams }: { searchParams: MediaPageSearchParams }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const type = params.type === MediaType.FILE ? MediaType.FILE : params.type === MediaType.IMAGE ? MediaType.IMAGE : undefined;
  const sort = params.sort === "oldest" || params.sort === "name" ? params.sort : "latest";
  const view = params.view === "list" ? "list" : "grid";
  const where: Prisma.MediaWhereInput = {
    type,
    OR: query ? [
      { originalFilename: { contains: query, mode: "insensitive" } },
      { altText: { contains: query, mode: "insensitive" } },
      { caption: { contains: query, mode: "insensitive" } },
    ] : undefined,
  };
  const [mediaItems, totalItems] = await Promise.all([
    prisma.media.findMany({ where, orderBy: sort === "name" ? { originalFilename: "asc" } : { createdAt: sort === "oldest" ? "asc" : "desc" }, take: 60 }),
    prisma.media.count({ where }),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-[1.75rem] font-bold leading-10">مكتبة الوسائط</h1><p className="mt-1 text-sm leading-6 text-text-secondary">إدارة الصور والملفات المستخدمة في محتوى الموقع.</p></div>
        <a className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover" href="#media-upload"><Upload className="size-[18px]" />رفع ملفات</a>
      </header>

      {params.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={params.success} /> : null}
      {params.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={params.error} /> : null}

      <details className="group scroll-mt-20 rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]" id="media-upload" open={mediaItems.length === 0}>
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 marker:content-none"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary"><Upload className="size-[18px]" /></span><span><strong className="block text-sm font-semibold">رفع صورة جديدة</strong><span className="mt-0.5 block text-xs text-muted-foreground">JPEG أو PNG أو WebP، حتى {mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت</span></span></span><ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
        <form action={uploadMediaAction} className="grid gap-3 border-t border-border p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="grid gap-2"><span className="text-xs font-semibold">اختر الصورة</span><Input accept={mediaConfig.allowedMimeTypes.join(",")} className="min-h-11 border-border-strong bg-card text-sm focus-visible:ring-ring" name="file" required type="file" /></label>
          <Button className="min-h-11" type="submit"><Upload />رفع الصورة</Button>
        </form>
      </details>

      <section aria-label="أدوات مكتبة الوسائط" className="rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-rest)]">
        <form action="" className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_180px_180px_auto]">
          <label className="relative"><span className="sr-only">البحث في الوسائط</span><Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-10 border-border-strong bg-card ps-9 pe-3 text-sm focus-visible:border-primary focus-visible:ring-ring/25" defaultValue={query} name="q" placeholder="ابحث باسم الملف أو الوصف..." type="search" /></label>
          <label><span className="sr-only">نوع الوسائط</span><Select defaultValue={type ?? "ALL"} name="type"><SelectTrigger className="h-10 border-border-strong bg-card focus-visible:border-primary focus-visible:ring-ring/25"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="ALL">كل الأنواع</SelectItem><SelectItem value={MediaType.IMAGE}>صور</SelectItem><SelectItem value={MediaType.FILE}>ملفات</SelectItem></SelectContent></Select></label>
          <label><span className="sr-only">ترتيب الوسائط</span><Select defaultValue={sort} name="sort"><SelectTrigger className="h-10 border-border-strong bg-card focus-visible:border-primary focus-visible:ring-ring/25"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="latest">الأحدث</SelectItem><SelectItem value="oldest">الأقدم</SelectItem><SelectItem value="name">اسم الملف</SelectItem></SelectContent></Select></label>
          <div className="flex gap-2"><Button className="h-10 min-h-10" type="submit" variant="secondary"><SlidersHorizontal />تطبيق</Button>{query || type ? <Link aria-label="مسح عوامل التصفية" className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-dashboard-hover hover:text-foreground" href="/dashboard/media"><X className="size-4" /></Link> : null}</div>
        </form>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3"><p className="text-xs tabular-nums text-muted-foreground">{totalItems.toLocaleString("ar-SA")} وسيط</p><div aria-label="طريقة عرض الوسائط" className="flex rounded-md border border-border p-0.5"><ViewLink active={view === "grid"} href={mediaHref(params, "grid")} label="عرض شبكي"><Grid2X2 /></ViewLink><ViewLink active={view === "list"} href={mediaHref(params, "list")} label="عرض قائمة"><List /></ViewLink></div></div>
      </section>

      {mediaItems.length === 0 ? (
        <section className="grid min-h-72 place-items-center rounded-xl border border-border bg-card px-6 text-center shadow-[var(--shadow-rest)]"><div><span className="mx-auto grid size-12 place-items-center rounded-xl bg-secondary text-muted-foreground"><ImageIcon className="size-6" /></span><h2 className="mt-4 text-lg font-semibold">{query || type ? "لا توجد نتائج مطابقة" : "لا توجد وسائط بعد"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{query || type ? "غيّر عبارة البحث أو نوع الملف لعرض وسائط أخرى." : "ارفع أول صورة لتصبح متاحة في محررات المحتوى."}</p></div></section>
      ) : (
        <section aria-label="متصفح الوسائط" className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "grid gap-3"}>
          {mediaItems.map((item) => (
            <article className={view === "grid" ? "overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]" : "overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)] sm:grid sm:grid-cols-[180px_minmax(0,1fr)]"} key={item.id}>
              <div className={view === "grid" ? "relative aspect-square bg-secondary" : "relative aspect-square bg-secondary sm:aspect-auto sm:min-h-44"}>{item.type === MediaType.IMAGE ? <Image alt={item.altText ?? ""} className="object-contain p-2" fill sizes={view === "grid" ? "(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : "180px"} src={item.url} /> : <File className="absolute inset-0 m-auto size-10 text-muted-foreground" />}</div>
              <div className="min-w-0 p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-semibold" title={item.originalFilename}><bdi dir="ltr">{item.originalFilename}</bdi></h2><p className="mt-1 text-xs text-muted-foreground"><bdi dir="ltr">{item.mimeType}</bdi> · <span className="tabular-nums">{formatBytes(item.sizeBytes)}</span>{item.width && item.height ? <> · <bdi dir="ltr">{item.width} × {item.height}</bdi></> : null}</p><p className="mt-1.5 text-xs text-muted-foreground">{dateFormatter.format(item.createdAt)}</p></div><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-text-secondary">{item.type === MediaType.IMAGE ? "صورة" : "ملف"}</span></div>
                <details className="group mt-4 border-t border-border pt-2"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between rounded-md px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft marker:content-none">تحرير البيانات<ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary><div className="mt-2 grid gap-3 border-t border-border pt-3"><form action={updateMediaMetadataAction} className="grid gap-3"><input name="id" type="hidden" value={item.id} /><label className="grid gap-1.5"><span className="text-xs font-semibold">النص البديل</span><Input className="min-h-10 border-border-strong bg-card text-sm focus-visible:border-primary focus-visible:ring-ring/25" defaultValue={item.altText ?? ""} name="altText" placeholder="وصف عربي موجز" /></label><label className="grid gap-1.5"><span className="text-xs font-semibold">التعليق</span><Textarea className="min-h-20 resize-y border-border-strong bg-card text-sm focus-visible:border-primary focus-visible:ring-ring/25" defaultValue={item.caption ?? ""} name="caption" placeholder="تعليق اختياري" /></label><Button type="submit" variant="outline">حفظ البيانات</Button></form><form action={deleteMediaAction} className="border-t border-border pt-3"><input name="id" type="hidden" value={item.id} /><Button className="w-full" type="submit" variant="destructive">حذف إذا لم يكن مستخدماً</Button></form></div></details>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function ViewLink({ active, href, label, children }: { active: boolean; href: string; label: string; children: React.ReactNode }) {
  return <Link aria-label={label} aria-current={active ? "page" : undefined} className={`grid size-8 place-items-center rounded-[6px] [&_svg]:size-4 ${active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-dashboard-hover hover:text-foreground"}`} href={href}>{children}</Link>;
}

function mediaHref(params: { q?: string; type?: string; sort?: string }, view: string) {
  const next = new URLSearchParams();
  if (params.q) next.set("q", params.q);
  if (params.type && params.type !== "ALL") next.set("type", params.type);
  if (params.sort && params.sort !== "latest") next.set("sort", params.sort);
  if (view !== "grid") next.set("view", view);
  const search = next.toString();
  return search ? `/dashboard/media?${search}` : "/dashboard/media";
}

function formatBytes(bytes: number) {
  const formatter = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  return bytes < 1024 * 1024 ? `${formatter.format(bytes / 1024)} كيلوبايت` : `${formatter.format(bytes / 1024 / 1024)} ميجابايت`;
}
