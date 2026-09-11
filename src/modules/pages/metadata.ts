import type { Metadata } from "next";

import type { StaticPageData } from "./validation";

type VersionMetadata = { seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null; noIndex: boolean; openGraphTitle: string | null; openGraphDescription: string | null; openGraphImage: { url: string } | null };
type SettingsMetadata = { defaultSeoTitle: string | null; defaultSeoDescription: string | null; defaultOpenGraphImage?: { url: string } | null } | null;

export function staticPageMetadata(version: VersionMetadata, data: StaticPageData, settings?: SettingsMetadata): Metadata {
  return { title: version.seoTitle ?? data.hero.title ?? settings?.defaultSeoTitle ?? undefined, description: version.seoDescription ?? data.hero.description ?? settings?.defaultSeoDescription ?? undefined, alternates: version.canonicalUrl ? { canonical: version.canonicalUrl } : undefined, robots: version.noIndex ? { index: false, follow: false } : undefined, openGraph: { title: version.openGraphTitle ?? version.seoTitle ?? data.hero.title ?? settings?.defaultSeoTitle ?? undefined, description: version.openGraphDescription ?? version.seoDescription ?? data.hero.description ?? settings?.defaultSeoDescription ?? undefined, images: version.openGraphImage?.url ? [version.openGraphImage.url] : settings?.defaultOpenGraphImage?.url ? [settings.defaultOpenGraphImage.url] : undefined } };
}
