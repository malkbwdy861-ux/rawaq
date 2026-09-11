import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const faqDraftSchema = z.object({
  faqId: z.string().cuid().optional(),
  question: optionalText,
  answer: optionalText,
  sortOrder: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().min(0).optional(),
  ),
});

export const faqPublishSchema = faqDraftSchema.extend({
  question: z.string().trim().min(1, "أدخل السؤال."),
  answer: z.string().trim().min(1, "أدخل الإجابة."),
});

export const faqIdSchema = z.object({ faqId: z.string().cuid() });

export type FaqDraftInput = z.infer<typeof faqDraftSchema>;
export type FaqPublishInput = z.infer<typeof faqPublishSchema>;
