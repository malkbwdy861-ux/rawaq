"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function CreateServiceButton({ compact = false }: { compact?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} className={compact ? "min-h-9" : undefined} disabled={pending} type="submit">
      {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
      {pending ? "جارٍ الإنشاء" : "خدمة جديدة"}
    </Button>
  );
}
