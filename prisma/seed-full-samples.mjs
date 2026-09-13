import { PrismaClient, ContentStatus, ArticleType } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

loadEnv();

const prisma = new PrismaClient();
const now = new Date();

const mediaItems = [
  {
    key: "service",
    url: "/sample-content/full-service.svg",
    originalFilename: "full-service.svg",
    width: 1600,
    height: 1200,
    altText: "صورة توضيحية لخدمة تركيب مظلة خارجية بهيكل معدني وقماش مشدود.",
    caption: "نموذج بصري يوضح حضور المظلة وحجم التغطية في الموقع.",
  },
  {
    key: "solution",
    url: "/sample-content/full-solution.svg",
    originalFilename: "full-solution.svg",
    width: 1600,
    height: 1200,
    altText: "صورة توضيحية لحل جلسة خارجية تجمع التظليل والخصوصية.",
    caption: "دمج التظليل مع الخصوصية في منطقة استخدام خارجية.",
  },
  {
    key: "projectCover",
    url: "/sample-content/full-project-cover.svg",
    originalFilename: "full-project-cover.svg",
    width: 1800,
    height: 1200,
    altText: "صورة غلاف لمشروع مظلة خارجية مكتملة في جدة.",
    caption: "مشروع نموذجي مكتمل لاختبار عرض صفحة تفاصيل المشروع بكل عناصرها.",
  },
  {
    key: "galleryOne",
    url: "/sample-content/full-project-gallery-1.svg",
    originalFilename: "full-project-gallery-1.svg",
    width: 1600,
    height: 1067,
    altText: "تفصيل للهيكل المعدني قبل تركيب الغطاء النهائي.",
    caption: "توزيع نقاط التثبيت ومسارات الحمل قبل إغلاق الغطاء.",
  },
  {
    key: "galleryTwo",
    url: "/sample-content/full-project-gallery-2.svg",
    originalFilename: "full-project-gallery-2.svg",
    width: 1600,
    height: 1200,
    altText: "تفصيل قماش مظلة خارجي مشدود فوق مساحة مفتوحة.",
    caption: "اختبار شد القماش واتجاه التصريف قبل التسليم.",
  },
];

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    const media = Object.fromEntries(await Promise.all(mediaItems.map(async (item) => [item.key, await ensureMedia(tx, item)])));
    const category = await ensureProjectCategory(tx);
    const faq = await ensureFaq(tx);
    const material = await ensureMaterial(tx, media.solution.id);
    const article = await ensureArticle(tx, media.projectCover.id);

    const service = await ensureService(tx, media.service.id);
    const solution = await ensureSolution(tx, media.solution.id);
    const project = await ensureProject(tx, category.id, media.projectCover.id);

    await attachServiceRelations(tx, service.draft.id, service.published.id, { solutionId: solution.entity.id, materialId: material.entity.id, projectId: project.entity.id, articleId: article.entity.id, faqId: faq.entity.id });
    await attachSolutionRelations(tx, solution.draft.id, solution.published.id, { serviceId: service.entity.id, materialId: material.entity.id, projectId: project.entity.id, articleId: article.entity.id, faqId: faq.entity.id });
    await attachProjectRelations(tx, project.draft.id, project.published.id, { serviceId: service.entity.id, solutionId: solution.entity.id, materialId: material.entity.id, articleId: article.entity.id });
    await attachProjectGallery(tx, project.draft.id, project.published.id, [media.projectCover, media.galleryOne, media.galleryTwo]);

    return {
      service: service.published.slug,
      solution: solution.published.slug,
      project: project.published.slug,
      material: material.published.slug,
      article: article.published.slug,
    };
  });

  console.log(JSON.stringify(result, null, 2));
}

