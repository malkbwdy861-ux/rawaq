import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { MaterialForm } from "@/modules/materials/components/material-form";
import { getMaterialEditorData } from "@/modules/materials/queries";

type MaterialEditorPageProps = {
  params: Promise<{ materialId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function MaterialEditorPage({ params, searchParams }: MaterialEditorPageProps) {
  const [{ materialId }, messages] = await Promise.all([params, searchParams]);
  const { material, media, relationOptions } = await getMaterialEditorData(materialId);

  return (
    <div className="space-y-8">
      <CmsPageHeader title="تحرير مادة" description="عدّل المسودة، أضف الحقائق المؤكدة فقط، ثم انشرها عند جاهزيتها." />
      {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
      {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}
      <MaterialForm material={material} media={media} relationOptions={relationOptions} />
    </div>
  );
}
