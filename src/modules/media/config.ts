import path from "node:path";

export const mediaConfig = {
  uploadDir: path.resolve(
    /*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? path.join(process.cwd(), ".data", "uploads"),
  ),
  publicBase: normalizePublicBase(process.env.UPLOAD_PUBLIC_BASE ?? "/media"),
  maxUploadBytes: 8 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
};

export type AllowedImageMimeType = (typeof mediaConfig.allowedMimeTypes)[number];

export const mimeExtension: Record<AllowedImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function normalizePublicBase(value: string) {
  const trimmed = value.trim();
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return withLeadingSlash.replace(/\/+$/, "") || "/media";
}
