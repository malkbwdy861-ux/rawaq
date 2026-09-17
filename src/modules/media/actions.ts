"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { cleanupCmsEntityReferences } from "@/modules/cms/references";
import { revalidateCmsReferenceConsumers } from "@/modules/cms/reference-cache";
import { runSerializableCmsTransaction } from "@/modules/cms/transactions";
import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth";

import { stageMediaFileDeletion } from "./storage";
import { mediaMetadataSchema } from "./validation";

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

  let stagedFile: Awaited<ReturnType<typeof stageMediaFileDeletion>>;
  try {
    stagedFile = await stageMediaFileDeletion(media.storagePath);
  } catch (error) {
    console.error("Media file staging failed", error);
    redirectWithMessage("error", "تعذر الوصول إلى ملف الصورة. لم يتم حذف أي بيانات.");
  }

  try {
    await runSerializableCmsTransaction(async (tx) => {
      await cleanupCmsEntityReferences(tx, "media", id);
      await tx.media.delete({ where: { id } });
    });
  } catch (error) {
    await stagedFile.rollback().catch((rollbackError) => console.error("Media file rollback failed", rollbackError));
    console.error("Media delete failed", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") redirectWithMessage("error", "الصورة غير موجودة.");
    throw error;
  }

  await stagedFile.commit().catch((error) => console.error("Deleted media file cleanup failed", error));

  revalidatePath("/dashboard/media");
  revalidatePath("/", "layout");
  revalidateCmsReferenceConsumers();
  redirectWithMessage("success", "تم حذف الصورة وإزالة ارتباطاتها من المحتوى والإعدادات.");
}

function redirectWithMessage(type: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/dashboard/media?${params.toString()}`);
}
