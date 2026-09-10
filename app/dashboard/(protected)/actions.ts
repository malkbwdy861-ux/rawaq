"use server";

import { signOut } from "@/server/auth";

export async function logoutAction() {
  await signOut({ redirectTo: "/dashboard/login" });
}

export async function protectedMutationCheck() {
  const { requireAdmin } = await import("@/server/auth");

  await requireAdmin();

  return { ok: true };
}
