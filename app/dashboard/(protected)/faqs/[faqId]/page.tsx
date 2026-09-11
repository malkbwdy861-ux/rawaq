import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { FaqForm } from "@/modules/faqs/components/faq-form";
import { getFaqEditorData } from "@/modules/faqs/queries";

type FaqEditorPageProps = { params: Promise<{ faqId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function FaqEditorPage({ params, searchParams }: FaqEditorPageProps) {
  const [{ faqId }, messages] = await Promise.all([params, searchParams]);
  const faq = await getFaqEditorData(faqId);
  return <div className="space-y-8">
    <CmsPageHeader title="تحرير سؤال شائع" description="حرر المسودة المستقلة، ثم عاين السؤال قبل نشره في الصفحات المرتبطة." />
    {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
    {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}
    <FaqForm faq={faq} />
  </div>;
}
