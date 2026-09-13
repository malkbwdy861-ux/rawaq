import { Building2, Car, House, School, Trees, Umbrella, Warehouse } from "lucide-react";

import type { ProjectCategoryIconKey } from "./validation";

export const projectCategoryIconOptions: { key: ProjectCategoryIconKey; label: string }[] = [
  { key: "car", label: "سيارة" },
  { key: "home", label: "منزل" },
  { key: "school", label: "مدرسة" },
  { key: "building", label: "مبنى" },
  { key: "trees", label: "حديقة" },
  { key: "umbrella", label: "مظلة" },
  { key: "warehouse", label: "مستودع" },
];

export function ProjectCategoryIcon({ iconKey, className = "size-4" }: { iconKey: string; className?: string }) {
  const props = { "aria-hidden": true as const, className, strokeWidth: 1.8 };
  switch (iconKey) {
    case "car": return <Car {...props} />;
    case "home": return <House {...props} />;
    case "school": return <School {...props} />;
    case "trees": return <Trees {...props} />;
    case "umbrella": return <Umbrella {...props} />;
    case "warehouse": return <Warehouse {...props} />;
    default: return <Building2 {...props} />;
  }
}
