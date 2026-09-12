"use client";

import { LoaderCircle, Save, Send } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function ServiceEditorSubmit({ kind }: { kind: "save" | "publish" }) {
  const { data, pending } = useFormStatus();
  const publish = kind === "publish";
  const active = pending && data?.get("intent") === (publish ? "publish" : "saveDraft");
  return <Button className="min-h-10" disabled={pending} name="intent" type="submit" value={publish ? "publish" : "saveDraft"} variant={publish ? "default" : "secondary"}>{active ? <LoaderCircle className="animate-spin" /> : publish ? <Send /> : <Save />}{active ? publish ? "جارٍ النشر" : "جارٍ الحفظ" : publish ? "نشر" : "حفظ كمسودة"}</Button>;
}
