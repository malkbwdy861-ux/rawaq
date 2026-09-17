import { Prisma, PrismaClient } from "@prisma/client";

import { sanitizePageReferences, type ExistingCmsReferenceIds } from "../src/modules/cms/references.ts";

const prisma = new PrismaClient();

try {
  const report = await prisma.$transaction(async (tx) => {
    const [services, solutions, materials, projects, articles, faqs, media, versions] = await Promise.all([
      tx.service.findMany({ select: { id: true } }),
      tx.solution.findMany({ select: { id: true } }),
      tx.material.findMany({ select: { id: true } }),
      tx.project.findMany({ select: { id: true } }),
      tx.article.findMany({ select: { id: true } }),
      tx.fAQ.findMany({ select: { id: true } }),
      tx.media.findMany({ select: { id: true } }),
      tx.pageVersion.findMany({ where: { data: { not: Prisma.JsonNull } }, select: { id: true, data: true } }),
    ]);
    const existing: ExistingCmsReferenceIds = {
      service: new Set(services.map(({ id }) => id)), solution: new Set(solutions.map(({ id }) => id)),
      material: new Set(materials.map(({ id }) => id)), project: new Set(projects.map(({ id }) => id)),
      article: new Set(articles.map(({ id }) => id)), faq: new Set(faqs.map(({ id }) => id)), media: new Set(media.map(({ id }) => id)),
    };
    const repairs = versions.flatMap((version) => {
      const data = sanitizePageReferences(version.data, existing);
      return JSON.stringify(data) === JSON.stringify(version.data) ? [] : [{ id: version.id, data }];
    });
    for (const repair of repairs) await tx.pageVersion.update({ where: { id: repair.id }, data: { data: repair.data as Prisma.InputJsonValue } });
    return { scannedPageVersions: versions.length, repairedPageVersions: repairs.length };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  console.log(JSON.stringify(report));
} finally {
  await prisma.$disconnect();
}
