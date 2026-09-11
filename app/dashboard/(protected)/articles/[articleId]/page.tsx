import { ArticleForm } from "@/modules/articles/components/article-form";
import { getArticleEditorData } from "@/modules/articles/queries";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";

type ArticleEditorPageProps = { params: Promise<{ articleId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function ArticleEditorPage({ params, searchParams }: ArticleEditorPageProps) {
  const [{ articleId }, messages] = await Promise.all([params, searchParams]);
  const { article, media, relationOptions } = await getArticleEditorData(articleId);
  return <div className="space-y-8">
    <CmsPageHeader title="تحرير مقال" description="حرر مسودة الدليل بمحتوى منظم، ثم عاين النسخة قبل نشرها." />
    {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
    {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}
    <ArticleForm article={article} media={media} relationOptions={relationOptions} />
  </div>;
}
