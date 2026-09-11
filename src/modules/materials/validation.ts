import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema, cmsSlugSchema } from "@/modules/cms/validation";

const optionalText = z.string().trim().optional().or(z.literal(""));
const optionalMediaId = z.string().cuid().optional().or(z.literal(""));
const optionalTextArray = z.array(z.string().trim().min(1)).default([]);

export const materialDraftSchema = cmsSeoFieldsSchema.extend({
  materialId: z.string().cuid().optional(),
  name: optionalText,
  slug: z.string().trim().optional().or(z.literal("")),
  shortDescription: optionalText,
  content: optionalText,
  advantages: optionalTextArray,
  limitations: optionalTextArray,
  maintenanceNotes: optionalText,
  recommendedUses: optionalTextArray,
  heroMediaId: optionalMediaId,
  relatedServiceIds: cmsRelationIdsSchema,
  relatedSolutionIds: cmsRelationIdsSchema,
  relatedProjectIds: cmsRelationIdsSchema,
  relatedArticleIds: cmsRelationIdsSchema,
  relatedFaqIds: cmsRelationIdsSchema,
});

export const materialPublishSchema = materialDraftSchema.extend({
  name: z.string().trim().min(1, "أدخل اسم المادة."),
  slug: cmsSlugSchema,
  shortDescription: z.string().trim().min(1, "أدخل وصفًا مختصرًا للمادة."),
  content: z.string().trim().min(1, "أدخل محتوى المادة."),
});

export const materialIdSchema = z.object({
  materialId: z.string().cuid(),
});

export type MaterialDraftInput = z.infer<typeof materialDraftSchema>;
export type MaterialPublishInput = z.infer<typeof materialPublishSchema>;
