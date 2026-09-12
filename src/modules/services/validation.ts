import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

const optionalText = z.string().trim().optional().or(z.literal(""));
const optionalMediaId = z.string().cuid().optional().or(z.literal(""));

export const serviceDraftSchema = cmsSeoFieldsSchema.extend({
  serviceId: z.string().cuid().optional(),
  title: optionalText,
  slug: z.string().trim().optional().or(z.literal("")),
  shortDescription: optionalText,
  content: optionalText,
  heroMediaId: optionalMediaId,
  relatedSolutionIds: cmsRelationIdsSchema,
  relatedMaterialIds: cmsRelationIdsSchema,
  relatedProjectIds: cmsRelationIdsSchema,
  relatedArticleIds: cmsRelationIdsSchema,
  relatedFaqIds: cmsRelationIdsSchema,
});

export const servicePublishSchema = serviceDraftSchema.extend({
  title: z.string().trim().min(1, "أدخل عنوان الخدمة."),
  shortDescription: z.string().trim().min(1, "أدخل وصفًا مختصرًا للخدمة."),
  content: z.string().trim().min(1, "أدخل محتوى الخدمة."),
});

export const serviceIdSchema = z.object({
  serviceId: z.string().cuid(),
});

export type ServiceDraftInput = z.infer<typeof serviceDraftSchema>;
export type ServicePublishInput = z.infer<typeof servicePublishSchema>;
