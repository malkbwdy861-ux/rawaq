import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { ServiceForm } from "@/modules/services/components/service-form";
import { getNewServiceEditorData } from "@/modules/services/queries";

type NewServicePageProps = { searchParams: Promise<{ error?: string }> };

export default async function NewServicePage({ searchParams }: NewServicePageProps) {
  const [messages, { media, relationOptions }] = await Promise.all([searchParams, getNewServiceEditorData()]);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {messages.error ? <div className="mb-4"><CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /></div> : null}
      <ServiceForm media={media} relationOptions={relationOptions} />
    </div>
  );
}
