import type { Metadata } from "next";

import { contentMetadata } from "@/modules/seo/metadata";

import type { StaticPageData } from "./validation";

type VersionMetadata = { seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImage: { url: string } | null };
export function staticPageMetadata(version: VersionMetadata, data: StaticPageData, path: string, image?: string | null): Promise<Metadata> {
  return contentMetadata({ version, path, title: data.hero.title || "صفحة", description: data.hero.description, image });
}
