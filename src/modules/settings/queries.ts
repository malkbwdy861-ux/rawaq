import { cache } from "react";

import { prisma } from "@/server/db/prisma";
import { getRecentImageMedia, includeSelectedImageMedia } from "@/modules/media/queries";
import { getAdminSession } from "@/server/auth";

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

export async function getAdminAccountEditorData() {
  const session = await getAdminSession();
  if (!session?.user?.id) return null;

  return prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });
}

export function parseSocialLinks(value: unknown): SocialLinksInput {
  const parsed = socialLinksSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : {};
}
