import { Plus } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CreateMaterialButton({ compact = false }: { compact?: boolean }) {
  return <Link className={cn(buttonVariants(), compact && "min-h-9")} href="/dashboard/materials/new"><Plus />مادة جديدة</Link>;
}
