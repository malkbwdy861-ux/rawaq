import { PrismaClient, ContentStatus } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

loadEnv();

const prisma = new PrismaClient();

const initialFaqs = [
  {
    question: "ما هي أنواع المظلات التي توفرونها في جدة؟",
    answer: "نوفر مجموعة متنوعة من المظلات في جدة، تشمل مظلات السيارات، مظلات الحدائق والجلسات، مظلات المداخل، مظلات المسابح، ومظلات المنشآت، مع خيارات متعددة من التصاميم والخامات لتناسب طبيعة الموقع والاستخدام.",
  },
  {
    question: "كم أسعار تركيب المظلات في جدة؟",
    answer: "تختلف أسعار المظلات حسب المساحة، ونوع الخامة، والتصميم، وطريقة التركيب ومتطلبات الموقع. يمكن التواصل معنا وإرسال تفاصيل الموقع للحصول على تقدير مناسب للمشروع.",
  },
  {
    question: "هل تقدمون خدمة تركيب مظلات السيارات؟",
    answer: "نعم، نوفر تصميم وتركيب مظلات السيارات للمنازل والفلل والمواقف والمنشآت في جدة، مع اختيار التصميم والخامة المناسبة للمساحة وطبيعة الاستخدام.",
  },
  {
    question: "ما أفضل نوع مظلات مناسب لأجواء جدة؟",
    answer: "يعتمد الاختيار على مكان التركيب والاستخدام والميزانية. نساعد العميل في اختيار خامة وتصميم يتحملان الاستخدام الخارجي ويتناسبان مع طبيعة الموقع والظروف المناخية في جدة.",
  },
  {
    question: "هل يمكن تنفيذ المظلة حسب المقاس والتصميم المطلوب؟",
    answer: "نعم، يمكن تنفيذ المظلات حسب أبعاد الموقع ومتطلبات العميل، مع تخصيص التصميم والخامات والألوان بما يتناسب مع المبنى والمساحة المتوفرة.",
  },
  {
    question: "كم يستغرق تركيب المظلات؟",
    answer: "تختلف مدة التنفيذ حسب حجم المشروع ونوع المظلة والتصميم وتجهيز الموقع. بعد معرفة تفاصيل المشروع ومعاينة المتطلبات يمكن تحديد مدة تنفيذ أكثر دقة.",
  },
  {
    question: "هل تقدمون خدماتكم في جميع أحياء جدة؟",
    answer: "نعم، نقدم خدمات تركيب المظلات في مختلف أحياء جدة، ويمكن التواصل معنا وإرسال الموقع عبر واتساب للتأكد من تفاصيل الخدمة وترتيب المشروع.",
  },
  {
    question: "هل يمكن تركيب مظلات للفلل والحدائق والجلسات الخارجية؟",
    answer: "نعم، نوفر حلول مظلات للفلل والحدائق والأحواش والجلسات الخارجية، مع تصاميم عملية تتناسب مع مساحة المكان وطابع المبنى.",
  },
  {
    question: "كيف أطلب معاينة أو عرض سعر للمظلة؟",
    answer: "يمكنك التواصل معنا عبر الهاتف أو واتساب وإرسال نوع المظلة المطلوبة، صور الموقع، الموقع التقريبي والأبعاد إن توفرت، وسنتواصل معك لمناقشة التفاصيل والخطوة المناسبة.",
  },
  {
    question: "هل يمكن مشاهدة مشاريع مظلات تم تنفيذها سابقاً؟",
    answer: "نعم، يمكنك الاطلاع على قسم المشاريع في الموقع لمشاهدة نماذج من الأعمال والتصاميم، والاستفادة منها عند اختيار الشكل المناسب لمشروعك.",
  },
];

async function main() {
  const seededFaqs = await prisma.$transaction(async (tx) => {
    const result = [];

    for (const [index, item] of initialFaqs.entries()) {
      const sortOrder = index + 1;
      const faq = await tx.fAQ.findFirst({
        where: {
          OR: [
            { draftVersion: { question: item.question } },
            { publishedVersion: { question: item.question } },
            { versions: { some: { question: item.question } } },
          ],
        },
        include: { draftVersion: true, publishedVersion: true },
      });

      if (!faq) {
        const created = await tx.fAQ.create({ data: { status: ContentStatus.DRAFT }, select: { id: true } });
        const [draft, published] = await Promise.all([
          tx.fAQVersion.create({ data: { faqId: created.id, question: item.question, answer: item.answer, sortOrder }, select: { id: true } }),
          tx.fAQVersion.create({ data: { faqId: created.id, question: item.question, answer: item.answer, sortOrder }, select: { id: true } }),
        ]);
        const updated = await tx.fAQ.update({
          where: { id: created.id },
          data: { draftVersionId: draft.id, publishedVersionId: published.id, publishedAt: new Date(), status: ContentStatus.PUBLISHED },
          select: { id: true },
        });
        result.push(updated);
        continue;
      }

      const draft = faq.draftVersionId
        ? await tx.fAQVersion.update({ where: { id: faq.draftVersionId }, data: { question: item.question, answer: item.answer, sortOrder }, select: { id: true } })
        : await tx.fAQVersion.create({ data: { faqId: faq.id, question: item.question, answer: item.answer, sortOrder }, select: { id: true } });
      const published = faq.publishedVersionId
        ? await tx.fAQVersion.update({ where: { id: faq.publishedVersionId }, data: { question: item.question, answer: item.answer, sortOrder }, select: { id: true } })
        : await tx.fAQVersion.create({ data: { faqId: faq.id, question: item.question, answer: item.answer, sortOrder }, select: { id: true } });

      const updated = await tx.fAQ.update({
        where: { id: faq.id },
        data: { draftVersionId: draft.id, publishedVersionId: published.id, publishedAt: faq.publishedAt ?? new Date(), status: ContentStatus.PUBLISHED },
        select: { id: true },
      });
      result.push(updated);
    }

    await attachFaqsToHomePage(tx, result.map((faq) => faq.id));
    return result;
  });

  console.log(`Seeded ${seededFaqs.length} initial FAQs.`);
}

async function attachFaqsToHomePage(tx, faqIds) {
  const home = await tx.page.findUnique({ where: { key: "HOME" }, include: { draftVersion: true, publishedVersion: true } });
  if (!home) return;

  const seedIdSet = new Set(faqIds);
  const versions = [home.draftVersion, home.publishedVersion].filter(Boolean);
  for (const version of versions) {
    const data = withSeedFaqSelection(version.data, faqIds, seedIdSet);
    if (data !== version.data) await tx.pageVersion.update({ where: { id: version.id }, data: { data } });
  }
}

function withSeedFaqSelection(data, faqIds, seedIdSet) {
  if (!isRecord(data) || !isRecord(data.faqSection)) return data;
  const selectedFaqIds = Array.isArray(data.faqSection.selectedFaqIds) ? data.faqSection.selectedFaqIds.filter((id) => typeof id === "string") : [];
  const shouldPopulate = selectedFaqIds.length === 0 || selectedFaqIds.every((id) => seedIdSet.has(id));
  if (!shouldPopulate) return data;
  return { ...data, faqSection: { ...data.faqSection, enabled: true, selectedFaqIds: faqIds } };
}

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
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
