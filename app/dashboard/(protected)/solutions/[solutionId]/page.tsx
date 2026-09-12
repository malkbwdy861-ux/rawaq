import { ServiceRouteToast } from "@/modules/services/components/service-route-toast";
import { SolutionForm } from "@/modules/solutions/components/solution-form";
import { getSolutionEditorData } from "@/modules/solutions/queries";

type SolutionEditorPageProps = { params: Promise<{ solutionId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function SolutionEditorPage({ params, searchParams }: SolutionEditorPageProps) {
  const [{ solutionId }, messages] = await Promise.all([params, searchParams]);
  const { solution, media, relationOptions } = await getSolutionEditorData(solutionId);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <ServiceRouteToast cleanHref={`/dashboard/solutions/${solutionId}`} error={messages.error} success={messages.success} />
      <SolutionForm solution={solution} media={media} relationOptions={relationOptions} />
    </div>
  );
}
