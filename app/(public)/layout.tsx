import type { ReactNode } from "react";

import { PublicShell } from "@/modules/public/components/public-shell";
import { getSiteSettings } from "@/modules/settings/queries";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return <PublicShell settings={settings}>{children}</PublicShell>;
}
