import type { Metadata } from "next";

import { PublicPage } from "@/modules/pages/components/public-page";
import { staticPageMetadata } from "@/modules/pages/metadata";
import { getPublishedPage } from "@/modules/pages/queries";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const result = await getPublishedPage("ABOUT"); return staticPageMetadata(result.version, result.data, "/about", result.resolved.heroMedia?.url); }
export default async function AboutPage() { const result = await getPublishedPage("ABOUT"); return <PublicPage pageKey="ABOUT" data={result.data} resolved={result.resolved} />; }
