import { ContentStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { prisma } from "@/server/db/prisma";

export async function getFaqList(searchParams: Record<string, string | string[] | undefined>) {
  const parsedParams = parseCmsSearchParams(searchParams);
  const params = {
    ...parsedParams,
    status: parsedParams.status === "DRAFT" || parsedParams.status === "PUBLISHED" ? parsedParams.status : "ALL",
    pageSize: 10,
  } as const;
  const page = params.page ?? 1;
  const pageSize = 10;
  const where = {
    AND: [
      params.status === "ALL" ? {} : params.status === "PUBLISHED" ? { status: ContentStatus.PUBLISHED } : { status: { not: ContentStatus.PUBLISHED } },
      params.q ? { OR: [
        { draftVersion: { question: { contains: params.q, mode: "insensitive" as const } } },
        { publishedVersion: { question: { contains: params.q, mode: "insensitive" as const } } },
      ] } : {},
    ],
  };
  const [totalItems, groupedStatuses] = await Promise.all([
    prisma.fAQ.count({ where }),
    prisma.fAQ.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const faqs = await prisma.fAQ.findMany({
    where,
    select: { id: true, status: true, updatedAt: true, draftVersion: { select: { question: true, answer: true } }, publishedVersion: { select: { question: true, answer: true } } },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.take,
  });
  const countFor = (status: ContentStatus) => groupedStatuses.find((item) => item.status === status)?._count._all ?? 0;
  const statusCounts = {
    ALL: groupedStatuses.reduce((sum, item) => sum + item._count._all, 0),
    DRAFT: groupedStatuses.filter((item) => item.status !== ContentStatus.PUBLISHED).reduce((sum, item) => sum + item._count._all, 0),
    PUBLISHED: countFor(ContentStatus.PUBLISHED),
  };
  return { params, pagination, faqs, statusCounts };
}

export async function getFaqEditorData(faqId: string) {
  const faq = await prisma.fAQ.findUnique({ where: { id: faqId }, include: { draftVersion: true, publishedVersion: true } });
  if (!faq) notFound();
  return faq;
}

export async function getFaqPreview(faqId: string) {
  const faq = await prisma.fAQ.findUnique({ where: { id: faqId }, include: { draftVersion: true } });
  if (!faq?.draftVersion) notFound();
  return faq;
}
