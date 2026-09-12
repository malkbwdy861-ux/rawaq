import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

const optionalTitle = z.string().trim().max(120, "يجب ألا يتجاوز عنوان الخدمة 120 حرفاً.").optional().or(z.literal(""));
const optionalShortDescription = z.string().trim().max(320, "يجب ألا يتجاوز الوصف المختصر 320 حرفاً.").optional().or(z.literal(""));
const optionalContent = z.string().trim().max(50000, "محتوى الخدمة طويل جداً.").optional().or(z.literal(""));
const optionalMediaId = z.string().cuid("اختيار الصورة غير صالح.").optional().or(z.literal(""));

export const serviceDraftSchema = cmsSeoFieldsSchema.extend({
  serviceId: z.string().cuid().optional(),
  title: optionalTitle,
  slug: z.string().trim().optional().or(z.literal("")),
  shortDescription: optionalShortDescription,
  content: optionalContent,
  heroMediaId: optionalMediaId,
  relatedSolutionIds: cmsRelationIdsSchema,
  relatedMaterialIds: cmsRelationIdsSchema,
  relatedProjectIds: cmsRelationIdsSchema,
  relatedArticleIds: cmsRelationIdsSchema,
  relatedFaqIds: cmsRelationIdsSchema,
});

export const servicePublishSchema = serviceDraftSchema.extend({
  title: z.string().trim().min(1, "أدخل عنوان الخدمة.").max(120, "يجب ألا يتجاوز عنوان الخدمة 120 حرفاً."),
  shortDescription: z.string().trim().min(1, "أدخل وصفاً مختصراً للخدمة.").max(320, "يجب ألا يتجاوز الوصف المختصر 320 حرفاً."),
  content: z.string().trim().min(1, "أدخل محتوى الخدمة.").max(50000, "محتوى الخدمة طويل جداً."),
});

export const serviceIdSchema = z.object({
  serviceId: z.string().cuid(),
});

export type ServiceDraftInput = z.infer<typeof serviceDraftSchema>;
export type ServicePublishInput = z.infer<typeof servicePublishSchema>;
