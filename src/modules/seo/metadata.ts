import type { Metadata } from "next";

import { getSiteSettings } from "@/modules/settings/queries";

type SeoVersion = {
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  openGraphTitle: string | null;
  openGraphDescription: string | null;
  openGraphImage: { url: string } | null;
};

export async function contentMetadata({
  version,
  path,
  title,
  description,
  image,
  type = "website",
}: {
  version: SeoVersion;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
}): Promise<Metadata> {
  const settings = await getSiteSettings();
  const resolvedTitle = version.seoTitle ?? title ?? settings?.defaultSeoTitle ?? undefined;
  const resolvedDescription = version.seoDescription ?? description ?? settings?.defaultSeoDescription ?? undefined;
  const resolvedImage = version.openGraphImage?.url ?? image ?? settings?.defaultOpenGraphImage?.url;

  return {
    title: version.seoTitle ? { absolute: version.seoTitle } : resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: version.canonicalUrl || path },
    robots: version.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      url: version.canonicalUrl || path,
      locale: "ar_SA",
      title: version.openGraphTitle ?? resolvedTitle,
      description: version.openGraphDescription ?? resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

export function listingMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "ar_SA", title, description, url: path },
  };
}
