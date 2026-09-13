import type { Metadata } from "next";

import { contentMetadata } from "@/modules/seo/metadata";

import type { StaticPageData } from "./validation";

type VersionMetadata = { seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImage: { url: string } | null };
export function staticPageMetadata(version: VersionMetadata, data: StaticPageData, path: string, image?: string | null): Promise<Metadata> {
  const title = "pageTitle" in data.hero ? data.hero.pageTitle : "title" in data.hero ? data.hero.title : undefined;
  const description = "shortDescription" in data.hero ? data.hero.shortDescription : "description" in data.hero ? data.hero.description : undefined;
  return contentMetadata({ version, path, title: title || "صفحة", description, image });
}
