import { PageKey } from "@prisma/client";
import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

const text = z.string().trim();
const optionalText = text.optional().or(z.literal(""));
const optionalMediaId = z.string().cuid().optional().or(z.literal(""));
const itemIconSchema = z.enum(["location", "shield", "team", "settings", "climate", "design"]);
const itemSchema = z.object({ title: optionalText, description: optionalText, icon: itemIconSchema.optional() });
const valuePropositionItemSchema = itemSchema.extend({ enabled: z.boolean(), order: z.number().int().min(0).max(99) });
const safeTarget = text.refine(
  (value) => /^(\/(?!\/)|https:\/\/|tel:|mailto:)/i.test(value),
  "استخدم مسارًا داخليًا أو رابط https أو tel أو mailto.",
);
const optionalSafeTarget = z.union([z.literal(""), safeTarget]).optional();
const defaultValueProposition = {
  enabled: true,
  eyebrow: "لماذا مظلات جدة؟",
  heading: "تنفيذ مدروس لمظلات تدوم في مناخ جدة",
  description: "نجمع بين المواد المناسبة والتصميم المخصص والتنفيذ الاحترافي لنقدم حلول تظليل متينة وأنيقة، مصممة بعناية لتلائم الموقع وتدوم في ظروف جدة.",
  mediaId: "",
  ctaLabel: "اعرف المزيد عنا",
  ctaUrl: "/about",
  items: [
    { title: "مواد مناسبة لمناخ جدة", description: "مواد مختارة لمقاومة الحرارة والشمس والرطوبة والظروف الساحلية.", icon: "climate" as const, order: 1, enabled: true },
    { title: "تصميم وتنفيذ مخصص", description: "حلول تتوافق مع أبعاد الموقع وطبيعة الاستخدام والطابع المعماري.", icon: "design" as const, order: 2, enabled: true },
    { title: "فريق تنفيذ متخصص", description: "تركيب دقيق وتشطيبات احترافية ينفذها فريق ذو خبرة.", icon: "team" as const, order: 3, enabled: true },
    { title: "ضمان وجودة تنفيذ", description: "جودة موثوقة في المواد والتنفيذ، مع ضمان حيث ينطبق.", icon: "shield" as const, order: 4, enabled: true },
  ],
};

export const homePageDraftSchema = z.object({
  hero: z.object({ eyebrow: optionalText, title: optionalText, description: optionalText, primaryCtaText: optionalText, primaryCtaTarget: optionalText, secondaryCtaText: optionalText, secondaryCtaTarget: optionalText, mediaId: optionalMediaId, imageAlt: optionalText }),
  featuredServices: z.object({ title: optionalText, description: optionalText, selectedServiceIds: cmsRelationIdsSchema }),
  featuredSolutions: z.object({ title: optionalText, description: optionalText, selectedSolutionIds: cmsRelationIdsSchema }),
  valueProposition: z.object({ enabled: z.boolean(), eyebrow: optionalText, heading: optionalText, description: optionalText, mediaId: optionalMediaId, ctaLabel: optionalText, ctaUrl: optionalText, items: z.array(valuePropositionItemSchema) }).default(defaultValueProposition),
  featuredProjects: z.object({ title: optionalText, description: optionalText, selectedProjectIds: cmsRelationIdsSchema }),
  trustSection: z.object({ title: optionalText, description: optionalText, items: z.array(itemSchema) }),
  faqSection: z.object({ title: optionalText, selectedFaqIds: cmsRelationIdsSchema }),
  finalCta: z.object({ title: optionalText, description: optionalText, buttonText: optionalText, target: optionalText }),
});

export const aboutPageDraftSchema = z.object({
  hero: z.object({ title: optionalText, description: optionalText, mediaId: optionalMediaId }),
  companyStory: z.object({ title: optionalText, content: optionalText }),
  values: z.object({ title: optionalText, items: z.array(itemSchema) }),
  capabilities: z.object({ title: optionalText, content: optionalText }),
  finalCta: z.object({ title: optionalText, description: optionalText, buttonText: optionalText, target: optionalText }),
});

