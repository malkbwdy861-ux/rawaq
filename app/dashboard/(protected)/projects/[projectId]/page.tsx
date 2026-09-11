import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { ProjectForm } from "@/modules/projects/components/project-form";
import { getProjectEditorData } from "@/modules/projects/queries";

type ProjectEditorPageProps = { params: Promise<{ projectId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function ProjectEditorPage({ params, searchParams }: ProjectEditorPageProps) {
  const [{ projectId }, messages] = await Promise.all([params, searchParams]);
  const { project, media, relationOptions } = await getProjectEditorData(projectId);
  return <div className="space-y-8">
    <CmsPageHeader title="تحرير مشروع" description="حرر المسودة ورتب أدلة المشروع المرئية، ثم عاين النسخة قبل نشرها." />
    {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
    {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}
    <ProjectForm project={project} media={media} relationOptions={relationOptions} />
  </div>;
}
