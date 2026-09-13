import { ProjectForm } from "@/modules/projects/components/project-form";
import { getNewProjectEditorData } from "@/modules/projects/queries";

export default async function NewProjectPage() {
  const { media, relationOptions, categoryOptions } = await getNewProjectEditorData();
  return <div className="mx-auto w-full max-w-[1200px]"><ProjectForm media={media} relationOptions={relationOptions} categoryOptions={categoryOptions} /></div>;
}