async function ensureService(tx, heroMediaId) {
  const data = {
    title: "خدمة كاملة: تصميم وتركيب مظلات خارجية في جدة",
    slug: "sample-full-shade-service",
    shortDescription: "صفحة خدمة تجريبية مكتملة تعرض العنوان، الوصف، الصورة، المحتوى الطويل، العلاقات، الأسئلة الشائعة، وبيانات SEO.",
    content: [
      "هذه خدمة تجريبية منشورة لاختبار التصميم الكامل لصفحات الخدمات في الموقع. تعرض الصفحة كيفية ظهور المحتوى عندما تتوفر صورة رئيسية، وصف واضح، شرح تفصيلي، وروابط مرتبطة بحلول ومشاريع ومواد وأدلة.",
      "يشمل نطاق الخدمة دراسة مساحة الموقع، تحديد اتجاه الشمس والرياح، اختيار نظام التثبيت المناسب، ثم تنفيذ الهيكل والغطاء وفق الاستخدام المطلوب. النص هنا طويل نسبياً حتى تظهر المسافات، عرض السطور، وسلوك القراءة في الصفحة العامة.",
      "يمكن استخدام هذه الصفحة كمرجع بصري قبل إدخال المحتوى الحقيقي من لوحة التحكم، مع الانتباه إلى عدم اعتبار البيانات هنا مشروعاً منفذاً أو سعراً حقيقياً.",
    ].join("\n\n"),
    heroMediaId,
    seoTitle: "خدمة كاملة لتجربة صفحة تركيب المظلات في جدة",
    seoDescription: "بيانات تجريبية مكتملة لاختبار تصميم صفحة خدمة تركيب المظلات والعلاقات المرتبطة بها.",
    canonicalUrl: "",
    noIndex: true,
    openGraphTitle: "تجربة صفحة خدمة كاملة",
    openGraphDescription: "صفحة خدمة منشورة بكامل الحقول لاختبار التصميم.",
    openGraphImageId: heroMediaId,
  };
  return ensureVersioned(tx, "service", "serviceVersion", "serviceId", data.slug, data);
}

async function ensureSolution(tx, heroMediaId) {
  const data = {
    title: "حل كامل: جلسة خارجية مظللة بخصوصية عالية",
    slug: "sample-full-outdoor-solution",
    shortDescription: "حل تجريبي مكتمل يوضح كيف تظهر صفحة الحل عند توفر صورة ومحتوى وعلاقات بخدمة ومشروع ومواد وأسئلة.",
    content: [
      "هذا الحل التجريبي يصف حالة شائعة: مساحة خارجية تحتاج إلى تقليل الشمس المباشرة وتحسين الخصوصية مع الحفاظ على تهوية واستخدام يومي مريح.",
      "يعرض التصميم العام كيف يمكن ربط الحل بخدمة التنفيذ المناسبة، المادة المقترحة، مشروع مشابه، ودليل يساعد الزائر على فهم القرار قبل التواصل.",
      "الغرض من هذه البيانات هو اختبار امتلاء الواجهة، وليس تمثيل عرض تجاري نهائي أو مواصفة إلزامية.",
    ].join("\n\n"),
    heroMediaId,
    seoTitle: "حل جلسة خارجية مظللة - بيانات تجريبية",
    seoDescription: "حل تجريبي منشور بكامل العلاقات لاختبار صفحة الحلول في الموقع.",
    canonicalUrl: "",
    noIndex: true,
    openGraphTitle: "تجربة صفحة حل كاملة",
    openGraphDescription: "صفحة حل تجريبية تعرض العلاقات والصورة والمحتوى.",
    openGraphImageId: heroMediaId,
  };
  return ensureVersioned(tx, "solution", "solutionVersion", "solutionId", data.slug, data);
}

async function ensureProject(tx, categoryId, coverMediaId) {
  const data = {
    title: "مشروع كامل: مظلة فناء سكني في شمال جدة",
    slug: "sample-full-jeddah-shade-project",
    shortDescription: "مشروع تجريبي منشور بكامل الحقول لاختبار الغلاف، بيانات الموقع، التحدي، الحل، التفاصيل الفنية، المعرض، والعلاقات.",
    content: "تم إعداد هذا المشروع التجريبي لإظهار صفحة المشروع عند توفر جميع البيانات الأساسية. يعرض الغلاف، نبذة المشروع، بيانات الموقع وتاريخ الإنجاز، أقسام التحدي والحل، التفاصيل الفنية، معرض الصور، والروابط المرتبطة.",
    challenge: "كان الهدف التجريبي هو تغطية مساحة فناء مفتوحة مع تقليل الشمس المباشرة وقت الظهيرة، والمحافظة على حركة الهواء، وترك مسار واضح للحركة اليومية حول الجلسة.",
    solutionSummary: "تم اختيار تكوين مظلة مشدودة على هيكل معدني واضح النقاط، مع مراعاة اتجاه الظل، أماكن التثبيت، ومسار تصريف المياه حتى تظهر الصفحة بأقسامها الكاملة.",
    technicalDetails: "هيكل معدني خارجي، نقاط تثبيت موزعة، غطاء مقاوم للاستخدام الخارجي، ميل خفيف للتصريف، ومعرض صور يوضح الغلاف والتفاصيل. هذه مواصفات تجريبية وليست مواصفة مشروع حقيقي.",
    completedAt: new Date("2026-05-15T00:00:00.000Z"),
    city: "جدة",
    district: "أبحر الشمالية",
    categoryId,
    coverMediaId,
    seoTitle: "مشروع مظلة فناء سكني في جدة - تجربة كاملة",
    seoDescription: "مشروع تجريبي منشور بكامل الحقول لاختبار تصميم صفحة تفاصيل المشاريع.",
    canonicalUrl: "",
    noIndex: true,
    openGraphTitle: "تجربة صفحة مشروع كاملة",
    openGraphDescription: "مشروع تجريبي بكامل الأقسام والمعرض والعلاقات.",
    openGraphImageId: coverMediaId,
  };
  return ensureVersioned(tx, "project", "projectVersion", "projectId", data.slug, data);
}

