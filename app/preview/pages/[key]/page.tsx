import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPage } from "@/modules/pages/components/public-page";
import { getPagePreview } from "@/modules/pages/queries";
import { pageKeySchema } from "@/modules/pages/validation";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "معاينة صفحة", robots: { index: false, follow: false } };
type PagePreviewProps = { params: Promise<{ key: string }> };
export default async function PagePreview({ params }: PagePreviewProps) { await requireAdmin(); const parsed = pageKeySchema.safeParse((await params).key); if (!parsed.success) notFound(); const result = await getPagePreview(parsed.data); return <PublicPage pageKey={parsed.data} data={result.data} resolved={result.resolved} preview />; }
