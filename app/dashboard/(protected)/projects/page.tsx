import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsListToolbar } from "@/modules/cms/components/list-toolbar";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { CmsEmptyState, CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import { createProjectAction } from "@/modules/projects/actions";
import { getProjectList } from "@/modules/projects/queries";

type ProjectsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, projects } = await getProjectList(rawParams);
  return (
    <div className="space-y-8">
      <CmsPageHeader title="المشاريع" description="أدر دراسات حالة حقيقية مع الموقع والمعرض والعلاقات، ثم انشرها إلى /projects." action={<form action={createProjectAction}><Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" type="submit">مشروع جديد</Button></form>} />
      {typeof rawParams.success === "string" ? <CmsStateBlock tone="success" title="اكتملت العملية" description={rawParams.success} /> : null}
      {typeof rawParams.error === "string" ? <CmsStateBlock tone="error" title="تعذرت العملية" description={rawParams.error} /> : null}
      <CmsListToolbar query={params.q} status={params.status} searchPlaceholder="ابحث بالعنوان أو الرابط أو المدينة" />
      {projects.length === 0 ? <CmsEmptyState title="لا توجد مشاريع" description="أنشئ مسودة عند توفر معلومات مشروع حقيقي، ثم أضف الأدلة المرئية والعلاقات وانشرها." /> : (
        <div className="overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)]">
          {projects.map((project) => {
            const version = project.draftVersion ?? project.publishedVersion;
            return <article className="grid gap-3 border-b border-[oklch(82%_0.012_145)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center" key={project.id}>
              <div className="grid gap-1"><h2 className="text-lg font-semibold leading-[1.55]">{version?.title ?? "مشروع بدون عنوان"}</h2><p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">{[version?.city, version?.district].filter(Boolean).join("، ") || version?.shortDescription || "لا توجد معلومات موقع أو وصف بعد."}</p>{version?.slug ? <p className="text-xs font-medium text-[oklch(50%_0.014_150)]" dir="ltr">/projects/{version.slug}</p> : null}</div>
              <CmsStatusBadge status={{ status: project.status, hasDraftVersion: Boolean(project.draftVersionId), hasPublishedVersion: Boolean(project.publishedVersionId) }} />
              <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/dashboard/projects/${project.id}`}>تحرير</Link>
            </article>;
          })}
        </div>
      )}
      <CmsPaginationControls pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} basePath="/dashboard/projects" query={{ q: params.q, status: params.status, pageSize: params.pageSize }} />
    </div>
  );
}
