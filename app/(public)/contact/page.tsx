import type { Metadata } from "next";

import { PublicPage } from "@/modules/pages/components/public-page";
import { staticPageMetadata } from "@/modules/pages/metadata";
import { getPublishedPage } from "@/modules/pages/queries";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> { const result = await getPublishedPage("CONTACT"); return staticPageMetadata(result.version, result.data, "/contact", result.resolved.heroMedia?.url); }
export default async function ContactPage() { const result = await getPublishedPage("CONTACT"); return <PublicPage pageKey="CONTACT" data={result.data} resolved={result.resolved} />; }
