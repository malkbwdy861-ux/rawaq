"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import { requireAdmin } from "@/server/auth";

import { removeMediaFile } from "./storage";
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

  const referenceCount = await countMediaReferences(id);

  if (referenceCount > 0) {
    redirectWithMessage("error", "لا يمكن حذف صورة مستخدمة في المحتوى أو الإعدادات.");
  }

  try {
    await prisma.media.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      redirectWithMessage("error", "لا يمكن حذف صورة مستخدمة في المحتوى أو الإعدادات.");
    }
    throw error;
  }

  await removeMediaFile(media.storagePath).catch(async () => {
    await prisma.media.create({ data: media });
    redirectWithMessage("error", "تعذر حذف الملف من التخزين. لم يتم حذف سجل الوسيط.");
  });

  revalidatePath("/dashboard/media");
  redirectWithMessage("success", "تم حذف الصورة والملف المرتبط بها.");
}

async function countMediaReferences(id: string) {
  const [counts, pageDataReferences] = await Promise.all([Promise.all([
    prisma.serviceVersion.count({ where: { OR: [{ heroMediaId: id }, { openGraphImageId: id }] } }),
    prisma.solutionVersion.count({ where: { OR: [{ heroMediaId: id }, { openGraphImageId: id }] } }),
    prisma.materialVersion.count({ where: { OR: [{ heroMediaId: id }, { openGraphImageId: id }] } }),
    prisma.projectVersion.count({ where: { OR: [{ coverMediaId: id }, { openGraphImageId: id }] } }),
    prisma.articleVersion.count({ where: { OR: [{ heroMediaId: id }, { openGraphImageId: id }] } }),
    prisma.pageVersion.count({ where: { openGraphImageId: id } }),
    prisma.siteSettings.count({ where: { OR: [{ logoMediaId: id }, { defaultOpenGraphImageId: id }] } }),
    prisma.projectVersionGallery.count({ where: { mediaId: id } }),
  ]), countPageDataMediaReferences(id)]);

  return counts.reduce((total, count) => total + count, 0) + pageDataReferences;
}

async function countPageDataMediaReferences(id: string) {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "PageVersion"
    WHERE jsonb_path_exists("data", '$.** ? (@ == $mediaId)', jsonb_build_object('mediaId', to_jsonb(${id}::text)))
  `;

  return Number(rows[0]?.count ?? 0);
}

function redirectWithMessage(type: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/dashboard/media?${params.toString()}`);
}
