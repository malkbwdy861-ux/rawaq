import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsListToolbar } from "@/modules/cms/components/list-toolbar";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { CmsEmptyState, CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";
import { createServiceAction } from "@/modules/services/actions";
import { getServiceList } from "@/modules/services/queries";

type ServicesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, services } = await getServiceList(rawParams);

  return (
    <div className="space-y-8">
      <CmsPageHeader
        title="الخدمات"
        description="أنشئ خدمات ديناميكية وانشرها إلى صفحات /services دون تغيير الكود."
        action={
          <form action={createServiceAction}>
            <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" type="submit">
              خدمة جديدة
            </Button>
          </form>
        }
      />

      {typeof rawParams.success === "string" ? <CmsStateBlock tone="success" title="اكتملت العملية" description={rawParams.success} /> : null}
      {typeof rawParams.error === "string" ? <CmsStateBlock tone="error" title="تعذرت العملية" description={rawParams.error} /> : null}

      <CmsListToolbar query={params.q} status={params.status} searchPlaceholder="ابحث بعنوان الخدمة أو رابطها" />

      {services.length === 0 ? (
        <CmsEmptyState title="لا توجد خدمات" description="ابدأ بإنشاء مسودة خدمة ثم انشرها لتظهر في صفحات الخدمات العامة." />
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)]">
          {services.map((service) => {
            const version = service.draftVersion ?? service.publishedVersion;
            return (
              <article className="grid gap-3 border-b border-[oklch(82%_0.012_145)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center" key={service.id}>
                <div className="grid gap-1">
                  <h2 className="text-lg font-semibold leading-[1.55]">{version?.title ?? "خدمة بدون عنوان"}</h2>
                  <p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">{version?.shortDescription ?? "لا يوجد وصف مختصر بعد."}</p>
                  {version?.slug ? <p className="text-xs font-medium text-[oklch(50%_0.014_150)]" dir="ltr">/services/{version.slug}</p> : null}
                </div>
                <CmsStatusBadge status={{ status: service.status, hasDraftVersion: Boolean(service.draftVersionId), hasPublishedVersion: Boolean(service.publishedVersionId) }} />
                <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/dashboard/services/${service.id}`}>
                  تحرير
                </Link>
              </article>
            );
          })}
        </div>
      )}

      <CmsPaginationControls pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} basePath="/dashboard/services" query={{ q: params.q, status: params.status, pageSize: params.pageSize }} />
    </div>
  );
}
