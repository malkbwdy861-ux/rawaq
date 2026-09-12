import { ExternalLink, FilePlus2, ImageIcon, MoreHorizontal, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cmsContentPath } from "@/modules/cms/slugs";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { getCmsStatusLabel } from "@/modules/cms/components/status-badge";
import { createServiceAction } from "@/modules/services/actions";
import { CreateServiceButton } from "@/modules/services/components/create-service-button";
import { ServicesPagination } from "@/modules/services/components/services-pagination";
import { ServicesToolbar } from "@/modules/services/components/services-toolbar";
import { getServiceList } from "@/modules/services/queries";

type ServicesPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, services, statusCounts } = await getServiceList(rawParams);

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-[1.75rem] font-bold leading-10">الخدمات</h1><p className="mt-1 text-sm leading-6 text-text-secondary">إدارة الخدمات المعروضة في الموقع وحالة نشرها.</p></div>
        <form action={createServiceAction}><CreateServiceButton /></form>
      </header>

      {typeof rawParams.success === "string" ? <CmsStateBlock tone="success" title="اكتملت العملية" description={rawParams.success} /> : null}
      {typeof rawParams.error === "string" ? <CmsStateBlock tone="error" title="تعذرت العملية" description={rawParams.error} /> : null}

      <section aria-label="مجموعة الخدمات" className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
        <ServicesToolbar query={params.q} status={params.status} statusCounts={statusCounts} totalItems={pagination.totalItems} />
        {services.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div><span className="mx-auto grid size-10 place-items-center rounded-[6px] bg-secondary text-muted-foreground"><FilePlus2 className="size-5" /></span><h2 className="mt-4 text-lg font-semibold">{params.q || params.status !== "ALL" ? "لا توجد نتائج مطابقة" : "لا توجد خدمات بعد"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{params.q || params.status !== "ALL" ? "غيّر عبارة البحث أو الحالة لعرض خدمات أخرى." : "أنشئ أول مسودة خدمة، ثم أضف محتواها وانشرها عندما تصبح جاهزة."}</p>{params.q || params.status !== "ALL" ? <Link className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-primary underline underline-offset-4" href="/dashboard/services">مسح عوامل التصفية</Link> : <form action={createServiceAction} className="mt-5"><CreateServiceButton compact /></form>}</div>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-fixed text-start text-sm">
                <thead className="bg-dashboard-canvas/65 text-xs font-medium text-muted-foreground"><tr className="h-11"><th className="w-auto px-4 text-start font-medium">الخدمة</th><th className="w-52 px-4 text-start font-medium">الحالة</th><th className="w-40 px-4 text-start font-medium">آخر تحديث</th><th className="w-16 px-3"><span className="sr-only">الإجراءات</span></th></tr></thead>
                <tbody>{services.map((service) => { const version = service.draftVersion ?? service.publishedVersion; return <tr className="h-16 border-t border-border/80 transition-colors hover:bg-dashboard-hover/55" key={service.id}><td className="px-4"><Link className="flex min-w-0 items-center gap-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/dashboard/services/${service.id}`}>{version?.heroMedia ? <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary"><Image alt="" className="object-cover" fill sizes="40px" src={version.heroMedia.url} /></span> : <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground"><ImageIcon className="size-4" /></span>}<span className="min-w-0"><span className="block truncate font-semibold text-foreground">{version?.title ?? "خدمة بدون عنوان"}</span>{version?.slug ? <bdi className="mt-0.5 block truncate text-xs font-normal text-muted-foreground" dir="ltr">/{version.slug}</bdi> : <span className="mt-0.5 block text-xs text-muted-foreground">لم يحدد الرابط بعد</span>}</span></Link></td><td className="px-4"><ServiceStatus service={service} /></td><td className="px-4 text-xs text-text-secondary"><time dateTime={service.updatedAt.toISOString()}>{service.updatedAt.toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: service.updatedAt.getFullYear() === new Date().getFullYear() ? undefined : "numeric" })}</time></td><td className="px-3"><ServiceActions service={service} slug={version?.slug} /></td></tr>; })}</tbody>
              </table>
            </div>
            <div className="divide-y divide-border md:hidden">{services.map((service) => { const version = service.draftVersion ?? service.publishedVersion; return <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4" key={service.id}><div className="min-w-0"><Link className="font-semibold" href={`/dashboard/services/${service.id}`}>{version?.title ?? "خدمة بدون عنوان"}</Link>{version?.slug ? <bdi className="mt-1 block truncate text-xs text-muted-foreground" dir="ltr">{version.slug}</bdi> : null}<div className="mt-3 flex flex-wrap items-center gap-3"><ServiceStatus service={service} /><time className="text-xs text-muted-foreground" dateTime={service.updatedAt.toISOString()}>{service.updatedAt.toLocaleDateString("ar-SA")}</time></div></div><ServiceActions service={service} slug={version?.slug} /></article>; })}</div>
          </>
        )}
        <ServicesPagination pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} query={{ q: params.q, status: params.status, pageSize: params.pageSize }} />
      </section>
    </div>
  );
}

type ServiceRecord = { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; draftVersionId: string | null; publishedVersionId: string | null };

function ServiceStatus({ service }: { service: ServiceRecord }) {
  const hasChanges = service.status === "PUBLISHED" && Boolean(service.draftVersionId && service.publishedVersionId);
  const tone = hasChanges ? "bg-warning-soft text-warning" : service.status === "PUBLISHED" ? "bg-success-soft text-success" : service.status === "ARCHIVED" ? "bg-danger-soft text-destructive" : "bg-secondary text-text-secondary";
  return <span className={`inline-flex min-h-7 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${tone}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{getCmsStatusLabel({ status: service.status, hasDraftVersion: Boolean(service.draftVersionId), hasPublishedVersion: Boolean(service.publishedVersionId) })}</span>;
}

function ServiceActions({ service, slug }: { service: ServiceRecord; slug?: string | null }) {
  return <details className="group relative"><summary aria-label="إجراءات الخدمة" className="grid size-9 cursor-pointer list-none place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground marker:content-none"><MoreHorizontal className="size-[18px]" /></summary><div className="absolute end-0 top-[calc(100%+4px)] z-20 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-[var(--shadow-float)]"><Link className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-dashboard-hover" href={`/dashboard/services/${service.id}`}><Pencil className="size-4" />تحرير الخدمة</Link>{service.status === "PUBLISHED" && slug ? <Link className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-dashboard-hover" href={cmsContentPath("/services", slug)} target="_blank"><ExternalLink className="size-4" />فتح في الموقع</Link> : null}</div></details>;
}
