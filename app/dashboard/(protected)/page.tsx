import {
  AlertTriangle,
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  FilePlus2,
  FolderKanban,
  ImageIcon,
  Layers3,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createArticleAction } from "@/modules/articles/actions";
import { getCmsStatusLabel } from "@/modules/cms/components/status-badge";
import { createProjectAction } from "@/modules/projects/actions";
import { createServiceAction } from "@/modules/services/actions";
import { prisma } from "@/server/db/prisma";

const metricStyles = {
  green: "bg-primary-soft text-primary",
  blue: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
  amber: "bg-warning-soft text-warning",
} as const;

export default async function DashboardPage() {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [
    publishedServices,
    publishedProjects,
    publishedArticles,
    mediaCount,
    serviceDrafts,
    projectDrafts,
    articleDrafts,
    recentServices,
    recentProjects,
    recentArticles,
    servicesWithoutImage,
    servicesWithoutSeo,
    staleServices,
    staleProjects,
    staleArticles,
  ] = await Promise.all([
    prisma.service.count({ where: { status: "PUBLISHED" } }),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.media.count(),
    prisma.service.count({ where: { status: "DRAFT" } }),
    prisma.project.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.service.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.project.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.article.findMany({ include: { draftVersion: true, publishedVersion: true }, orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.service.count({ where: { status: "PUBLISHED", publishedVersion: { heroMediaId: null } } }),
    prisma.service.count({ where: { status: "PUBLISHED", publishedVersion: { seoDescription: null } } }),
    prisma.service.count({ where: { status: "DRAFT", updatedAt: { lt: staleBefore } } }),
    prisma.project.count({ where: { status: "DRAFT", updatedAt: { lt: staleBefore } } }),
    prisma.article.count({ where: { status: "DRAFT", updatedAt: { lt: staleBefore } } }),
  ]);

  const draftCount = serviceDrafts + projectDrafts + articleDrafts;
  const metrics = [
    { label: "الخدمات المنشورة", value: publishedServices, detail: `${serviceDrafts.toLocaleString("ar-SA")} مسودة`, icon: Layers3, tone: "green" },
    { label: "المشاريع المنشورة", value: publishedProjects, detail: `${projectDrafts.toLocaleString("ar-SA")} مسودة`, icon: FolderKanban, tone: "blue" },
    { label: "المقالات المنشورة", value: publishedArticles, detail: `${articleDrafts.toLocaleString("ar-SA")} مسودة`, icon: BookOpenText, tone: "violet" },
    { label: "مكتبة الوسائط", value: mediaCount, detail: `${draftCount.toLocaleString("ar-SA")} مسودة محتوى`, icon: ImageIcon, tone: "amber" },
  ] as const;

  const recent = [
    ...recentServices.map((item) => ({ id: item.id, title: item.draftVersion?.title ?? item.publishedVersion?.title ?? "خدمة بدون عنوان", type: "خدمة", href: `/dashboard/services/${item.id}`, status: item.status, hasDraft: Boolean(item.draftVersionId), hasPublished: Boolean(item.publishedVersionId), updatedAt: item.updatedAt })),
    ...recentProjects.map((item) => ({ id: item.id, title: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مشروع بدون عنوان", type: "مشروع", href: `/dashboard/projects/${item.id}`, status: item.status, hasDraft: Boolean(item.draftVersionId), hasPublished: Boolean(item.publishedVersionId), updatedAt: item.updatedAt })),
    ...recentArticles.map((item) => ({ id: item.id, title: item.draftVersion?.title ?? item.publishedVersion?.title ?? "مقال بدون عنوان", type: "مقال", href: `/dashboard/articles/${item.id}`, status: item.status, hasDraft: Boolean(item.draftVersionId), hasPublished: Boolean(item.publishedVersionId), updatedAt: item.updatedAt })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 6);

  const staleDrafts = staleServices + staleProjects + staleArticles;
  const attention = [
    servicesWithoutImage ? { label: `${servicesWithoutImage.toLocaleString("ar-SA")} خدمات منشورة بدون صورة رئيسية`, href: "/dashboard/services?status=PUBLISHED" } : null,
    staleDrafts ? { label: `${staleDrafts.toLocaleString("ar-SA")} مسودات لم تُحدّث منذ أكثر من ٧ أيام`, href: "/dashboard/services?status=DRAFT" } : null,
    servicesWithoutSeo ? { label: `${servicesWithoutSeo.toLocaleString("ar-SA")} خدمات منشورة بدون وصف SEO`, href: "/dashboard/services?status=PUBLISHED" } : null,
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">نظرة عامة</p>
          <h1 className="text-[1.75rem] font-bold leading-[1.45]">مرحباً بك مجدداً</h1>
          <p className="mt-1 max-w-[55ch] text-sm leading-6 text-text-secondary">إليك نظرة سريعة على محتوى الموقع وحالة النشر.</p>
        </div>
        <time className="text-xs font-medium text-muted-foreground" dateTime={now.toISOString()}>{new Intl.DateTimeFormat("ar-SA", { dateStyle: "full" }).format(now)}</time>
      </header>

      <section aria-label="ملخص المحتوى" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <article className="flex min-h-28 items-start justify-between rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-rest)]" key={label}>
            <div><p className="text-sm font-medium text-text-secondary">{label}</p><p className="mt-2 text-[2rem] font-bold leading-none tabular-nums">{value.toLocaleString("ar-SA")}</p><p className="mt-3 text-xs text-muted-foreground">{detail}</p></div>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", metricStyles[tone])}><Icon aria-hidden="true" className="size-5" /></span>
          </article>
        ))}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-lg font-semibold">آخر التحديثات</h2><p className="mt-0.5 text-xs text-muted-foreground">أحدث المحتوى الذي جرى العمل عليه</p></div></div>
          {recent.length ? <div className="divide-y divide-border">{recent.map((item) => <Link className="group flex min-h-16 items-center gap-3 px-5 py-3 transition-colors hover:bg-dashboard-hover/60" href={item.href} key={`${item.type}-${item.id}`}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-text-secondary"><FilePlus2 className="size-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold">{item.title}</strong><span className="mt-0.5 block text-xs text-muted-foreground">{item.type} · <time dateTime={item.updatedAt.toISOString()}>{formatRelativeDate(item.updatedAt, now)}</time></span></span><span className="hidden rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-text-secondary sm:inline-flex">{getCmsStatusLabel({ status: item.status, hasDraftVersion: item.hasDraft, hasPublishedVersion: item.hasPublished })}</span><ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5 group-hover:text-primary" /></Link>)}</div> : <div className="grid min-h-56 place-items-center px-6 text-center"><div><Layers3 className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">لا توجد تحديثات بعد</p><p className="mt-1 text-xs text-muted-foreground">ابدأ بإنشاء أول مسودة محتوى.</p></div></div>}
        </section>

        <div className="grid gap-5">
          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-rest)]">
            <div className="flex items-center gap-2"><AlertTriangle className="size-5 text-warning" /><h2 className="text-lg font-semibold">تحتاج انتباهك</h2></div>
            {attention.length ? <div className="mt-4 divide-y divide-border">{attention.map((item) => <Link className="flex items-start justify-between gap-3 py-3 text-sm leading-6 first:pt-0 last:pb-0 hover:text-primary" href={item.href} key={item.label}><span>{item.label}</span><ArrowLeft className="mt-1 size-4 shrink-0 text-muted-foreground" /></Link>)}</div> : <div className="mt-4 flex items-center gap-3 rounded-lg bg-success-soft p-3 text-success"><CheckCircle2 className="size-5 shrink-0" /><p className="text-sm font-medium">كل شيء يبدو جيداً</p></div>}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-rest)]">
            <h2 className="text-lg font-semibold">إجراءات سريعة</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <QuickCreate action={createServiceAction} label="خدمة جديدة" />
              <QuickCreate action={createProjectAction} label="مشروع جديد" />
              <QuickCreate action={createArticleAction} label="مقال جديد" />
              <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border-strong bg-card px-3 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary-soft" href="/dashboard/media#media-upload"><ImageIcon className="size-4" />رفع وسائط</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuickCreate({ action, label }: { action: () => Promise<void>; label: string }) {
  return <form action={action}><Button className="w-full" type="submit" variant="outline"><Plus className="size-4" />{label}</Button></form>;
}

function formatRelativeDate(date: Date, now: Date) {
  const difference = now.getTime() - date.getTime();
  const hours = Math.floor(difference / (60 * 60 * 1000));
  if (hours < 1) return "منذ أقل من ساعة";
  if (hours < 24) return `منذ ${hours.toLocaleString("ar-SA")} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days.toLocaleString("ar-SA")} يوم`;
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(date);
}
