import { SolutionForm } from "@/modules/solutions/components/solution-form";
import { getNewSolutionEditorData } from "@/modules/solutions/queries";

export default async function NewSolutionPage() {
  const { media, relationOptions } = await getNewSolutionEditorData();

  return <div className="mx-auto w-full max-w-[1200px]"><SolutionForm media={media} relationOptions={relationOptions} /></div>;
}
