"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { saveRedirectMapping } from "./service";
import { redirectIdSchema, redirectInputSchema } from "./validation";

export async function createRedirectAction(formData: FormData) {
  await requireAdmin();
  const parsed = redirectInputSchema.safeParse(readInput(formData));
  if (!parsed.success) return redirectWithMessage("error", parsed.error.issues[0]?.message ?? "راجع المسارات المدخلة.");

  try {
    await prisma.$transaction((tx) => saveRedirectMapping(tx, parsed.data));
  } catch (error) {
    return redirectWithMessage("error", error instanceof Error ? error.message : "تعذر إنشاء إعادة التوجيه.");
  }

  revalidateRedirectPaths(parsed.data.sourcePath);
  redirectWithMessage("success", "تم إنشاء إعادة التوجيه الدائمة.");
}

export async function updateRedirectAction(formData: FormData) {
  await requireAdmin();
  const parsed = redirectInputSchema.safeParse(readInput(formData));
  if (!parsed.success || !parsed.data.redirectId) return redirectWithMessage("error", parsed.error?.issues[0]?.message ?? "تعذر تحديد إعادة التوجيه.");

  try {
    const previous = await prisma.redirect.findUnique({ where: { id: parsed.data.redirectId }, select: { sourcePath: true } });
    if (!previous) throw new Error("إعادة التوجيه غير موجودة.");
    await prisma.$transaction((tx) => saveRedirectMapping(tx, parsed.data));
    revalidateRedirectPaths(previous.sourcePath, parsed.data.sourcePath);
  } catch (error) {
    return redirectWithMessage("error", error instanceof Error ? error.message : "تعذر تحديث إعادة التوجيه.");
  }

  redirectWithMessage("success", "تم تحديث إعادة التوجيه الدائمة.");
}

export async function deleteRedirectAction(formData: FormData) {
  await requireAdmin();
  const parsed = redirectIdSchema.safeParse({ redirectId: formData.get("redirectId") });
  if (!parsed.success) return redirectWithMessage("error", "تعذر تحديد إعادة التوجيه.");

  const removed = await prisma.redirect.delete({ where: { id: parsed.data.redirectId }, select: { sourcePath: true } });
  revalidateRedirectPaths(removed.sourcePath);
  redirectWithMessage("success", "تم حذف إعادة التوجيه.");
}

function readInput(formData: FormData) {
  return {
    redirectId: formData.get("redirectId") || undefined,
    sourcePath: formData.get("sourcePath") ?? "",
    destinationPath: formData.get("destinationPath") ?? "",
  };
}

function revalidateRedirectPaths(...paths: string[]) {
  revalidatePath("/dashboard/seo/redirects");
  revalidatePath("/sitemap.xml");
  for (const path of paths) revalidatePath(path);
}

function redirectWithMessage(type: "success" | "error", message: string): never {
  redirect(`/dashboard/seo/redirects?${type}=${encodeURIComponent(message)}`);
}
