type ArchiveHeroMedia = {
  url: string;
  altText: string | null;
  mimeType?: string;
};

export function isArchiveHeroPhoto(media: ArchiveHeroMedia | null | undefined): media is ArchiveHeroMedia {
  if (!media) return false;
  return media.mimeType !== "image/svg+xml" && !media.url.split("?")[0]?.toLowerCase().endsWith(".svg");
}

export function selectArchiveHeroImage({ configured, configuredAlt, title, fallbacks }: { configured: ArchiveHeroMedia | null; configuredAlt?: string; title: string; fallbacks: (ArchiveHeroMedia | null | undefined)[] }) {
  const media = isArchiveHeroPhoto(configured) ? configured : fallbacks.find(isArchiveHeroPhoto);
  if (!media) return null;
  return { url: media.url, altText: media === configured ? configuredAlt || media.altText || title : media.altText || title };
}
