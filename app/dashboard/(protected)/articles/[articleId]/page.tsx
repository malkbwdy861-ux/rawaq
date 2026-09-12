import { ArticleForm } from "@/modules/articles/components/article-form";
import { getArticleEditorData } from "@/modules/articles/queries";
import { ServiceRouteToast } from "@/modules/services/components/service-route-toast";

type ArticleEditorPageProps = { params: Promise<{ articleId: string }>; searchParams: Promise<{ success?: string; error?: string }> };

export default async function ArticleEditorPage({ params, searchParams }: ArticleEditorPageProps) {
  const [{ articleId }, messages] = await Promise.all([params, searchParams]);
  const { article, media, relationOptions } = await getArticleEditorData(articleId);
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <ServiceRouteToast cleanHref={`/dashboard/articles/${articleId}`} error={messages.error} success={messages.success} />
      <ArticleForm article={article} media={media} relationOptions={relationOptions} />
    </div>
  );
}
