import { z } from "zod";

import type { CmsPagination } from "./types";

export const cmsPageSizeOptions = [10, 20, 50] as const;

export const cmsSlugSchema = z
  .string()
  .trim()
  .min(1, "أدخل الرابط المختصر.")
  .max(120, "الرابط المختصر طويل جدًا.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "استخدم أحرفًا لاتينية صغيرة وأرقامًا وشرطات فقط.");

export const optionalCmsSlugSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  cmsSlugSchema.optional(),
);

export const cmsSearchParamsSchema = z.object({
  q: z.string().trim().max(120).optional().catch(undefined),
  status: z
    .enum(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED", "UNPUBLISHED_CHANGES"])
    .optional()
    .catch("ALL"),
  page: z.coerce.number().int().min(1).optional().catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => cmsPageSizeOptions.includes(value as (typeof cmsPageSizeOptions)[number]))
    .optional()
    .catch(20),
  sort: z.string().trim().max(80).optional().catch(undefined),
});

export const cmsRelationIdsSchema = z.array(z.string().cuid()).default([]);

export const cmsSeoFieldsSchema = z.object({
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(170).optional().or(z.literal("")),
  canonicalUrl: z.string().trim().url().optional().or(z.literal("")),
  noIndex: z.coerce.boolean().default(false),
  openGraphTitle: z.string().trim().max(70).optional().or(z.literal("")),
  openGraphDescription: z.string().trim().max(170).optional().or(z.literal("")),
  openGraphImageId: z.string().cuid().optional().or(z.literal("")),
});

export function normalizeCmsSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function parseCmsSearchParams(input: Record<string, string | string[] | undefined>) {
  return cmsSearchParamsSchema.parse({
    q: firstParam(input.q),
    status: firstParam(input.status),
    page: firstParam(input.page),
    pageSize: firstParam(input.pageSize),
    sort: firstParam(input.sort),
  });
}

export function getCmsPagination({ page, pageSize, totalItems }: CmsPagination) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

export function readStringArray(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
