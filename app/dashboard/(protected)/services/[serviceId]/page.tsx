import { ServiceForm } from "@/modules/services/components/service-form";
import { ServiceRouteToast } from "@/modules/services/components/service-route-toast";
import { getServiceEditorData } from "@/modules/services/queries";

type ServiceEditorPageProps = { params: Promise<{ serviceId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function ServiceEditorPage({ params, searchParams }: ServiceEditorPageProps) {
  const [{ serviceId }, messages] = await Promise.all([params, searchParams]);
  const { service, media, relationOptions } = await getServiceEditorData(serviceId);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <ServiceRouteToast cleanHref={`/dashboard/services/${serviceId}`} error={messages.error} success={messages.success} />
      <ServiceForm service={service} media={media} relationOptions={relationOptions} />
    </div>
  );
}
