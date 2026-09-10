import { z } from "zod";

import { mediaConfig } from "./config";

export const mediaMetadataSchema = z.object({
  id: z.string().min(1),
  altText: z.string().trim().max(240).optional(),
  caption: z.string().trim().max(500).optional(),
});

export function validateOriginalFilename(filename: string) {
  const trimmed = filename.trim();

  if (!trimmed || trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("\0")) {
    return false;
  }

  return trimmed.length <= 180;
}

export function validateUploadSize(size: number) {
  return size > 0 && size <= mediaConfig.maxUploadBytes;
}
