import type { ReactNode } from "react";

import { DashboardShell } from "@/modules/cms/components/dashboard-shell";
import { requireAdmin } from "@/server/auth";

import { logoutAction } from "./actions";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <DashboardShell logoutAction={logoutAction} userLabel={session.user.name ?? session.user.email ?? "مدير المحتوى"}>{children}</DashboardShell>
  );
}
