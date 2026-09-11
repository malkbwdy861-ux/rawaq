import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { SolutionForm } from "@/modules/solutions/components/solution-form";
import { getSolutionEditorData } from "@/modules/solutions/queries";

type SolutionEditorPageProps = {
  params: Promise<{ solutionId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SolutionEditorPage({ params, searchParams }: SolutionEditorPageProps) {
  const [{ solutionId }, messages] = await Promise.all([params, searchParams]);
  const { solution, media, relationOptions } = await getSolutionEditorData(solutionId);

  return (
    <div className="space-y-8">
      <CmsPageHeader title="تحرير حل" description="عدّل المسودة، عاينها، ثم انشرها عند جاهزيتها." />
      {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
      {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}
      <SolutionForm solution={solution} media={media} relationOptions={relationOptions} />
    </div>
  );
}
