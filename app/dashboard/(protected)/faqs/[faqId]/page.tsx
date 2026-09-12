import { redirect } from "next/navigation";

type FaqEditorPageProps = { params: Promise<{ faqId: string }> };

export default async function FaqEditorPage({ params }: FaqEditorPageProps) {
  await params;
  redirect("/dashboard/faqs");
}
