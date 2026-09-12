import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

const optionalTitle = z.string().trim().max(120, "يجب ألا يتجاوز عنوان الحل 120 حرفاً.").optional().or(z.literal(""));
const optionalShortDescription = z.string().trim().max(320, "يجب ألا يتجاوز الوصف المختصر 320 حرفاً.").optional().or(z.literal(""));
const optionalContent = z.string().trim().max(50000, "محتوى الحل طويل جداً.").optional().or(z.literal(""));
const optionalMediaId = z.string().cuid("اختيار الصورة غير صالح.").optional().or(z.literal(""));

export const solutionDraftSchema = cmsSeoFieldsSchema.extend({
  solutionId: z.string().cuid().optional(),
  title: optionalTitle,
  slug: z.string().trim().optional().or(z.literal("")),
  shortDescription: optionalShortDescription,
  content: optionalContent,
  heroMediaId: optionalMediaId,
  relatedServiceIds: cmsRelationIdsSchema,
  relatedMaterialIds: cmsRelationIdsSchema,
  relatedProjectIds: cmsRelationIdsSchema,
  relatedArticleIds: cmsRelationIdsSchema,
  relatedFaqIds: cmsRelationIdsSchema,
});

export const solutionPublishSchema = solutionDraftSchema.extend({
  title: z.string().trim().min(1, "أدخل عنوان الحل.").max(120, "يجب ألا يتجاوز عنوان الحل 120 حرفاً."),
  shortDescription: z.string().trim().min(1, "أدخل وصفاً مختصراً للحل.").max(320, "يجب ألا يتجاوز الوصف المختصر 320 حرفاً."),
  content: z.string().trim().min(1, "أدخل محتوى الحل.").max(50000, "محتوى الحل طويل جداً."),
});

export const solutionIdSchema = z.object({ solutionId: z.string().cuid() });

export type SolutionDraftInput = z.infer<typeof solutionDraftSchema>;
export type SolutionPublishInput = z.infer<typeof solutionPublishSchema>;
