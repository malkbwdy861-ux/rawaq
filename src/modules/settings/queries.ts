import { prisma } from "@/server/db/prisma";

import { socialLinksSchema, type SocialLinksInput } from "./validation";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findFirst({
    include: { logoMedia: true, defaultOpenGraphImage: true },
    orderBy: { createdAt: "asc" },
  });

  return settings ? { ...settings, socialLinks: parseSocialLinks(settings.socialLinks) } : null;
}

export async function getSiteSettingsEditorData() {
  const [settings, media] = await Promise.all([
    getSiteSettings(),
    prisma.media.findMany({ where: { type: "IMAGE" }, orderBy: { createdAt: "desc" }, take: 80 }),
  ]);

  return { settings, media };
}

export function parseSocialLinks(value: unknown): SocialLinksInput {
  const parsed = socialLinksSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : {};
}
