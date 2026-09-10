import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { mediaConfig, mimeExtension, type AllowedImageMimeType } from "./config";

export function buildMediaStorageTarget(mimeType: AllowedImageMimeType, now = new Date()) {
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const storedFilename = `${randomUUID()}.${mimeExtension[mimeType]}`;
  const relativePath = path.join(/*turbopackIgnore: true*/ year, month, storedFilename);
  const storagePath = path.join(/*turbopackIgnore: true*/ mediaConfig.uploadDir, relativePath);
  const url = `${mediaConfig.publicBase}/${year}/${month}/${storedFilename}`;

  return { year, month, storedFilename, storagePath, url };
}

export async function writeMediaFile(storagePath: string, buffer: Buffer) {
  await mkdir(path.dirname(storagePath), { recursive: true });
  await writeFile(storagePath, buffer, { flag: "wx" });
}

export async function readServedMediaFile(segments: string[]) {
  const safeSegments = segments.filter((segment) => /^[A-Za-z0-9._-]+$/.test(segment));

  if (safeSegments.length !== segments.length || safeSegments.length < 3) {
    return null;
  }

  const requestedPath = path.resolve(mediaConfig.uploadDir, ...safeSegments);
  const relative = path.relative(mediaConfig.uploadDir, requestedPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  return readFile(requestedPath).catch(() => null);
}

export async function removeMediaFile(storagePath: string) {
  const resolved = path.resolve(storagePath);
  const relative = path.relative(mediaConfig.uploadDir, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Unsafe media path");
  }

  await unlink(resolved);
}
