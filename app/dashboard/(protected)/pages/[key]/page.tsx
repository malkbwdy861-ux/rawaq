import { notFound } from "next/navigation";

import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { PageForm } from "@/modules/pages/components/page-form";
import { getPageEditorData, pageDefinitions } from "@/modules/pages/queries";
import { pageKeySchema } from "@/modules/pages/validation";

type PageEditorProps = { params: Promise<{ key: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function PageEditor({ params, searchParams }: PageEditorProps) {
  const [{ key: rawKey }, messages] = await Promise.all([params, searchParams]);
  const key = pageKeySchema.safeParse(rawKey);
  if (!key.success) notFound();
  const data = await getPageEditorData(key.data);
  const definition = pageDefinitions.find((item) => item.key === key.data)!;
  return (
    <div className="mx-auto max-w-[1120px] space-y-6">
      <CmsPageHeader title={`تحرير صفحة ${definition.label}`} description="حرر محتوى المسودة ضمن مخطط الصفحة، ثم عاين التغييرات قبل نشرها للعامة." />
      {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
      {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}
      <PageForm {...data} path={definition.path} />
    </div>
  );
}
