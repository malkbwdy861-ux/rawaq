import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

const optionalText = (maximum: number, message: string) => z.string().trim().max(maximum, message).optional().or(z.literal(""));
const optionalMediaId = z.string().cuid("اختيار الصورة غير صالح.").optional().or(z.literal(""));
const optionalRelationId = z.string().cuid("اختيار التصنيف غير صالح.").optional().or(z.literal(""));
const optionalDate = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.date({ error: "أدخل تاريخ إنجاز صالحاً." }).optional(),
);

export const projectGalleryItemSchema = z.object({
  mediaId: z.string().cuid("إحدى صور المعرض غير صالحة."),
  caption: z.string().trim().max(300, "يجب ألا يتجاوز تعليق الصورة 300 حرف.").optional().or(z.literal("")),
});

const projectGallerySchema = z.array(projectGalleryItemSchema)
  .max(60, "لا يمكن أن يتجاوز معرض المشروع 60 صورة.")
  .refine((items) => new Set(items.map((item) => item.mediaId)).size === items.length, "لا يمكن تكرار الصورة نفسها في معرض المشروع.");

export const projectDraftSchema = cmsSeoFieldsSchema.extend({
  projectId: z.string().cuid().optional(),
  title: optionalText(120, "يجب ألا يتجاوز عنوان المشروع 120 حرفاً."),
  slug: z.string().trim().optional().or(z.literal("")),
  shortDescription: optionalText(320, "يجب ألا يتجاوز الوصف المختصر 320 حرفاً."),
  content: optionalText(50000, "محتوى المشروع طويل جداً."),
  challenge: optionalText(10000, "وصف التحدي طويل جداً."),
  solutionSummary: optionalText(10000, "وصف الحل المنفذ طويل جداً."),
  technicalDetails: optionalText(10000, "التفاصيل الفنية طويلة جداً."),
  completedAt: optionalDate,
  city: optionalText(100, "يجب ألا يتجاوز اسم المدينة 100 حرف."),
  district: optionalText(120, "يجب ألا يتجاوز اسم الحي 120 حرفاً."),
  categoryId: optionalRelationId,
  coverMediaId: optionalMediaId,
  gallery: projectGallerySchema.default([]),
  relatedServiceIds: cmsRelationIdsSchema,
  relatedSolutionIds: cmsRelationIdsSchema,
  relatedMaterialIds: cmsRelationIdsSchema,
  relatedArticleIds: cmsRelationIdsSchema,
});

export const projectPublishSchema = projectDraftSchema.extend({
  title: z.string().trim().min(1, "أدخل عنوان المشروع.").max(120, "يجب ألا يتجاوز عنوان المشروع 120 حرفاً."),
  shortDescription: z.string().trim().min(1, "أدخل وصفاً مختصراً للمشروع.").max(320, "يجب ألا يتجاوز الوصف المختصر 320 حرفاً."),
  content: z.string().trim().min(1, "أدخل محتوى المشروع.").max(50000, "محتوى المشروع طويل جداً."),
});

export const projectIdSchema = z.object({ projectId: z.string().cuid() });

export type ProjectDraftInput = z.infer<typeof projectDraftSchema>;
export type ProjectPublishInput = z.infer<typeof projectPublishSchema>;
