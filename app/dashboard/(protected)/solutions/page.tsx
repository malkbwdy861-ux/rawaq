import { FilePlus2, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ServiceRouteToast } from "@/modules/services/components/service-route-toast";
import { ServicesPagination } from "@/modules/services/components/services-pagination";
import { ServicesToolbar } from "@/modules/services/components/services-toolbar";
import { CreateSolutionButton } from "@/modules/solutions/components/create-solution-button";
import { SolutionActions } from "@/modules/solutions/components/solution-actions";
import { getSolutionList } from "@/modules/solutions/queries";

type SolutionsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SolutionsPage({ searchParams }: SolutionsPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, solutions, statusCounts } = await getSolutionList(rawParams);

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-[1.75rem] font-bold leading-10">الحلول</h1><p className="mt-1 text-sm leading-6 text-text-secondary">إدارة الحلول المعروضة في الموقع وحالة نشرها.</p></div>
        <CreateSolutionButton />
      </header>

      <ServiceRouteToast cleanHref="/dashboard/solutions" error={typeof rawParams.error === "string" ? rawParams.error : undefined} success={typeof rawParams.success === "string" ? rawParams.success : undefined} />

      <section aria-label="مجموعة الحلول" className="rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
        <ServicesToolbar allLabel="كل الحلول" basePath="/dashboard/solutions" itemLabel="حل" key={`${params.q ?? ""}-${params.status}`} pageSize={10} query={params.q} searchLabel="الحلول" status={params.status} statusCounts={statusCounts} totalItems={pagination.totalItems} />
        {solutions.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div><span className="mx-auto grid size-10 place-items-center rounded-[6px] bg-secondary text-muted-foreground"><FilePlus2 className="size-5" /></span><h2 className="mt-4 text-lg font-semibold">{params.q || params.status !== "ALL" ? "لا توجد نتائج مطابقة" : "لا توجد حلول بعد"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{params.q || params.status !== "ALL" ? "غيّر عبارة البحث أو الحالة لعرض حلول أخرى." : "أنشئ أول حل، ثم احفظه كمسودة أو انشره عندما يصبح جاهزاً."}</p>{params.q || params.status !== "ALL" ? <Link className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-primary underline underline-offset-4" href="/dashboard/solutions">عرض كل الحلول</Link> : <div className="mt-5"><CreateSolutionButton compact /></div>}</div>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-fixed text-start text-sm">
                <thead className="bg-dashboard-canvas/65 text-xs font-medium text-muted-foreground"><tr className="h-11"><th className="w-auto px-4 text-start font-medium">الحل</th><th className="w-52 px-4 text-start font-medium">الحالة</th><th className="w-40 px-4 text-start font-medium">آخر تحديث</th><th className="w-16 px-3"><span className="sr-only">الإجراءات</span></th></tr></thead>
                <tbody>{solutions.map((solution) => { const version = solution.draftVersion ?? solution.publishedVersion; return <tr className={`h-16 border-t border-border/80 transition-colors hover:bg-dashboard-hover/55 ${solution.status === "ARCHIVED" ? "opacity-60" : ""}`} key={solution.id}><td className="px-4"><Link className="flex min-w-0 items-center gap-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/dashboard/solutions/${solution.id}`}>{version?.heroMedia ? <span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary"><Image alt="" className="object-cover" fill sizes="40px" src={version.heroMedia.url} /></span> : <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-secondary/70 text-muted-foreground"><ImageIcon className="size-4" /></span>}<span className="min-w-0"><span className="block truncate font-semibold text-foreground">{version?.title ?? "حل بدون عنوان"}</span>{version?.slug ? <bdi className="mt-0.5 block truncate text-xs font-normal text-muted-foreground" dir="ltr">/{version.slug}</bdi> : <span className="mt-0.5 block text-xs text-muted-foreground">لم يحدد الرابط بعد</span>}</span></Link></td><td className="px-4"><SolutionStatus status={solution.status} /></td><td className="px-4 text-xs text-text-secondary"><time dateTime={solution.updatedAt.toISOString()}>{solution.updatedAt.toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: solution.updatedAt.getFullYear() === new Date().getFullYear() ? undefined : "numeric" })}</time></td><td className="px-3"><SolutionActions id={solution.id} published={solution.status === "PUBLISHED"} slug={version?.slug} /></td></tr>; })}</tbody>
              </table>
            </div>
            <div className="divide-y divide-border md:hidden">{solutions.map((solution) => { const version = solution.draftVersion ?? solution.publishedVersion; return <article className={`grid grid-cols-[48px_minmax(0,1fr)_auto] gap-3 px-4 py-4 ${solution.status === "ARCHIVED" ? "opacity-60" : ""}`} key={solution.id}>{version?.heroMedia ? <Link className="relative size-12 overflow-hidden rounded-md border border-border bg-secondary" href={`/dashboard/solutions/${solution.id}`}><Image alt="" className="object-cover" fill sizes="48px" src={version.heroMedia.url} /></Link> : <span className="grid size-12 place-items-center rounded-md border border-border bg-secondary/70 text-muted-foreground"><ImageIcon className="size-4" /></span>}<div className="min-w-0 text-start"><Link className="block truncate font-semibold" href={`/dashboard/solutions/${solution.id}`}>{version?.title ?? "حل بدون عنوان"}</Link>{version?.shortDescription ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{version.shortDescription}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-3"><SolutionStatus status={solution.status} /><time className="text-xs text-muted-foreground" dateTime={solution.updatedAt.toISOString()}>{solution.updatedAt.toLocaleDateString("ar-SA")}</time></div></div><SolutionActions id={solution.id} published={solution.status === "PUBLISHED"} slug={version?.slug} /></article>; })}</div>
          </>
        )}
        <ServicesPagination basePath="/dashboard/solutions" pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} query={{ q: params.q, status: params.status, pageSize: params.pageSize }} />
      </section>
    </div>
  );
}

function SolutionStatus({ status }: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
  const label = status === "PUBLISHED" ? "منشور" : status === "ARCHIVED" ? "مؤرشف" : "مسودة";
  const tone = status === "PUBLISHED" ? "bg-primary text-primary-foreground" : status === "ARCHIVED" ? "bg-muted text-muted-foreground" : "bg-secondary text-text-secondary";
  return <span className={`inline-flex min-h-6 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${tone}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{label}</span>;
}
