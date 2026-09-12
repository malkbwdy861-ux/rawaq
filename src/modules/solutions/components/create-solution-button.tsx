import { Plus } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CreateSolutionButton({ compact = false }: { compact?: boolean }) {
  return <Link className={cn(buttonVariants(), compact && "min-h-9")} href="/dashboard/solutions/new"><Plus />حل جديد</Link>;
}