export const contactPageDraftSchema = z.object({
  hero: z.object({ title: optionalText, description: optionalText }),
  contactIntro: z.object({ title: optionalText, description: optionalText }),
  showPhone: z.boolean(),
  showWhatsapp: z.boolean(),
  showEmail: z.boolean(),
  showAddress: z.boolean(),
  showBusinessHours: z.boolean(),
  finalCta: z.object({ title: optionalText, description: optionalText }),
});

export const pricesPageDraftSchema = z.object({
  hero: z.object({ title: optionalText, description: optionalText }),
  intro: z.object({ title: optionalText, content: optionalText }),
  pricingFactors: z.object({ title: optionalText, items: z.array(itemSchema) }),
  selectedPricingArticleIds: cmsRelationIdsSchema,
  faqSection: z.object({ selectedFaqIds: cmsRelationIdsSchema }),
  finalCta: z.object({ title: optionalText, description: optionalText, buttonText: optionalText, target: optionalText }),
});

export const pageKeySchema = z.nativeEnum(PageKey);
export const pageIdSchema = z.object({ pageId: z.string().cuid(), key: pageKeySchema });
export const pageSeoSchema = cmsSeoFieldsSchema;

const required = (message: string) => text.min(1, message);
export const homePagePublishSchema = homePageDraftSchema.extend({
  hero: homePageDraftSchema.shape.hero.extend({ title: required("أدخل عنوان البطل."), description: required("أدخل وصف البطل."), primaryCtaText: required("أدخل نص الإجراء الرئيسي."), primaryCtaTarget: safeTarget, secondaryCtaTarget: optionalSafeTarget }),
  valueProposition: homePageDraftSchema.shape.valueProposition.unwrap().extend({ ctaUrl: optionalSafeTarget }).default(defaultValueProposition),
  finalCta: homePageDraftSchema.shape.finalCta.extend({ title: required("أدخل عنوان الدعوة الختامية."), buttonText: required("أدخل نص زر الدعوة الختامية."), target: safeTarget }),
});
export const aboutPagePublishSchema = aboutPageDraftSchema.extend({
  hero: aboutPageDraftSchema.shape.hero.extend({ title: required("أدخل عنوان الصفحة."), description: required("أدخل وصف الصفحة.") }),
  companyStory: aboutPageDraftSchema.shape.companyStory.extend({ title: required("أدخل عنوان قصة الشركة."), content: required("أدخل قصة الشركة.") }),
  finalCta: aboutPageDraftSchema.shape.finalCta.extend({ title: required("أدخل عنوان الدعوة الختامية."), buttonText: required("أدخل نص زر الدعوة الختامية."), target: safeTarget }),
});
export const contactPagePublishSchema = contactPageDraftSchema.extend({ hero: contactPageDraftSchema.shape.hero.extend({ title: required("أدخل عنوان الصفحة."), description: required("أدخل وصف الصفحة.") }) });
export const pricesPagePublishSchema = pricesPageDraftSchema.extend({
  hero: pricesPageDraftSchema.shape.hero.extend({ title: required("أدخل عنوان الصفحة."), description: required("أدخل وصف الصفحة.") }),
  intro: pricesPageDraftSchema.shape.intro.extend({ content: required("أدخل شرح منهج التسعير.") }),
  pricingFactors: pricesPageDraftSchema.shape.pricingFactors.extend({ title: required("أدخل عنوان عوامل التسعير.") }),
  finalCta: pricesPageDraftSchema.shape.finalCta.extend({ title: required("أدخل عنوان الدعوة الختامية."), buttonText: required("أدخل نص زر الدعوة الختامية."), target: safeTarget }),
});

export const pageDraftSchemas = { HOME: homePageDraftSchema, ABOUT: aboutPageDraftSchema, CONTACT: contactPageDraftSchema, PRICES: pricesPageDraftSchema } as const;
export const pagePublishSchemas = { HOME: homePagePublishSchema, ABOUT: aboutPagePublishSchema, CONTACT: contactPagePublishSchema, PRICES: pricesPagePublishSchema } as const;

export type HomePageData = z.infer<typeof homePageDraftSchema>;
export type AboutPageData = z.infer<typeof aboutPageDraftSchema>;
export type ContactPageData = z.infer<typeof contactPageDraftSchema>;
export type PricesPageData = z.infer<typeof pricesPageDraftSchema>;
export type StaticPageData = HomePageData | AboutPageData | ContactPageData | PricesPageData;
