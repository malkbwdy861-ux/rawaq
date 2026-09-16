import { MediaType } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

import { mediaConfig } from "./config";
import { extractImageMetadata } from "./image-metadata";
import { buildMediaStorageTarget, writeMediaFile } from "./storage";
import { validateOriginalFilename, validateUploadSize } from "./validation";

export class MediaUploadError extends Error {}

export async function storeUploadedMedia(formData: FormData) {
  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    throw new MediaUploadError("اختر صورة واحدة على الأقل قبل الرفع.");
  }

  const preparedFiles = await Promise.all(
    files.map(async (file) => {
      if (!validateOriginalFilename(file.name)) {
        throw new MediaUploadError(
          `اسم الملف الأصلي غير صالح: ${file.name || "بدون اسم"}.`,
        );
      }

      if (!validateUploadSize(file.size)) {
        throw new MediaUploadError(
          `حجم الصورة يجب ألا يتجاوز ${mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت: ${file.name}.`,
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const metadata = extractImageMetadata(buffer);

      if (!metadata || !mediaConfig.allowedMimeTypes.includes(metadata.mimeType)) {
        throw new MediaUploadError(
          `نوع الصورة غير مدعوم أو الملف غير قابل للقراءة: ${file.name}.`,
        );
      }

      if (file.type && file.type !== metadata.mimeType) {
        throw new MediaUploadError(
          `نوع الملف لا يطابق محتوى الصورة: ${file.name}.`,
        );
      }

      return { file, buffer, metadata };
    }),
  );

  for (const { file, buffer, metadata } of preparedFiles) {
    const target = buildMediaStorageTarget(metadata.mimeType);

    await writeMediaFile(target.storagePath, buffer);
    await prisma.media.create({
      data: {
        type: MediaType.IMAGE,
        url: target.url,
        storagePath: target.storagePath,
        originalFilename: file.name,
        storedFilename: target.storedFilename,
        mimeType: metadata.mimeType,
        sizeBytes: file.size,
        width: metadata.width,
        height: metadata.height,
      },
    });
  }

  return preparedFiles.length;
}
