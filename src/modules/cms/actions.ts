import "server-only";

import { refresh } from "next/cache";
import type { z } from "zod";

import { requireAdmin } from "@/server/auth";

import type { CmsActionKind, CmsActionState } from "./types";

export const initialCmsActionState: CmsActionState = {};

type CmsMutationContext = {
  adminUserId: string;
  formData: FormData;
};

type CmsMutationOptions<TSchema extends z.ZodType> = {
  kind: CmsActionKind;
  schema: TSchema;
  formData: FormData;
  successMessage?: string;
  mutation: (input: z.infer<TSchema>, context: CmsMutationContext) => Promise<void>;
};

const defaultMessages: Record<CmsActionKind, string> = {
  saveDraft: "تم حفظ المسودة.",
  publish: "تم نشر المحتوى وتحديث النسخة العامة.",
  archive: "تمت أرشفة المحتوى وإزالته من العرض العام.",
};

export async function runCmsMutation<TSchema extends z.ZodType>({
  kind,
  schema,
  formData,
  successMessage,
  mutation,
}: CmsMutationOptions<TSchema>): Promise<CmsActionState> {
  const session = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: cleanFieldErrors(parsed.error.flatten().fieldErrors),
      formError: kind === "publish"
        ? "تعذر النشر. راجع حقول المسودة المطلوبة للنشر."
        : "تعذر حفظ البيانات. راجع الحقول المحددة.",
    };
  }

  try {
    await mutation(parsed.data, {
      adminUserId: session.user.id,
      formData,
    });
    refresh();

    return {
      ok: true,
      message: successMessage ?? defaultMessages[kind],
    };
  } catch {
    return {
      ok: false,
      formError: kind === "publish"
        ? "فشلت عملية النشر. النسخة المنشورة الحالية بقيت كما هي والمسودة محفوظة."
        : "فشلت العملية. حاول مرة أخرى دون فقدان البيانات.",
    };
  }
}

export async function runDraftSaveAction<TSchema extends z.ZodType>(
  options: Omit<CmsMutationOptions<TSchema>, "kind">,
) {
  return runCmsMutation({ ...options, kind: "saveDraft" });
}

export async function runPublishAction<TSchema extends z.ZodType>(
  options: Omit<CmsMutationOptions<TSchema>, "kind">,
) {
  return runCmsMutation({ ...options, kind: "publish" });
}

export async function runArchiveAction<TSchema extends z.ZodType>(
  options: Omit<CmsMutationOptions<TSchema>, "kind">,
) {
  return runCmsMutation({ ...options, kind: "archive" });
}

function cleanFieldErrors(fieldErrors: Record<string, string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0,
    ),
  );
}
