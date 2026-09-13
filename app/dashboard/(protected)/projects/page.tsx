import { FilePlus2, ImageIcon, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cmsContentPath } from "@/modules/cms/slugs";
import { CmsContentActions } from "@/modules/cms/components/content-actions";
import { deleteProjectAction } from "@/modules/projects/actions";
import { getProjectList } from "@/modules/projects/queries";
import { ServiceRouteToast } from "@/modules/services/components/service-route-toast";
import { ServicesPagination } from "@/modules/services/components/services-pagination";
import { ServicesToolbar } from "@/modules/services/components/services-toolbar";

type ProjectsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, projects, statusCounts } = await getProjectList(rawParams);

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-[1.75rem] font-bold leading-10">المشاريع</h1><p className="mt-1 text-sm leading-6 text-text-secondary">إدارة دراسات الحالة ومعلومات الموقع ومعارض الصور.</p></div>
        <CreateProjectButton />
      </header>

      <ServiceRouteToast cleanHref="/dashboard/projects" error={typeof rawParams.error === "string" ? rawParams.error : undefined} success={typeof rawParams.success === "string" ? rawParams.success : undefined} />

      <section aria-label="مجموعة المشاريع" className="rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
        <ServicesToolbar allLabel="كل المشاريع" basePath="/dashboard/projects" itemLabel="مشروع" key={`${params.q ?? ""}-${params.status}`} pageSize={10} query={params.q} searchLabel="المشاريع" status={params.status} statusCounts={statusCounts} totalItems={pagination.totalItems} />
        {projects.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div><span className="mx-auto grid size-10 place-items-center rounded-[6px] bg-secondary text-muted-foreground"><FilePlus2 className="size-5" /></span><h2 className="mt-4 text-lg font-semibold">{params.q || params.status !== "ALL" ? "لا توجد نتائج مطابقة" : "لا توجد مشاريع بعد"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{params.q || params.status !== "ALL" ? "غيّر عبارة البحث أو الحالة لعرض مشاريع أخرى." : "أنشئ أول مشروع، ثم احفظه كمسودة أو انشره عندما يصبح جاهزاً."}</p>{params.q || params.status !== "ALL" ? <Link className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-primary underline underline-offset-4" href="/dashboard/projects">عرض كل المشاريع</Link> : <div className="mt-5"><CreateProjectButton compact /></div>}</div>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-fixed text-start text-sm">
                <thead className="bg-dashboard-canvas/65 text-xs font-medium text-muted-foreground"><tr className="h-11"><th className="w-auto px-4 text-start font-medium">المشروع</th><th className="w-52 px-4 text-start font-medium">الحالة</th><th className="w-40 px-4 text-start font-medium">آخر تحديث</th><th className="w-16 px-3"><span className="sr-only">الإجراءات</span></th></tr></thead>
                 <tbody>{projects.map((project) => { const version = project.draftVersion ?? project.publishedVersion; return <tr className={`h-16 border-t border-border/80 transition-colors hover:bg-dashboard-hover/55 ${project.status === "ARCHIVED" ? "opacity-60" : ""}`} key={project.id}><td className="px-4"><Link className="flex min-w-0 items-center gap-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/dashboard/projects/${project.id}`}>{version?.coverMedia ? <span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary"><Image alt="" className="object-cover" fill sizes="40px" src={version.coverMedia.url} /></span> : <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-secondary/70 text-muted-foreground"><ImageIcon className="size-4" /></span>}<span className="min-w-0"><span className="block truncate font-semibold text-foreground">{version?.title ?? "مشروع بدون عنوان"}</span>{version?.category?.name ? <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">{version.category.name}</span> : version?.slug ? <bdi className="mt-0.5 block truncate text-xs font-normal text-muted-foreground" dir="ltr">/{version.slug}</bdi> : <span className="mt-0.5 block text-xs text-muted-foreground">لم يحدد التصنيف بعد</span>}</span></Link></td><td className="px-4"><ProjectStatus status={project.status} /></td><td className="px-4 text-xs text-text-secondary"><time dateTime={project.updatedAt.toISOString()}>{project.updatedAt.toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: project.updatedAt.getFullYear() === new Date().getFullYear() ? undefined : "numeric" })}</time></td><td className="px-3"><ProjectActions id={project.id} published={project.status === "PUBLISHED"} slug={version?.slug} /></td></tr>; })}</tbody>
              </table>
            </div>
            <div className="divide-y divide-border md:hidden">{projects.map((project) => { const version = project.draftVersion ?? project.publishedVersion; const description = [version?.city, version?.district].filter(Boolean).join("، ") || version?.shortDescription; return <article className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4 ${project.status === "ARCHIVED" ? "opacity-60" : ""}`} key={project.id}><div className="min-w-0 text-start"><Link className="block truncate font-semibold" href={`/dashboard/projects/${project.id}`}>{version?.title ?? "مشروع بدون عنوان"}</Link>{description ? <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">{description}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-3"><ProjectStatus status={project.status} /><time className="text-xs text-muted-foreground" dateTime={project.updatedAt.toISOString()}>{project.updatedAt.toLocaleDateString("ar-SA")}</time></div></div><ProjectActions id={project.id} published={project.status === "PUBLISHED"} slug={version?.slug} /></article>; })}</div>
          </>
        )}
        <ServicesPagination basePath="/dashboard/projects" pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} query={{ q: params.q, status: params.status, pageSize: params.pageSize }} />
      </section>
    </div>
  );
}

function CreateProjectButton({ compact = false }: { compact?: boolean }) {
  return <Link className={cn(buttonVariants(), compact && "min-h-9")} href="/dashboard/projects/new"><Plus />مشروع جديد</Link>;
}

function ProjectActions({ id, published, slug }: { id: string; published: boolean; slug?: string | null }) {
  return <CmsContentActions deleteAction={deleteProjectAction} editHref={`/dashboard/projects/${id}`} entityLabel="المشروع" id={id} idName="projectId" publicHref={published && slug ? cmsContentPath("/projects", slug) : undefined} />;
}

function ProjectStatus({ status }: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
  const label = status === "PUBLISHED" ? "منشور" : status === "ARCHIVED" ? "مؤرشف" : "مسودة";
  const tone = status === "PUBLISHED" ? "bg-primary text-primary-foreground" : status === "ARCHIVED" ? "bg-muted text-muted-foreground" : "bg-secondary text-text-secondary";
  return <span className={`inline-flex min-h-6 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${tone}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{label}</span>;
}
