import { CmsRouteToast } from "@/modules/cms/components/route-toast";

export function ServiceRouteToast({ success, error, cleanHref }: { success?: string; error?: string; cleanHref: string }) {
  return <CmsRouteToast cleanHref={cleanHref} error={error} success={success} />;
}
