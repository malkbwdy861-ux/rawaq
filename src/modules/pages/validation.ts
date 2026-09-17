import { PageKey } from "@prisma/client";
import { z } from "zod";

import { cmsRelationIdsSchema, cmsSeoFieldsSchema } from "@/modules/cms/validation";

const text = z.string().trim();
const optionalText = text.optional().or(z.literal(""));
const optionalMediaId = z.string().cuid().optional().or(z.literal(""));
const optionalLimitedText = (maximum: number) => text.max(maximum).optional().or(z.literal(""));
const itemIconSchema = z.enum(["location", "shield", "team", "settings", "climate", "design"]);
const itemSchema = z.object({ title: optionalText, description: optionalText, icon: itemIconSchema.optional() });
const valuePropositionItemSchema = itemSchema.extend({ enabled: z.boolean(), order: z.number().int().min(0).max(99) });
const managedItemSchema = itemSchema.extend({ id: text.min(1), enabled: z.boolean(), order: z.number().int().min(0).max(99) });
const processStepSchema = managedItemSchema.extend({ mediaId: optionalMediaId, imageAlt: optionalText });
const proofMetricSchema = managedItemSchema.extend({ value: optionalText });
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
const defaultFeaturedProjects = {
  enabled: true,
  eyebrow: "مشاريعنا",
  title: "مشاريع مختارة",
  description: "نعرض مجموعة مختارة من المشاريع التي تعكس جودة التنفيذ واهتمامنا بالتفاصيل في مختلف أنحاء جدة.",
  ctaLabel: "عرض جميع المشاريع",
  ctaHref: "/projects",
  selectedProjectIds: [],
};
const featuredProjectIdsSchema = z.array(z.string().cuid())
  .max(5, "يمكن اختيار خمسة مشاريع كحد أقصى.")
  .refine((ids) => new Set(ids).size === ids.length, "لا يمكن تكرار المشروع نفسه.")
  .default([]);
const defaultHowWeWork = {
  enabled: true,
  eyebrow: "كيف نعمل",
  title: "من الفكرة إلى تنفيذ جاهز للاستخدام",
  description: "خطوات واضحة تساعدنا على فهم الموقع، اختيار الحل المناسب، وتنفيذ العمل بدقة.",
  steps: [
    { id: "process-contact", title: "تواصل معنا", description: "شاركنا احتياجك ومعلومات الموقع لنحدد الخطوة التالية.", mediaId: "", imageAlt: "", order: 1, enabled: true },
    { id: "process-inspection", title: "معاينة الموقع", description: "نراجع المساحة والأبعاد وظروف الاستخدام على الطبيعة.", mediaId: "", imageAlt: "", order: 2, enabled: true },
    { id: "process-design", title: "العرض والتصميم", description: "نقترح الحل والمواد والتفاصيل المناسبة قبل بدء التنفيذ.", mediaId: "", imageAlt: "", order: 3, enabled: true },
    { id: "process-delivery", title: "التنفيذ والتسليم", description: "ينفذ الفريق العمل ويُراجع التشطيب قبل التسليم.", mediaId: "", imageAlt: "", order: 4, enabled: true },
  ],
};
const defaultFeaturedProof = { title: "جودة تدوم لسنوات", description: "نهتم باختيار المواد ودقة التفاصيل من المعاينة حتى التسليم.", mediaId: "" };
const defaultTrustMetrics = [
  { id: "proof-jeddah", title: "نخدم جميع أحياء جدة", description: "معاينة وتنفيذ داخل نطاق الخدمة.", value: "", icon: "location" as const, order: 1, enabled: true },
  { id: "proof-warranty", title: "ضمان على التنفيذ", description: "وفق نطاق العمل المتفق عليه.", value: "", icon: "shield" as const, order: 2, enabled: true },
  { id: "proof-team", title: "فريق متخصص", description: "متابعة عملية من القياس إلى التسليم.", value: "", icon: "team" as const, order: 3, enabled: true },
  { id: "proof-materials", title: "مواد مختارة بعناية", description: "بما يناسب الموقع وطبيعة الاستخدام.", value: "", icon: "settings" as const, order: 4, enabled: true },
];
const defaultTrustStripItems = [
  { id: "trust-materials", title: "مواد مختارة بعناية", description: "", icon: "settings" as const, order: 1, enabled: true },
  { id: "trust-installation", title: "تنفيذ متخصص", description: "", icon: "team" as const, order: 2, enabled: true },
  { id: "trust-timing", title: "الالتزام بالمواعيد", description: "", icon: "shield" as const, order: 3, enabled: true },
];
const defaultFinalTrustItems = [
  { id: "cta-response", title: "استجابة سريعة", description: "", icon: "team" as const, order: 1, enabled: true },
  { id: "cta-consultation", title: "استشارة ومعاينة", description: "", icon: "location" as const, order: 2, enabled: true },
  { id: "cta-team", title: "فريق متخصص", description: "", icon: "settings" as const, order: 3, enabled: true },
];

