import { MaterialForm } from "@/modules/materials/components/material-form";
import { getMaterialEditorData } from "@/modules/materials/queries";
import { ServiceRouteToast } from "@/modules/services/components/service-route-toast";

type MaterialEditorPageProps = { params: Promise<{ materialId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function MaterialEditorPage({ params, searchParams }: MaterialEditorPageProps) {
  const [{ materialId }, messages] = await Promise.all([params, searchParams]);
  const { material, media, relationOptions } = await getMaterialEditorData(materialId);

  return <div className="mx-auto w-full max-w-[1200px]"><ServiceRouteToast cleanHref={`/dashboard/materials/${materialId}`} error={messages.error} success={messages.success} /><MaterialForm material={material} media={media} relationOptions={relationOptions} /></div>;
}
