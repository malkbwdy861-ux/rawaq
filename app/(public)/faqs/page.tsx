import type { Metadata } from "next";

import { PublicPage } from "@/modules/pages/components/public-page";
import { staticPageMetadata } from "@/modules/pages/metadata";
import { getPublishedPage } from "@/modules/pages/queries";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPublishedPage("FAQS");
  return staticPageMetadata(result.version, result.data, "/faqs", result.resolved.heroMedia?.url);
}

export default async function FaqsPage() {
  const result = await getPublishedPage("FAQS");
  return <PublicPage pageKey="FAQS" data={result.data} resolved={result.resolved} />;
}
