import { prisma } from "@/server/db/prisma";

export const mediaPickerSelect = {
  id: true,
  url: true,
  originalFilename: true,
  altText: true,
  width: true,
  height: true,
} as const;

export function getRecentImageMedia(take = 80) {
  return prisma.media.findMany({
    where: { type: "IMAGE" },
    select: mediaPickerSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
  });
}

export async function includeSelectedImageMedia<T extends { id: string }>(items: T[], selectedIds: (string | null | undefined)[]) {
  const existingIds = new Set(items.map((item) => item.id));
  const missingIds = Array.from(new Set(selectedIds.filter((id): id is string => typeof id === "string" && id.length > 0).filter((id) => !existingIds.has(id))));
  if (!missingIds.length) return items;

  const selected = await prisma.media.findMany({
    where: { id: { in: missingIds }, type: "IMAGE" },
    select: mediaPickerSelect,
  });
  return [...selected, ...items];
}
