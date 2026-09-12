import { CmsContentActions } from "@/modules/cms/components/content-actions";
import { cmsContentPath } from "@/modules/cms/slugs";

import { deleteMaterialAction } from "../actions";

export function MaterialActions({ id, published, slug }: { id: string; published: boolean; slug?: string | null }) {
  return <CmsContentActions deleteAction={deleteMaterialAction} editHref={`/dashboard/materials/${id}`} entityLabel="المادة" id={id} idName="materialId" publicHref={published && slug ? cmsContentPath("/materials", slug) : undefined} />;
}
