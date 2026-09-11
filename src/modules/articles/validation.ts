import { ArticleType } from "@prisma/client";
import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema, cmsSlugSchema } from "@/modules/cms/validation";

import { isTipTapDocument, tipTapDocumentHasText, type TipTapDocument } from "./content";

const optionalText = z.string().trim().optional().or(z.literal(""));
const optionalMediaId = z.string().cuid().optional().or(z.literal(""));

const articleContentSchema = z.unknown().transform((value, context): TipTapDocument | null => {
  if (value === "" || value === null || value === undefined) return null;
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      context.addIssue({ code: "custom", message: "محتوى المقال غير صالح." });
      return z.NEVER;
    }
  }
  if (!isTipTapDocument(parsed)) {
    context.addIssue({ code: "custom", message: "يحتوي المقال على تنسيق غير مسموح." });
    return z.NEVER;
  }
  return parsed;
});

export const articleDraftSchema = cmsSeoFieldsSchema.extend({
  articleId: z.string().cuid().optional(),
  title: optionalText,
  slug: z.string().trim().optional().or(z.literal("")),
  excerpt: optionalText,
  content: articleContentSchema,
  heroMediaId: optionalMediaId,
  articleType: z.nativeEnum(ArticleType).optional().or(z.literal("")),
  relatedServiceIds: cmsRelationIdsSchema,
  relatedSolutionIds: cmsRelationIdsSchema,
  relatedMaterialIds: cmsRelationIdsSchema,
  relatedProjectIds: cmsRelationIdsSchema,
  relatedFaqIds: cmsRelationIdsSchema,
});

export const articlePublishSchema = articleDraftSchema.extend({
  title: z.string().trim().min(1, "أدخل عنوان المقال."),
  slug: cmsSlugSchema,
  excerpt: z.string().trim().min(1, "أدخل مقتطف المقال."),
  content: articleContentSchema.refine((content) => content && tipTapDocumentHasText(content), "أدخل محتوى المقال."),
});

export const articleIdSchema = z.object({ articleId: z.string().cuid() });

export type ArticleDraftInput = z.infer<typeof articleDraftSchema>;
export type ArticlePublishInput = z.infer<typeof articlePublishSchema>;
