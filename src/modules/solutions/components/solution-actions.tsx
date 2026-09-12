import { CmsContentActions } from "@/modules/cms/components/content-actions";
import { cmsContentPath } from "@/modules/cms/slugs";

import { deleteSolutionAction } from "../actions";

export function SolutionActions({ id, published, slug }: { id: string; published: boolean; slug?: string | null }) {
  return <CmsContentActions deleteAction={deleteSolutionAction} editHref={`/dashboard/solutions/${id}`} entityLabel="الحل" id={id} idName="solutionId" publicHref={published && slug ? cmsContentPath("/solutions", slug) : undefined} />;
}
