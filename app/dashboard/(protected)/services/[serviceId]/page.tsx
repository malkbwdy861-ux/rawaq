import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { ServiceForm } from "@/modules/services/components/service-form";
import { getServiceEditorData } from "@/modules/services/queries";

type ServiceEditorPageProps = {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function ServiceEditorPage({ params, searchParams }: ServiceEditorPageProps) {
  const [{ serviceId }, messages] = await Promise.all([params, searchParams]);
  const { service, media, relationOptions } = await getServiceEditorData(serviceId);

  return (
    <div className="space-y-8">
      <CmsPageHeader title="تحرير خدمة" description="عدّل المسودة، عاينها، ثم انشرها عند جاهزيتها." />
      {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
      {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}
      <ServiceForm service={service} media={media} relationOptions={relationOptions} />
    </div>
  );
}
