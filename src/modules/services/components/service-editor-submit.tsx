"use client";

import { LoaderCircle, Save, Send } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function ServiceEditorSubmit({ action, kind }: { action: (formData: FormData) => void | Promise<void>; kind: "save" | "publish" }) {
  const { pending } = useFormStatus();
  const publish = kind === "publish";
  return <Button className="min-h-10" disabled={pending} formAction={action} type="submit" variant={publish ? "default" : "secondary"}>{pending ? <LoaderCircle className="animate-spin" /> : publish ? <Send /> : <Save />}{pending ? "جارٍ التنفيذ" : publish ? "نشر" : "حفظ المسودة"}</Button>;
}
