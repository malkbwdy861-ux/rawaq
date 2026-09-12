import { MaterialForm } from "@/modules/materials/components/material-form";
import { getNewMaterialEditorData } from "@/modules/materials/queries";

export default async function NewMaterialPage() {
  const { media, relationOptions } = await getNewMaterialEditorData();
  return <div className="mx-auto w-full max-w-[1200px]"><MaterialForm media={media} relationOptions={relationOptions} /></div>;
}
