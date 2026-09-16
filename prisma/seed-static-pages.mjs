import { ArticleType, ContentStatus, PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

loadEnv();

const prisma = new PrismaClient();
const now = new Date();
const seedKey = "static-pages-v1";
const forceSeed = process.env.FORCE_STATIC_PAGE_SEED === "true";

async function main() {
  await ensureSeedTable();
  if (!forceSeed && await hasSeedRun(seedKey)) {
    console.log("Static pages seed already ran. Set FORCE_STATIC_PAGE_SEED=true to run it again.");
    return;
  }

  const selections = await getSelections();
  const pages = buildPages(selections);

  await prisma.$transaction(async (tx) => {
    for (const page of pages) {
      await upsertPublishedPage(tx, page);
    }
  });

  await recordSeedRun(seedKey);

  console.log(`Seeded ${pages.length} static pages.`);
}

async function ensureSeedTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_AppSeed" (
      "key" TEXT PRIMARY KEY,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function hasSeedRun(key) {
  const rows = await prisma.$queryRawUnsafe(`SELECT "key" FROM "_AppSeed" WHERE "key" = $1 LIMIT 1`, key);
  return rows.length > 0;
}

async function recordSeedRun(key) {
  await prisma.$executeRawUnsafe(`INSERT INTO "_AppSeed" ("key") VALUES ($1) ON CONFLICT ("key") DO NOTHING`, key);
}

async function getSelections() {
  const [services, solutions, projects, faqs, pricingArticles] = await Promise.all([
    prisma.service.findMany({ where: published(), select: { id: true }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 5 }),
    prisma.solution.findMany({ where: published(), select: { id: true }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 4 }),
    prisma.project.findMany({ where: published(), select: { id: true }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 5 }),
    prisma.fAQ.findMany({ where: published(), select: { id: true, publishedVersion: { select: { sortOrder: true } }, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 10 }),
    prisma.article.findMany({ where: { ...published(), publishedVersion: { articleType: ArticleType.PRICING } }, select: { id: true }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 3 }),
  ]);

  return {
    serviceIds: services.map((item) => item.id),
    solutionIds: solutions.map((item) => item.id),
    projectIds: projects.map((item) => item.id),
    faqIds: faqs.sort((a, b) => (a.publishedVersion?.sortOrder ?? 999) - (b.publishedVersion?.sortOrder ?? 999)).map((item) => item.id),
    pricingArticleIds: pricingArticles.map((item) => item.id),
  };
}

function published() {
  return { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } };
}

function buildPages({ serviceIds, solutionIds, projectIds, faqIds, pricingArticleIds }) {
  return [
    {
      key: "HOME",
      seoTitle: "رواق شيدز | مظلات وسواتر وبرجولات في جدة",
      seoDescription: "تصميم وتنفيذ مظلات وسواتر وبرجولات في جدة بخامات مناسبة للمناخ، معاينة واضحة، وتنفيذ مرتب للمنازل والمنشآت.",
      data: {
        hero: {
          eyebrow: "رواق شيدز للتظليل الخارجي",
          title: "مظلات وسواتر وبرجولات مصممة لمناخ جدة",
          description: "نساعدك في تحويل المواقف، الأحواش، الأسطح، الجلسات الخارجية، ومداخل المنشآت إلى مساحات أكثر راحة واستخداماً بتصميم مناسب وتنفيذ واضح من المعاينة حتى التسليم.",
          primaryCtaText: "اطلب معاينة عبر واتساب",
          primaryCtaTarget: "/contact",
          secondaryCtaText: "شاهد المشاريع",
          secondaryCtaTarget: "/projects",
          mediaId: "",
          imageAlt: "مظلات خارجية منفذة في جدة",
        },
        featuredServices: {
          title: "خدمات تنفيذ تغطي احتياج الموقع بالكامل",
          description: "من مظلات السيارات والجلسات إلى السواتر والبرجولات، نختار النظام المناسب حسب المساحة والاستخدام وطابع المكان.",
          selectedServiceIds: serviceIds,
        },
        featuredSolutions: {
          title: "حلول عملية حسب نوع المساحة",
          description: "نرتب خيارات التظليل حسب استخدام الموقع: مواقف، أحواش، مدارس، مداخل، جلسات خارجية، أو منشآت تجارية.",
          selectedSolutionIds: solutionIds,
        },
        valueProposition: {
          enabled: true,
          eyebrow: "لماذا رواق شيدز؟",
          heading: "تنفيذ واضح، خامات مناسبة، وشكل يليق بالمكان",
          description: "لا نعتمد على حل واحد لكل المواقع. نبدأ بفهم المساحة واتجاه الشمس وطريقة الاستخدام، ثم نقترح التصميم والخامة وطريقة التثبيت المناسبة.",
          mediaId: "",
          ctaLabel: "تعرف علينا أكثر",
          ctaUrl: "/about",
          items: [
            item("vp-climate", "مواد مناسبة لأجواء جدة", "خيارات تتحمل الشمس والرطوبة والاستخدام الخارجي اليومي.", "climate", 1),
            item("vp-design", "تصميم حسب المقاس", "نضبط الأبعاد والتفاصيل بما يناسب الموقع والواجهة.", "design", 2),
            item("vp-team", "فريق تنفيذ متخصص", "قياس وتركيب وتشطيب منظم مع متابعة مراحل العمل.", "team", 3),
            item("vp-clear", "عرض واضح قبل التنفيذ", "نوضح نطاق العمل والخامات والخطوات قبل بدء المشروع.", "shield", 4),
          ],
        },
        featuredProjects: {
          enabled: true,
          eyebrow: "مشاريع مختارة",
          title: "أعمال تعكس جودة التنفيذ على أرض الواقع",
          description: "نماذج من مشاريع المظلات والتظليل في جدة، توضح اختلاف الاحتياجات بين المنازل والمرافق والمساحات التجارية.",
          ctaLabel: "عرض جميع المشاريع",
          ctaHref: "/projects",
          selectedProjectIds: projectIds,
        },
        howWeWork: {
          enabled: true,
          eyebrow: "طريقة العمل",
          title: "خطوات مختصرة من الطلب إلى التسليم",
          description: "نعمل بطريقة واضحة تساعدك على معرفة ما سيحدث في كل مرحلة قبل بدء التنفيذ.",
          steps: [
            step("process-contact", "استلام الطلب", "ترسل لنا نوع المساحة والاحتياج والصور أو الموقع التقريبي.", 1),
            step("process-inspection", "المعاينة والقياس", "نراجع الأبعاد واتجاه الشمس ونقاط التثبيت المناسبة.", 2),
            step("process-offer", "العرض والتفاصيل", "نقترح الخامة والتصميم ونوضح نطاق العمل والتكلفة المتوقعة.", 3),
            step("process-install", "التنفيذ والتسليم", "يتم التركيب ومراجعة التشطيب قبل تسليم الموقع للاستخدام.", 4),
          ],
        },
        trustSection: {
          enabled: true,
          eyebrow: "ثقة في التفاصيل",
          title: "نركز على ما يجعل المظلة عملية بعد التركيب",
          description: "الشكل مهم، لكن الأهم أن تكون المظلة مناسبة للمكان، ثابتة، مريحة في الاستخدام، وسهلة المتابعة بعد التنفيذ.",
          items: [
            { title: "معاينة قبل العرض", description: "نفهم الموقع قبل تثبيت الاختيار.", icon: "location" },
            { title: "خامات واضحة", description: "نوضح نوع الخامة وحدود استخدامها.", icon: "settings" },
            { title: "تنفيذ مرتب", description: "تشطيب ونظافة ومتابعة عند التسليم.", icon: "shield" },
          ],
          featuredProof: {
            title: "حلول تظليل للاستخدام اليومي وليس للصورة فقط",
            description: "نوازن بين الظل، التهوية، الشكل، وطريقة تثبيت مناسبة لطبيعة الموقع، خصوصاً في المساحات المعرضة للشمس أغلب اليوم.",
            mediaId: "",
          },
          metrics: [
            metric("proof-jeddah", "نخدم جدة", "داخل نطاق أحياء جدة والمناطق القريبة.", "جدة", "location", 1),
            metric("proof-sites", "مواقع متعددة", "منازل، فلل، مدارس، مواقف، ومنشآت.", "سكني وتجاري", "settings", 2),
            metric("proof-team", "فريق متخصص", "متابعة من القياس حتى التسليم.", "تنفيذ منظم", "team", 3),
            metric("proof-warranty", "وضوح في الاتفاق", "نطاق عمل وخامات وخطوات قبل البدء.", "بدون غموض", "shield", 4),
          ],
          stripItems: [
            item("trust-materials", "خامات مناسبة", "", "settings", 1),
            item("trust-installation", "تركيب متخصص", "", "team", 2),
            item("trust-followup", "متابعة واضحة", "", "shield", 3),
          ],
        },
        faqSection: {
          enabled: true,
          eyebrow: "قبل أن تبدأ",
          title: "أسئلة شائعة قبل طلب مظلة أو ساتر",
          description: "إجابات سريعة تساعدك على تحديد الخطوة التالية قبل التواصل معنا.",
          allFaqsLabel: "عرض كل الأسئلة",
          allFaqsHref: "/faqs",
          selectedFaqIds: faqIds,
        },
        finalCta: {
          enabled: true,
          eyebrow: "ابدأ من هنا",
          title: "أرسل تفاصيل موقعك ونقترح عليك الحل المناسب",
          description: "شاركنا نوع المساحة، الموقع، الأبعاد التقريبية، وصور المكان إن وجدت، وسنرد عليك بالخطوة الأنسب.",
          backgroundMediaId: "",
          primaryCtaLabel: "تواصل عبر واتساب",
          secondaryCtaLabel: "اتصل بنا",
          trustItems: [
            item("cta-response", "استجابة سريعة", "", "team", 1),
            item("cta-inspection", "معاينة عند الحاجة", "", "location", 2),
            item("cta-clear-offer", "عرض واضح", "", "settings", 3),
          ],
          buttonText: "تواصل الآن",
          target: "/contact",
        },
      },
    },
    {
      key: "ABOUT",
      seoTitle: "من نحن | رواق شيدز للمظلات في جدة",
      seoDescription: "تعرف على رواق شيدز، فريق متخصص في تصميم وتنفيذ المظلات والسواتر والبرجولات في جدة للمنازل والمنشآت.",
      data: {
        hero: {
          title: "فريق يعتني بتفاصيل التظليل من الفكرة إلى التنفيذ",
          description: "رواق شيدز تعمل في تصميم وتنفيذ حلول التظليل الخارجي في جدة، مع تركيز على فهم الموقع، اختيار الخامة المناسبة، وتنفيذ مرتب يخدم الاستخدام اليومي.",
          mediaId: "",
        },
        companyStory: {
          title: "قصتنا مع المساحات الخارجية في جدة",
          content: "بدأت فكرة رواق شيدز من حاجة واضحة في جدة: مساحات خارجية جميلة لكنها لا تُستخدم بالشكل الكافي بسبب الشمس والحرارة. لذلك نركز على تحويل المواقف والأحواش والجلسات والمداخل إلى أماكن أكثر راحة دون إهمال شكل المكان أو تفاصيل التنفيذ.\n\nنؤمن أن نجاح المظلة لا يعتمد على تركيب الغطاء فقط، بل على فهم اتجاه الشمس، طبيعة الاستخدام، نقاط التثبيت، الخامة المناسبة، والتشطيب النهائي.",
        },
        values: {
          title: "ما نلتزم به في كل مشروع",
          items: [
            { title: "وضوح قبل البدء", description: "نشرح الخيارات والتفاصيل قبل اعتماد التنفيذ.", icon: "shield" },
            { title: "حل يناسب الموقع", description: "لا نكرر نفس الحل لكل مساحة، بل نختار حسب الاستخدام.", icon: "design" },
            { title: "تنفيذ مرتب", description: "نهتم بالتثبيت والتشطيب ونظافة العمل عند التسليم.", icon: "settings" },
            { title: "تواصل عملي", description: "متابعة واضحة من الطلب حتى إنجاز العمل.", icon: "team" },
          ],
        },
        capabilities: {
          title: "ما نستطيع تنفيذه",
          content: "ننفذ مظلات سيارات، مظلات أحواش وجلسات، سواتر خصوصية، برجولات، تغطيات مداخل، وحلول تظليل للمنازل والمنشآت. كما نساعد في اختيار الخامة والشكل المناسبين حسب مساحة الموقع والميزانية المتوقعة.",
        },
        finalCta: {
          title: "هل لديك مساحة تحتاج إلى تظليل؟",
          description: "أرسل لنا تفاصيل الموقع وسنساعدك في تحديد الخيار الأنسب.",
          buttonText: "تواصل معنا",
          target: "/contact",
        },
      },
    },
    {
      key: "CONTACT",
      seoTitle: "تواصل معنا | رواق شيدز جدة",
      seoDescription: "تواصل مع رواق شيدز لطلب معاينة أو عرض سعر لمظلات وسواتر وبرجولات في جدة.",
      data: {
        hero: {
          title: "تواصل معنا لطلب معاينة أو عرض سعر",
          description: "أرسل تفاصيل المساحة أو صور الموقع، وسنساعدك في اختيار حل التظليل المناسب لمنزلك أو منشأتك في جدة.",
        },
        contactIntro: {
          title: "أقرب طريق لفهم احتياجك",
          description: "كلما كانت التفاصيل أوضح، كان اقتراح الحل أدق. يمكنك إرسال نوع المساحة، الأبعاد التقريبية، الحي، وصور المكان عبر واتساب.",
        },
        showPhone: true,
        showWhatsapp: true,
        showEmail: true,
        showAddress: true,
        showBusinessHours: true,
        finalCta: {
          title: "جاهز لمناقشة مشروعك؟",
          description: "ابدأ برسالة قصيرة وسنرتب معك الخطوة التالية حسب احتياج الموقع.",
        },
      },
    },
    {
      key: "PRICES",
      seoTitle: "أسعار المظلات في جدة | عوامل التكلفة وطلب العرض",
      seoDescription: "تعرف على العوامل التي تؤثر على أسعار المظلات والسواتر والبرجولات في جدة وكيف تطلب تقديراً مناسباً لموقعك.",
      data: {
        hero: {
          title: "أسعار المظلات في جدة تعتمد على تفاصيل الموقع",
          description: "السعر يتغير حسب المساحة، الخامة، التصميم، طريقة التثبيت، ومتطلبات التنفيذ. هذه الصفحة تساعدك على فهم العوامل قبل طلب عرض سعر.",
        },
        intro: {
          title: "لماذا لا يوجد سعر ثابت لكل مظلة؟",
          content: "تختلف مواقع التنفيذ بشكل كبير: موقف سيارة صغير، فناء واسع، جلسة خارجية، مدخل منشأة، أو ساحة مدرسة. لذلك نحتاج إلى معرفة الأبعاد، نوع الاستخدام، الخامة المطلوبة، وطبيعة التثبيت قبل إعطاء تقدير مناسب.\n\nهدفنا أن يكون العرض واضحاً ويشرح نطاق العمل والخامات والتفاصيل المؤثرة على التكلفة، بدلاً من رقم عام لا يناسب الواقع.",
        },
        pricingFactors: {
          title: "أهم عوامل تحديد السعر",
          items: [
            { title: "المساحة والأبعاد", description: "كلما زادت المساحة وتفاصيل القياس تغيرت كمية الخامات والعمل.", icon: "settings" },
            { title: "نوع الخامة", description: "تختلف التكلفة بين القماش، الشبك، المعدن، الخشب البديل، أو الحلول المركبة.", icon: "climate" },
            { title: "طريقة التثبيت", description: "الجدران، الأعمدة، القواعد، أو الهياكل المستقلة تؤثر في التنفيذ.", icon: "design" },
            { title: "مستوى التشطيب", description: "الألوان، الإكسسوارات، التفاصيل الجمالية، ومتطلبات الموقع تغير السعر النهائي.", icon: "shield" },
          ],
        },
        selectedPricingArticleIds: pricingArticleIds,
        faqSection: { selectedFaqIds: faqIds },
        finalCta: {
          title: "احصل على تقدير يناسب موقعك",
          description: "أرسل الأبعاد أو صور المساحة وسنوضح لك الخيارات المناسبة والتكلفة المتوقعة.",
          buttonText: "طلب عرض سعر",
          target: "/contact",
        },
      },
    },
    {
      key: "FAQS",
      seoTitle: "الأسئلة الشائعة | مظلات وسواتر جدة",
      seoDescription: "إجابات على الأسئلة الشائعة حول المظلات والسواتر والبرجولات في جدة، الأسعار، المعاينة، الخامات، ومدة التنفيذ.",
      data: {
        hero: {
          title: "الأسئلة الشائعة",
          description: "إجابات واضحة عن أكثر الأسئلة شيوعاً قبل طلب مظلة أو ساتر أو برجولة في جدة.",
        },
        faqSection: { selectedFaqIds: faqIds },
      },
    },
    listingPage("PROJECTS", "مشاريع مظلات وسواتر نفذناها في جدة", "مشاريعنا", "نماذج من أعمال رواق شيدز في المظلات والسواتر والبرجولات للمنازل والمنشآت.", "أعمال تساعدك على تصور النتيجة", "استعرض نماذج من المشاريع المنفذة أو التجريبية لفهم أشكال التظليل المختلفة، تفاصيل التنفيذ، وطريقة توظيف الحلول حسب طبيعة الموقع.", "مشاريع رواق شيدز | مظلات وسواتر في جدة", "نماذج مشاريع مظلات وسواتر وبرجولات في جدة توضح جودة التنفيذ وتنوع الحلول."),
    listingPage("SERVICES", "خدمات مظلات وسواتر وبرجولات في جدة", "خدماتنا", "خدمات تنفيذ متكاملة للمظلات والسواتر والبرجولات للمنازل والمنشآت.", "خدمات تبدأ من فهم الموقع وتنتهي بتسليم جاهز", "نقدم خدمات تصميم وتنفيذ مظلات السيارات، مظلات الأحواش والجلسات، السواتر، البرجولات، وتغطيات المداخل، مع اختيار الخامة والتفاصيل حسب طبيعة الاستخدام.", "خدمات رواق شيدز | مظلات وسواتر جدة", "خدمات تركيب وتصميم مظلات وسواتر وبرجولات في جدة للمنازل والمواقف والمنشآت."),
    listingPage("SOLUTIONS", "حلول تظليل تناسب كل مساحة", "حلولنا", "اختر حل التظليل المناسب حسب نوع الموقع وطريقة الاستخدام.", "كل مساحة تحتاج حلاً مختلفاً", "نرتب حلول التظليل حسب الاستخدام: مواقف سيارات، جلسات خارجية، مدارس، منشآت، مداخل، وأسوار خصوصية، حتى تصل إلى الخيار الأقرب لاحتياجك.", "حلول التظليل في جدة | رواق شيدز", "حلول مظلات وسواتر وبرجولات مصممة حسب احتياج الموقع في جدة."),
  ];
}

function listingPage(key, pageTitle, eyebrow, shortDescription, title, description, seoTitle, seoDescription) {
  return {
    key,
    seoTitle,
    seoDescription,
    data: {
      hero: { pageTitle, eyebrow, shortDescription, mediaId: "", imageAlt: "" },
      intro: { title, description },
    },
  };
}

function item(id, title, description, icon, order) {
  return { id, title, description, icon, order, enabled: true };
}

function step(id, title, description, order) {
  return { id, title, description, mediaId: "", imageAlt: "", order, enabled: true };
}

function metric(id, title, description, value, icon, order) {
  return { id, title, description, value, icon, order, enabled: true };
}

async function upsertPublishedPage(tx, { key, data, seoTitle, seoDescription }) {
  const existing = await tx.page.findUnique({
    where: { key },
    include: { draftVersion: true, publishedVersion: true },
  });

  const page = existing ?? await tx.page.create({ data: { key, status: ContentStatus.DRAFT }, include: { draftVersion: true, publishedVersion: true } });
  const versionData = { data, seoTitle, seoDescription, noIndex: false };
  const draft = page.draftVersion
    ? await tx.pageVersion.update({ where: { id: page.draftVersion.id }, data: versionData })
    : await tx.pageVersion.create({ data: { pageId: page.id, ...versionData } });
  const published = page.publishedVersion
    ? await tx.pageVersion.update({ where: { id: page.publishedVersion.id }, data: versionData })
    : await tx.pageVersion.create({ data: { pageId: page.id, ...versionData } });

  await tx.page.update({
    where: { id: page.id },
    data: {
      draftVersionId: draft.id,
      publishedVersionId: published.id,
      publishedAt: page.publishedAt ?? now,
      status: ContentStatus.PUBLISHED,
    },
  });
}

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    const rawValue = match[2].replace(/^(['"])(.*)\1$/, "$2");
    process.env[match[1]] = rawValue;
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