async function ensureMaterial(tx, heroMediaId) {
  const data = {
    name: "مادة تجريبية: قماش خارجي مشدود",
    slug: "sample-full-shade-material",
    shortDescription: "مادة داعمة تجريبية لملء علاقات صفحات الخدمة والحل والمشروع.",
    content: "هذه مادة تجريبية تساعد على إظهار قسم المواد المرتبطة في صفحات الخدمة والحل والمشروع.",
    advantages: ["مناسب للتظليل الخارجي", "يعطي حضوراً بصرياً واضحاً", "يدعم اختبار العلاقات في الواجهة"],
    limitations: ["بيانات تجريبية وليست مواصفة فنية نهائية"],
    maintenanceNotes: "تنظف الأسطح دورياً حسب تعليمات المادة المستخدمة فعلياً.",
    recommendedUses: ["الأفنية", "الجلسات الخارجية", "مواقف السيارات"],
    heroMediaId,
    seoTitle: "مادة تجريبية لاختبار علاقات المحتوى",
    seoDescription: "مادة منشورة تجريبية مرتبطة بالعناصر الكاملة.",
    noIndex: true,
    openGraphImageId: heroMediaId,
  };
  return ensureVersioned(tx, "material", "materialVersion", "materialId", data.slug, data);
}

async function ensureArticle(tx, heroMediaId) {
  const content = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "دليل تجريبي مرتبط بالصفحات الكاملة لاختبار ظهور الأدلة المرتبطة في الواجهة العامة." }] }] };
  const data = {
    title: "دليل تجريبي لاختيار مظلة خارجية",
    slug: "sample-full-shade-guide",
    excerpt: "دليل داعم تجريبي يظهر ضمن العلاقات المرتبطة.",
    content,
    heroMediaId,
    articleType: ArticleType.GUIDE,
    seoTitle: "دليل تجريبي لاختبار العلاقات",
    seoDescription: "دليل منشور تجريبي مرتبط بالخدمة والحل والمشروع.",
    noIndex: true,
    openGraphImageId: heroMediaId,
  };
  return ensureVersioned(tx, "article", "articleVersion", "articleId", data.slug, data);
}

async function ensureFaq(tx) {
  const data = {
    question: "هل هذه البيانات التجريبية تمثل مشروعاً حقيقياً؟",
    answer: "لا، هذه بيانات مكتملة لاختبار تصميم الصفحات والعلاقات فقط، ويمكن استبدالها لاحقاً بمحتوى حقيقي من لوحة التحكم.",
    sortOrder: 1,
  };
  return ensureVersioned(tx, "fAQ", "fAQVersion", "faqId", data.question, data, { question: data.question });
}

async function ensureVersioned(tx, entityModel, versionModel, foreignKey, uniqueValue, versionData, lookup = { slug: uniqueValue }) {
  const entity = await tx[entityModel].findFirst({ where: { versions: { some: lookup } }, include: { draftVersion: true, publishedVersion: true } })
    ?? await tx[entityModel].create({ data: { status: ContentStatus.DRAFT }, include: { draftVersion: true, publishedVersion: true } });

  const draft = entity.draftVersion
    ? await tx[versionModel].update({ where: { id: entity.draftVersion.id }, data: versionData })
    : await tx[versionModel].create({ data: { ...versionData, [foreignKey]: entity.id } });
  const published = entity.publishedVersion
    ? await tx[versionModel].update({ where: { id: entity.publishedVersion.id }, data: versionData })
    : await tx[versionModel].create({ data: { ...versionData, [foreignKey]: entity.id } });

  const updated = await tx[entityModel].update({
    where: { id: entity.id },
    data: { draftVersionId: draft.id, publishedVersionId: published.id, publishedAt: entity.publishedAt ?? now, status: ContentStatus.PUBLISHED },
  });

  return { entity: updated, draft, published };
}

