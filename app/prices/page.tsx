import type { Metadata } from "next";

import { PublicPage } from "@/modules/pages/components/public-page";
import { staticPageMetadata } from "@/modules/pages/metadata";
import { getPublishedPage } from "@/modules/pages/queries";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const result = await getPublishedPage("PRICES"); return staticPageMetadata(result.version, result.data); }
export default async function PricesPage() { const result = await getPublishedPage("PRICES"); return <PublicPage pageKey="PRICES" data={result.data} resolved={result.resolved} />; }
