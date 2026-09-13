import { cache } from "react";

import { prisma } from "@/server/db/prisma";
import { getRecentImageMedia, includeSelectedImageMedia } from "@/modules/media/queries";

import { socialLinksSchema, type SocialLinksInput } from "./validation";

export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSettings.findFirst({
    include: { logoMedia: true, defaultOpenGraphImage: true },
    orderBy: { createdAt: "asc" },
  });

  return settings ? { ...settings, socialLinks: parseSocialLinks(settings.socialLinks) } : null;
});

export async function getSiteSettingsEditorData() {
  const [settings, media] = await Promise.all([
    getSiteSettings(),
    getRecentImageMedia(),
  ]);

  return { settings, media: await includeSelectedImageMedia(media, [settings?.logoMediaId, settings?.defaultOpenGraphImageId]) };
}

export function parseSocialLinks(value: unknown): SocialLinksInput {
  const parsed = socialLinksSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : {};
}
