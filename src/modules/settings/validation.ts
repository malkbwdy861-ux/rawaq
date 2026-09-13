import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));
const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalMediaId = z.string().cuid().optional().or(z.literal(""));
const phone = requiredText("أدخل رقم التواصل.").max(40, "رقم التواصل طويل جداً.");
const optionalPhone = z.string().trim().max(40, "رقم التواصل طويل جداً.").optional().or(z.literal(""));
const optionalUrl = z.string().trim().url("أدخل رابطاً صحيحاً يبدأ بـ https.").refine((value) => value.startsWith("https://"), "استخدم رابط https فقط.").optional().or(z.literal(""));

export const socialLinksSchema = z.object({
  facebook: optionalUrl,
  instagram: optionalUrl,
  x: optionalUrl,
  tiktok: optionalUrl,
  youtube: optionalUrl,
  linkedin: optionalUrl,
});

export const siteSettingsSchema = z.object({
  companyName: requiredText("أدخل اسم الشركة."),
  companyDescription: optionalText,
  logoMediaId: optionalMediaId,
  primaryPhone: phone,
  secondaryPhone: optionalPhone,
  whatsappNumber: phone,
  email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً.").optional().or(z.literal("")),
  address: optionalText,
  businessHours: optionalText,
  socialLinks: socialLinksSchema,
  defaultSeoTitle: z.string().trim().max(70, "عنوان محركات البحث طويل جداً.").optional().or(z.literal("")),
  defaultSeoDescription: z.string().trim().max(170, "وصف محركات البحث طويل جداً.").optional().or(z.literal("")),
  defaultOpenGraphImageId: optionalMediaId,
  defaultCtaText: z.string().trim().max(80, "نص الإجراء طويل جداً.").optional().or(z.literal("")),
  defaultWhatsappText: z.string().trim().max(500, "رسالة واتساب طويلة جداً.").optional().or(z.literal("")),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;