export const homePageDraftSchema = z.object({
  hero: z.object({ eyebrow: optionalText, title: optionalText, description: optionalText, primaryCtaText: optionalText, primaryCtaTarget: optionalText, secondaryCtaText: optionalText, secondaryCtaTarget: optionalText, mediaId: optionalMediaId, imageAlt: optionalText }),
  featuredServices: z.object({ title: optionalText, description: optionalText, selectedServiceIds: cmsRelationIdsSchema }),
  featuredSolutions: z.object({ title: optionalText, description: optionalText, selectedSolutionIds: cmsRelationIdsSchema }),
  valueProposition: z.object({ enabled: z.boolean(), eyebrow: optionalText, heading: optionalText, description: optionalText, mediaId: optionalMediaId, ctaLabel: optionalText, ctaUrl: optionalText, items: z.array(valuePropositionItemSchema) }).default(defaultValueProposition),
  featuredProjects: z.object({
    enabled: z.boolean().default(true),
    eyebrow: optionalText.default(defaultFeaturedProjects.eyebrow),
    title: optionalText,
    description: optionalText,
    ctaLabel: optionalText.default(defaultFeaturedProjects.ctaLabel),
    ctaHref: optionalSafeTarget.default(defaultFeaturedProjects.ctaHref),
    selectedProjectIds: featuredProjectIdsSchema,
  }).default(defaultFeaturedProjects),
  howWeWork: z.object({ enabled: z.boolean().default(true), eyebrow: optionalText, title: optionalText, description: optionalText, steps: z.array(processStepSchema).max(4) }).default(defaultHowWeWork),
  trustSection: z.object({
    enabled: z.boolean().default(true),
    eyebrow: optionalText.default("الثقة في كل تفصيل"),
    title: optionalText,
    description: optionalText,
    items: z.array(itemSchema).default([]),
    featuredProof: z.object({ title: optionalText, description: optionalText, mediaId: optionalMediaId }).default(defaultFeaturedProof),
    metrics: z.array(proofMetricSchema).max(4).default(defaultTrustMetrics),
    stripItems: z.array(managedItemSchema).max(3).default(defaultTrustStripItems),
  }),
  faqSection: z.object({ enabled: z.boolean().default(true), eyebrow: optionalText.default("قبل أن تبدأ"), title: optionalText, description: optionalText, allFaqsLabel: optionalText, allFaqsHref: optionalSafeTarget, selectedFaqIds: cmsRelationIdsSchema }),
  finalCta: z.object({
    enabled: z.boolean().default(true),
    eyebrow: optionalText.default("لنبدأ معا"),
    title: optionalText,
    description: optionalText,
    backgroundMediaId: optionalMediaId,
    primaryCtaLabel: optionalText.default("تواصل عبر واتساب"),
    secondaryCtaLabel: optionalText.default("اتصل بنا"),
    trustItems: z.array(managedItemSchema).max(3).default(defaultFinalTrustItems),
    buttonText: optionalText,
    target: optionalText,
  }),
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

export const faqPageDraftSchema = z.object({
  hero: z.object({ title: optionalText, description: optionalText }),
  faqSection: z.object({ selectedFaqIds: cmsRelationIdsSchema }),
});

export const faqPageDefaults = {
  hero: {
    title: "الأسئلة الشائعة",
    description: "إجابات واضحة عن أكثر الأسئلة شيوعاً حول خدمات المظلات والتظليل وآلية التنفيذ.",
  },
  faqSection: { selectedFaqIds: [] },
};

export const listingPageDraftSchema = z.object({
  hero: z.object({
    pageTitle: optionalLimitedText(120),
    eyebrow: optionalLimitedText(60),
    shortDescription: optionalLimitedText(240),
    mediaId: optionalMediaId,
    imageAlt: optionalLimitedText(300),
  }),
  intro: z.object({
    title: optionalLimitedText(140),
    description: optionalLimitedText(2000),
  }),
});

export const listingPageDefaults = {
  PROJECTS: {
    hero: { pageTitle: "مشاريع نفذناها على أرض الواقع", eyebrow: "مشاريعنا", shortDescription: "نماذج من أعمالنا في المظلات والتظليل الخارجي في جدة.", mediaId: "", imageAlt: "" },
    intro: { title: "أعمال حقيقية تعكس جودة التنفيذ", description: "استعرض مجموعة من مشاريعنا المنفذة في جدة، من مظلات المواقف والمدارس إلى الجلسات الخارجية والمظلات السكنية والتجارية. نركز في كل مشروع على جودة الخامات، دقة التنفيذ، ملاءمة التصميم للموقع وتحقيق أفضل استفادة من المساحة." },
  },
  SERVICES: {
    hero: { pageTitle: "خدمات تظليل وتنفيذ تناسب احتياجك", eyebrow: "خدماتنا", shortDescription: "تنفيذ احترافي للمظلات وحلول التظليل للمنازل والمنشآت والمساحات المختلفة.", mediaId: "", imageAlt: "" },
    intro: { title: "خدمات متكاملة من التصميم حتى التنفيذ", description: "نقدم مجموعة متكاملة من خدمات المظلات والتظليل الخارجي في جدة، بدءاً من فهم احتياج الموقع واختيار الحل المناسب وحتى التوريد والتركيب والتشطيب، مع الاهتمام بجودة المواد ودقة التنفيذ." },
  },
  SOLUTIONS: {
    hero: { pageTitle: "حلول تظليل مصممة حسب احتياج الموقع", eyebrow: "حلولنا", shortDescription: "نساعدك في اختيار الحل المناسب حسب استخدام المساحة وطبيعة المشروع.", mediaId: "", imageAlt: "" },
    intro: { title: "الحل المناسب يبدأ من فهم الموقع", description: "نقسم حلولنا حسب طبيعة الاستخدام والموقع لمساعدة العميل على الوصول إلى الخيار الأنسب، سواء للمواقف أو المدارس أو المساحات الخارجية أو المنازل أو المنشآت التجارية." },
  },
  GUIDES: {
    hero: { pageTitle: "أدلة واضحة لاختيار ما يناسب موقعك", eyebrow: "معرفة عملية، قبل قرار التنفيذ", shortDescription: "معلومات عملية عن المواد والأسعار والصيانة والمقارنات، مرتبة لتصل إلى القرار بثقة.", mediaId: "", imageAlt: "" },
    intro: { title: "محتوى يساعدك على اتخاذ قرار أوضح", description: "استكشف أدلة عملية تشرح خيارات التظليل والمواد وعوامل الأسعار ومتطلبات الصيانة، لتفهم البدائل قبل بدء التنفيذ." },
  },
  MATERIALS: {
    hero: { pageTitle: "مواد واضحة لاختيارات تدوم", eyebrow: "دليل المواد", shortDescription: "قارن خصائص المواد واستخداماتها وحدودها قبل اختيار ما يلائم الموقع وظروفه.", mediaId: "", imageAlt: "" },
    intro: { title: "اختيار المادة يبدأ من ظروف الموقع", description: "اختيار المادة لا يعتمد على الشكل وحده. الحرارة، التعرض للشمس، الاستخدام، والصيانة المطلوبة كلها عوامل تساعد على تحديد الخيار الأنسب للموقع." },
  },
} as const;

export const pageKeySchema = z.nativeEnum(PageKey);
export const pageIdSchema = z.object({ pageId: z.string().cuid(), key: pageKeySchema });
export const pageSeoSchema = cmsSeoFieldsSchema;

const required = (message: string) => text.min(1, message);
export const homePagePublishSchema = homePageDraftSchema.extend({
  hero: homePageDraftSchema.shape.hero.extend({ title: required("أدخل عنوان القسم الرئيسي."), description: required("أدخل وصف القسم الرئيسي."), primaryCtaText: required("أدخل نص الإجراء الرئيسي."), primaryCtaTarget: safeTarget, secondaryCtaTarget: optionalSafeTarget }),
  valueProposition: homePageDraftSchema.shape.valueProposition.unwrap().extend({ ctaUrl: optionalSafeTarget }).default(defaultValueProposition),
  finalCta: homePageDraftSchema.shape.finalCta.extend({ target: optionalSafeTarget }),
}).superRefine((data, context) => {
  if (data.finalCta.enabled && !data.finalCta.title?.trim()) context.addIssue({ code: "custom", message: "أدخل عنوان الدعوة الختامية.", path: ["finalCta", "title"] });
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
export const faqPagePublishSchema = faqPageDraftSchema.extend({
  hero: faqPageDraftSchema.shape.hero.extend({
    title: required("أدخل عنوان الصفحة."),
    description: required("أدخل وصف الصفحة."),
  }),
});
export const listingPagePublishSchema = listingPageDraftSchema.extend({
  hero: listingPageDraftSchema.shape.hero.extend({
    pageTitle: required("أدخل عنوان الصفحة.").max(120),
    shortDescription: required("أدخل الوصف المختصر.").max(240),
  }),
  intro: listingPageDraftSchema.shape.intro.extend({
    description: required("أدخل وصف مقدمة الصفحة.").max(2000),
  }),
});
export const projectsListingPagePublishSchema = listingPageDraftSchema.extend({
  hero: listingPageDraftSchema.shape.hero.extend({
    pageTitle: required("أدخل عنوان الصفحة.").max(120),
    shortDescription: required("أدخل الوصف المختصر.").max(240),
  }),
});

export const pageDraftSchemas = { HOME: homePageDraftSchema, ABOUT: aboutPageDraftSchema, CONTACT: contactPageDraftSchema, PRICES: pricesPageDraftSchema, FAQS: faqPageDraftSchema, PROJECTS: listingPageDraftSchema, SERVICES: listingPageDraftSchema, SOLUTIONS: listingPageDraftSchema, GUIDES: listingPageDraftSchema, MATERIALS: listingPageDraftSchema } as const;
export const pagePublishSchemas = { HOME: homePagePublishSchema, ABOUT: aboutPagePublishSchema, CONTACT: contactPagePublishSchema, PRICES: pricesPagePublishSchema, FAQS: faqPagePublishSchema, PROJECTS: projectsListingPagePublishSchema, SERVICES: listingPagePublishSchema, SOLUTIONS: listingPagePublishSchema, GUIDES: listingPagePublishSchema, MATERIALS: listingPagePublishSchema } as const;

export type HomePageData = z.infer<typeof homePageDraftSchema>;
export type AboutPageData = z.infer<typeof aboutPageDraftSchema>;
export type ContactPageData = z.infer<typeof contactPageDraftSchema>;
export type PricesPageData = z.infer<typeof pricesPageDraftSchema>;
export type FaqPageData = z.infer<typeof faqPageDraftSchema>;
export type ListingPageData = z.infer<typeof listingPageDraftSchema>;
export type StaticPageData = HomePageData | AboutPageData | ContactPageData | PricesPageData | FaqPageData | ListingPageData;
