import { ArticleType } from "@prisma/client";
import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

import { isTipTapDocument, tipTapDocumentHasText, type TipTapDocument } from "./content";

const optionalTitle = z.string().trim().max(120, "يجب ألا يتجاوز عنوان الدليل 120 حرفاً.").optional().or(z.literal(""));
const optionalExcerpt = z.string().trim().max(320, "يجب ألا يتجاوز مقتطف الدليل 320 حرفاً.").optional().or(z.literal(""));
const optionalMediaId = z.string().cuid("اختيار الصورة غير صالح.").optional().or(z.literal(""));

const articleContentSchema = z.unknown().transform((value, context): TipTapDocument | null => {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "string" && value.length > 100000) {
    context.addIssue({ code: "custom", message: "محتوى الدليل طويل جداً." });
    return z.NEVER;
  }
  let parsed = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); }
    catch {
      context.addIssue({ code: "custom", message: "تعذر قراءة محتوى الدليل المنسق. أعد تحميل الصفحة ثم حاول مرة أخرى." });
      return z.NEVER;
    }
  }
  if (!isTipTapDocument(parsed)) {
    context.addIssue({ code: "custom", message: "يحتوي الدليل على بنية أو تنسيق غير مسموح." });
    return z.NEVER;
  }
  return parsed;
});

export const articleDraftSchema = cmsSeoFieldsSchema.extend({
  articleId: z.string().cuid("معرّف الدليل غير صالح.").optional(),
  title: optionalTitle,
  slug: z.string().trim().optional().or(z.literal("")),
  excerpt: optionalExcerpt,
  content: articleContentSchema,
  heroMediaId: optionalMediaId,
  articleType: z.nativeEnum(ArticleType, "اختر نوع دليل صالحاً.").optional().or(z.literal("")),
  relatedServiceIds: cmsRelationIdsSchema,
  relatedSolutionIds: cmsRelationIdsSchema,
  relatedMaterialIds: cmsRelationIdsSchema,
  relatedProjectIds: cmsRelationIdsSchema,
  relatedFaqIds: cmsRelationIdsSchema,
});

export const articlePublishSchema = articleDraftSchema.extend({
  title: z.string().trim().min(1, "أدخل عنوان الدليل قبل النشر.").max(120, "يجب ألا يتجاوز عنوان الدليل 120 حرفاً."),
  excerpt: z.string().trim().min(1, "أدخل مقتطفاً موجزاً للدليل قبل النشر.").max(320, "يجب ألا يتجاوز مقتطف الدليل 320 حرفاً."),
  content: articleContentSchema.refine((content) => content && tipTapDocumentHasText(content), "أدخل محتوى الدليل قبل النشر."),
});

export const articleIdSchema = z.object({ articleId: z.string().cuid() });

export type ArticleDraftInput = z.infer<typeof articleDraftSchema>;
export type ArticlePublishInput = z.infer<typeof articlePublishSchema>;
