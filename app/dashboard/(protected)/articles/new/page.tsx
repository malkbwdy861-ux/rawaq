import { ArticleForm } from "@/modules/articles/components/article-form";
import { getNewArticleEditorData } from "@/modules/articles/queries";

export default async function NewArticlePage() {
  const { media, relationOptions } = await getNewArticleEditorData();
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <ArticleForm media={media} relationOptions={relationOptions} />
    </div>
  );
}
