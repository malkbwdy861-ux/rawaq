"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { lockPublishingNamespace } from "@/modules/cms/publishing";
import { normalizeCmsSlug } from "@/modules/cms/slugs";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { projectCategoryIdSchema, projectCategoryInputSchema } from "./validation";

export type ProjectCategoryFormValues = { name: string; iconKey: string; description: string; isActive: boolean; sortOrder: string };
export type ProjectCategoryFormState = { status: "idle" | "error"; message?: string; fieldErrors?: Record<string, string[] | undefined>; values: ProjectCategoryFormValues; revision: number };

export async function submitProjectCategoryAction(previousState: ProjectCategoryFormState, formData: FormData): Promise<ProjectCategoryFormState> {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "") || undefined;
  const values = readValues(formData);
  const parsed = projectCategoryInputSchema.safeParse({ ...values, categoryId, sortOrder: values.sortOrder });
  if (!parsed.success) return { status: "error", message: "تعذر حفظ التصنيف. راجع الحقول المحددة.", fieldErrors: parsed.error.flatten().fieldErrors, values, revision: previousState.revision + 1 };

  try {
    await prisma.$transaction(async (tx) => {
      await lockPublishingNamespace(tx, "project-categories");
      if (categoryId) {
        const existing = await tx.projectCategory.findUnique({ where: { id: categoryId }, select: { id: true } });
        if (!existing) throw new Error("التصنيف غير موجود.");
        await tx.projectCategory.update({ where: { id: categoryId }, data: { name: parsed.data.name, iconKey: parsed.data.iconKey, description: parsed.data.description || null, isActive: parsed.data.isActive, sortOrder: parsed.data.sortOrder } });
      } else {
        const slug = await uniqueCategorySlug(tx, parsed.data.name);
        await tx.projectCategory.create({ data: { name: parsed.data.name, slug, iconKey: parsed.data.iconKey, description: parsed.data.description || null, isActive: parsed.data.isActive, sortOrder: parsed.data.sortOrder } });
      }
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
    const message = code === "P2002" ? "يوجد تصنيف آخر يستخدم الرابط نفسه. غيّر الاسم ثم حاول مرة أخرى." : error instanceof Error && /^[\u0600-\u06ff]/u.test(error.message) ? error.message : "تعذر حفظ التصنيف الآن.";
    return { status: "error", message, values, revision: previousState.revision + 1 };
  }

  revalidateCategoryPaths();
  redirect(`/dashboard/project-categories?success=${encodeURIComponent(categoryId ? "تم تحديث تصنيف المشروع." : "تم إنشاء تصنيف المشروع.")}`);
}

export async function deleteProjectCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = projectCategoryIdSchema.safeParse({ categoryId: formData.get("categoryId") });
  if (!parsed.success) redirect("/dashboard/project-categories?error=تعذر تحديد التصنيف المطلوب حذفه.");
  try {
    await prisma.projectCategory.delete({ where: { id: parsed.data.categoryId } });
  } catch (error) {
    console.error("Project category delete failed", error);
    redirect(`/dashboard/project-categories?error=${encodeURIComponent("تعذر حذف التصنيف. حاول مرة أخرى.")}`);
  }
  revalidateCategoryPaths();
  redirect(`/dashboard/project-categories?success=${encodeURIComponent("تم حذف التصنيف وإلغاء إسناده من المشاريع دون حذفها.")}`);
}

function readValues(formData: FormData): ProjectCategoryFormValues {
  return { name: String(formData.get("name") ?? ""), iconKey: String(formData.get("iconKey") ?? "building"), description: String(formData.get("description") ?? ""), isActive: formData.get("isActive") === "on", sortOrder: String(formData.get("sortOrder") ?? "0") };
}

async function uniqueCategorySlug(tx: Prisma.TransactionClient, name: string) {
  const base = normalizeCmsSlug(name);
  if (!base) throw new Error("تعذر إنشاء رابط التصنيف من الاسم.");
  const matches = new Set((await tx.projectCategory.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map((item) => item.slug));
  if (!matches.has(base)) return base;
  for (let suffix = 2; suffix < 1000; suffix += 1) if (!matches.has(`${base}-${suffix}`)) return `${base}-${suffix}`;
  throw new Error("تعذر إنشاء رابط فريد للتصنيف.");
}

function revalidateCategoryPaths() {
  revalidatePath("/dashboard/project-categories");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/projects/[projectId]", "page");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]", "page");
}
