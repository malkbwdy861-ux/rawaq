import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema, cmsSlugSchema } from "@/modules/cms/validation";

const optionalText = z.string().trim().optional().or(z.literal(""));
const optionalMediaId = z.string().cuid().optional().or(z.literal(""));

export const solutionDraftSchema = cmsSeoFieldsSchema.extend({
  solutionId: z.string().cuid().optional(),
  title: optionalText,
  slug: z.string().trim().optional().or(z.literal("")),
  shortDescription: optionalText,
  content: optionalText,
  heroMediaId: optionalMediaId,
  relatedServiceIds: cmsRelationIdsSchema,
  relatedMaterialIds: cmsRelationIdsSchema,
  relatedProjectIds: cmsRelationIdsSchema,
  relatedArticleIds: cmsRelationIdsSchema,
  relatedFaqIds: cmsRelationIdsSchema,
});

export const solutionPublishSchema = solutionDraftSchema.extend({
  title: z.string().trim().min(1, "أدخل عنوان الحل."),
  slug: cmsSlugSchema,
  shortDescription: z.string().trim().min(1, "أدخل وصفًا مختصرًا للحل."),
  content: z.string().trim().min(1, "أدخل محتوى الحل."),
});

export const solutionIdSchema = z.object({
  solutionId: z.string().cuid(),
});

export type SolutionDraftInput = z.infer<typeof solutionDraftSchema>;
export type SolutionPublishInput = z.infer<typeof solutionPublishSchema>;
