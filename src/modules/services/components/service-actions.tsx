import { CmsContentActions } from "@/modules/cms/components/content-actions";
import { cmsContentPath } from "@/modules/cms/slugs";

import { deleteServiceAction } from "../actions";

export function ServiceActions({ id, published, slug }: { id: string; published: boolean; slug?: string | null }) {
  return <CmsContentActions deleteAction={deleteServiceAction} editHref={`/dashboard/services/${id}`} entityLabel="الخدمة" id={id} idName="serviceId" publicHref={published && slug ? cmsContentPath("/services", slug) : undefined} />;
}
