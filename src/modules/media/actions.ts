"use server";

import { MediaType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth";

import { mediaConfig } from "./config";
import { extractImageMetadata } from "./image-metadata";
import { buildMediaStorageTarget, removeMediaFile, writeMediaFile } from "./storage";
import { mediaMetadataSchema, validateOriginalFilename, validateUploadSize } from "./validation";

export async function uploadMediaAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    redirectWithMessage("error", "اختر ملف صورة قبل الرفع.");
  }

  if (!validateOriginalFilename(file.name)) {
    redirectWithMessage("error", "اسم الملف الأصلي غير صالح.");
  }

  if (!validateUploadSize(file.size)) {
    redirectWithMessage("error", `حجم الصورة يجب ألا يتجاوز ${mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = extractImageMetadata(buffer);

  if (!metadata || !mediaConfig.allowedMimeTypes.includes(metadata.mimeType)) {
    redirectWithMessage("error", "نوع الصورة غير مدعوم أو الملف غير قابل للقراءة.");
  }

  if (file.type && file.type !== metadata.mimeType) {
    redirectWithMessage("error", "نوع الملف لا يطابق محتوى الصورة.");
  }

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

  revalidatePath("/dashboard/media");
  redirectWithMessage("success", "تم رفع الصورة وحفظ بياناتها.");
}

export async function updateMediaMetadataAction(formData: FormData) {
  await requireAdmin();

  const parsed = mediaMetadataSchema.safeParse({
    id: formData.get("id"),
    altText: formData.get("altText") || undefined,
    caption: formData.get("caption") || undefined,
  });

  if (!parsed.success) {
    redirectWithMessage("error", "تعذر حفظ بيانات الصورة. راجع النصوص المدخلة.");
  }

  await prisma.media.update({
    where: { id: parsed.data.id },
    data: {
      altText: parsed.data.altText || null,
      caption: parsed.data.caption || null,
    },
  });

  revalidatePath("/dashboard/media");
  redirectWithMessage("success", "تم تحديث بيانات الصورة.");
}

export async function deleteMediaAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirectWithMessage("error", "لم يتم تحديد الصورة المطلوب حذفها.");
  }

  const media = await prisma.media.findUnique({ where: { id } });

  if (!media) {
    redirectWithMessage("error", "الصورة غير موجودة.");
  }

  const referenceCount = await countMediaReferences(id);

  if (referenceCount > 0) {
    redirectWithMessage("error", "لا يمكن حذف صورة مستخدمة في المحتوى أو الإعدادات.");
  }

  await prisma.media.delete({ where: { id } });
  await removeMediaFile(media.storagePath).catch(async () => {
    await prisma.media.create({ data: media });
    redirectWithMessage("error", "تعذر حذف الملف من التخزين. لم يتم حذف سجل الوسيط.");
  });

  revalidatePath("/dashboard/media");
  redirectWithMessage("success", "تم حذف الصورة والملف المرتبط بها.");
}

async function countMediaReferences(id: string) {
  const [counts, pageVersions] = await Promise.all([Promise.all([
    prisma.serviceVersion.count({ where: { OR: [{ heroMediaId: id }, { openGraphImageId: id }] } }),
    prisma.solutionVersion.count({ where: { OR: [{ heroMediaId: id }, { openGraphImageId: id }] } }),
    prisma.materialVersion.count({ where: { OR: [{ heroMediaId: id }, { openGraphImageId: id }] } }),
    prisma.projectVersion.count({ where: { OR: [{ coverMediaId: id }, { openGraphImageId: id }] } }),
    prisma.articleVersion.count({ where: { OR: [{ heroMediaId: id }, { openGraphImageId: id }] } }),
    prisma.pageVersion.count({ where: { openGraphImageId: id } }),
    prisma.siteSettings.count({ where: { OR: [{ logoMediaId: id }, { defaultOpenGraphImageId: id }] } }),
    prisma.projectVersionGallery.count({ where: { mediaId: id } }),
  ]), prisma.pageVersion.findMany({ select: { data: true } })]);

  return counts.reduce((total, count) => total + count, 0) + pageVersions.filter(({ data }) => jsonContainsId(data, id)).length;
}

function jsonContainsId(value: unknown, id: string): boolean {
  if (value === id) return true;
  if (Array.isArray(value)) return value.some((item) => jsonContainsId(item, id));
  if (value && typeof value === "object") return Object.values(value).some((item) => jsonContainsId(item, id));
  return false;
}

function redirectWithMessage(type: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/dashboard/media?${params.toString()}`);
}
