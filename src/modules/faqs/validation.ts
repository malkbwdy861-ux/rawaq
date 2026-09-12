import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const faqDraftSchema = z.object({
  faqId: z.string().cuid().optional(),
  question: optionalText,
  answer: optionalText,
});

export const faqCreateSchema = faqDraftSchema.omit({ faqId: true }).extend({
  question: z.string().trim().min(3, "أدخل سؤالاً واضحاً من 3 أحرف على الأقل."),
  answer: z.string().trim().min(5, "أدخل إجابة واضحة من 5 أحرف على الأقل."),
});

export const faqPublishSchema = faqDraftSchema.extend({
  question: z.string().trim().min(1, "أدخل السؤال."),
  answer: z.string().trim().min(1, "أدخل الإجابة."),
});

export const faqIdSchema = z.object({ faqId: z.string().cuid() });

export type FaqDraftInput = z.infer<typeof faqDraftSchema>;
export type FaqCreateInput = z.infer<typeof faqCreateSchema>;
export type FaqPublishInput = z.infer<typeof faqPublishSchema>;
