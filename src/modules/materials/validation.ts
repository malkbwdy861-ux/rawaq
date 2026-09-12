import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

const optionalName = z.string().trim().max(120, "يجب ألا يتجاوز اسم المادة 120 حرفاً.").optional().or(z.literal(""));
const optionalShortDescription = z.string().trim().max(320, "يجب ألا يتجاوز الوصف المختصر 320 حرفاً.").optional().or(z.literal(""));
const optionalContent = z.string().trim().max(50000, "محتوى المادة طويل جداً.").optional().or(z.literal(""));
const optionalMaintenanceNotes = z.string().trim().max(5000, "ملاحظات الصيانة طويلة جداً.").optional().or(z.literal(""));
const optionalMediaId = z.string().cuid("اختيار الصورة غير صالح.").optional().or(z.literal(""));
const factArray = (label: string) => z.array(z.string().trim().min(1).max(500, `يجب ألا يتجاوز كل بند في ${label} 500 حرف.`)).max(100, `يجب ألا يتجاوز عدد بنود ${label} 100 بند.`).default([]);

export const materialDraftSchema = cmsSeoFieldsSchema.extend({
  materialId: z.string().cuid("معرّف المادة غير صالح.").optional(),
  name: optionalName,
  slug: z.string().trim().optional().or(z.literal("")),
  shortDescription: optionalShortDescription,
  content: optionalContent,
  advantages: factArray("المزايا"),
  limitations: factArray("القيود"),
  maintenanceNotes: optionalMaintenanceNotes,
  recommendedUses: factArray("الاستخدامات الموصى بها"),
  heroMediaId: optionalMediaId,
  relatedServiceIds: cmsRelationIdsSchema,
  relatedSolutionIds: cmsRelationIdsSchema,
  relatedProjectIds: cmsRelationIdsSchema,
  relatedArticleIds: cmsRelationIdsSchema,
  relatedFaqIds: cmsRelationIdsSchema,
});

export const materialPublishSchema = materialDraftSchema.extend({
  name: z.string().trim().min(1, "أدخل اسم المادة.").max(120, "يجب ألا يتجاوز اسم المادة 120 حرفاً."),
  shortDescription: z.string().trim().min(1, "أدخل وصفاً مختصراً للمادة.").max(320, "يجب ألا يتجاوز الوصف المختصر 320 حرفاً."),
  content: z.string().trim().min(1, "أدخل محتوى المادة.").max(50000, "محتوى المادة طويل جداً."),
});

export const materialIdSchema = z.object({ materialId: z.string().cuid() });

export type MaterialDraftInput = z.infer<typeof materialDraftSchema>;
export type MaterialPublishInput = z.infer<typeof materialPublishSchema>;
