import { ServiceForm } from "@/modules/services/components/service-form";
import { getNewServiceEditorData } from "@/modules/services/queries";

export default async function NewServicePage() {
  const { media, relationOptions } = await getNewServiceEditorData();

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <ServiceForm media={media} relationOptions={relationOptions} />
    </div>
  );
}
