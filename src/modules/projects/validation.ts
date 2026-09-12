import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

const optionalText = z.string().trim().optional().or(z.literal(""));
const optionalMediaId = z.string().cuid().optional().or(z.literal(""));
const optionalDate = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.date().optional(),
);

export const projectGalleryItemSchema = z.object({
  mediaId: z.string().cuid(),
  caption: z.string().trim().max(300).optional().or(z.literal("")),
});

const projectGallerySchema = z.array(projectGalleryItemSchema).refine(
  (items) => new Set(items.map((item) => item.mediaId)).size === items.length,
  "لا يمكن تكرار الصورة نفسها في معرض المشروع.",
);

export const projectDraftSchema = cmsSeoFieldsSchema.extend({
  projectId: z.string().cuid().optional(),
  title: optionalText,
  slug: z.string().trim().optional().or(z.literal("")),
  shortDescription: optionalText,
  content: optionalText,
  challenge: optionalText,
  solutionSummary: optionalText,
  technicalDetails: optionalText,
  completedAt: optionalDate,
  city: optionalText,
  district: optionalText,
  coverMediaId: optionalMediaId,
  gallery: projectGallerySchema.default([]),
  relatedServiceIds: cmsRelationIdsSchema,
  relatedSolutionIds: cmsRelationIdsSchema,
  relatedMaterialIds: cmsRelationIdsSchema,
  relatedArticleIds: cmsRelationIdsSchema,
});

export const projectPublishSchema = projectDraftSchema.extend({
  title: z.string().trim().min(1, "أدخل عنوان المشروع."),
  shortDescription: z.string().trim().min(1, "أدخل وصفًا مختصرًا للمشروع."),
});

export const projectIdSchema = z.object({ projectId: z.string().cuid() });

export type ProjectDraftInput = z.infer<typeof projectDraftSchema>;
export type ProjectPublishInput = z.infer<typeof projectPublishSchema>;
