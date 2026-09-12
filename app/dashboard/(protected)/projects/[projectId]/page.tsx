import { ProjectForm } from "@/modules/projects/components/project-form";
import { getProjectEditorData } from "@/modules/projects/queries";
import { ServiceRouteToast } from "@/modules/services/components/service-route-toast";

type ProjectEditorPageProps = { params: Promise<{ projectId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function ProjectEditorPage({ params, searchParams }: ProjectEditorPageProps) {
  const [{ projectId }, messages] = await Promise.all([params, searchParams]);
  const { project, media, relationOptions } = await getProjectEditorData(projectId);
  return <div className="mx-auto w-full max-w-[1200px]">
    <ServiceRouteToast cleanHref={`/dashboard/projects/${projectId}`} error={messages.error} success={messages.success} />
    <ProjectForm project={project} media={media} relationOptions={relationOptions} />
  </div>;
}