async function ensureMedia(tx, item) {
  return await tx.media.findFirst({ where: { url: item.url } }) ?? await tx.media.create({
    data: {
      type: "IMAGE",
      url: item.url,
      storagePath: item.url,
      originalFilename: item.originalFilename,
      storedFilename: item.originalFilename,
      mimeType: "image/svg+xml",
      sizeBytes: 4096,
      width: item.width,
      height: item.height,
      altText: item.altText,
      caption: item.caption,
    },
  });
}

async function ensureProjectCategory(tx) {
  return await tx.projectCategory.findFirst({ where: { slug: "sample-complete-projects" } }) ?? await tx.projectCategory.create({
    data: { name: "مشاريع تجريبية كاملة", slug: "sample-complete-projects", iconKey: "shade", description: "تصنيف مخصص لاختبار عرض المشروع الكامل.", isActive: true, sortOrder: 999 },
  });
}

async function attachServiceRelations(tx, draftVersionId, publishedVersionId, ids) {
  for (const serviceVersionId of [draftVersionId, publishedVersionId]) {
    await tx.serviceVersionSolution.deleteMany({ where: { serviceVersionId } });
    await tx.serviceVersionMaterial.deleteMany({ where: { serviceVersionId } });
    await tx.serviceVersionProject.deleteMany({ where: { serviceVersionId } });
    await tx.serviceVersionArticle.deleteMany({ where: { serviceVersionId } });
    await tx.serviceVersionFAQ.deleteMany({ where: { serviceVersionId } });
    await tx.serviceVersionSolution.create({ data: { serviceVersionId, solutionId: ids.solutionId } });
    await tx.serviceVersionMaterial.create({ data: { serviceVersionId, materialId: ids.materialId } });
    await tx.serviceVersionProject.create({ data: { serviceVersionId, projectId: ids.projectId } });
    await tx.serviceVersionArticle.create({ data: { serviceVersionId, articleId: ids.articleId } });
    await tx.serviceVersionFAQ.create({ data: { serviceVersionId, faqId: ids.faqId } });
  }
}

async function attachSolutionRelations(tx, draftVersionId, publishedVersionId, ids) {
  for (const solutionVersionId of [draftVersionId, publishedVersionId]) {
    await tx.solutionVersionService.deleteMany({ where: { solutionVersionId } });
    await tx.solutionVersionMaterial.deleteMany({ where: { solutionVersionId } });
    await tx.solutionVersionProject.deleteMany({ where: { solutionVersionId } });
    await tx.solutionVersionArticle.deleteMany({ where: { solutionVersionId } });
    await tx.solutionVersionFAQ.deleteMany({ where: { solutionVersionId } });
    await tx.solutionVersionService.create({ data: { solutionVersionId, serviceId: ids.serviceId } });
    await tx.solutionVersionMaterial.create({ data: { solutionVersionId, materialId: ids.materialId } });
    await tx.solutionVersionProject.create({ data: { solutionVersionId, projectId: ids.projectId } });
    await tx.solutionVersionArticle.create({ data: { solutionVersionId, articleId: ids.articleId } });
    await tx.solutionVersionFAQ.create({ data: { solutionVersionId, faqId: ids.faqId } });
  }
}

async function attachProjectRelations(tx, draftVersionId, publishedVersionId, ids) {
  for (const projectVersionId of [draftVersionId, publishedVersionId]) {
    await tx.projectVersionService.deleteMany({ where: { projectVersionId } });
    await tx.projectVersionSolution.deleteMany({ where: { projectVersionId } });
    await tx.projectVersionMaterial.deleteMany({ where: { projectVersionId } });
    await tx.projectVersionArticle.deleteMany({ where: { projectVersionId } });
    await tx.projectVersionService.create({ data: { projectVersionId, serviceId: ids.serviceId } });
    await tx.projectVersionSolution.create({ data: { projectVersionId, solutionId: ids.solutionId } });
    await tx.projectVersionMaterial.create({ data: { projectVersionId, materialId: ids.materialId } });
    await tx.projectVersionArticle.create({ data: { projectVersionId, articleId: ids.articleId } });
  }
}

async function attachProjectGallery(tx, draftVersionId, publishedVersionId, galleryMedia) {
  for (const projectVersionId of [draftVersionId, publishedVersionId]) {
    await tx.projectVersionGallery.deleteMany({ where: { projectVersionId } });
    for (const [index, media] of galleryMedia.entries()) {
      await tx.projectVersionGallery.create({ data: { projectVersionId, mediaId: media.id, sortOrder: index + 1, caption: media.caption } });
    }
  }
}

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
