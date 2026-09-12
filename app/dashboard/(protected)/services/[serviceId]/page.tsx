import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { ServiceForm } from "@/modules/services/components/service-form";
import { getServiceEditorData } from "@/modules/services/queries";

type ServiceEditorPageProps = { params: Promise<{ serviceId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function ServiceEditorPage({ params, searchParams }: ServiceEditorPageProps) {
  const [{ serviceId }, messages] = await Promise.all([params, searchParams]);
  const { service, media, relationOptions } = await getServiceEditorData(serviceId);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {messages.success ? <div className="mb-4"><CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /></div> : null}
      {messages.error ? <div className="mb-4"><CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /></div> : null}
      <ServiceForm service={service} media={media} relationOptions={relationOptions} />
    </div>
  );
}
