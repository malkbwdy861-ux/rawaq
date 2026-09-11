import { notFound } from "next/navigation";

import { getCmsPagination, parseCmsSearchParams } from "@/modules/cms/validation";
import { prisma } from "@/server/db/prisma";

export async function getFaqList(searchParams: Record<string, string | string[] | undefined>) {
  const params = parseCmsSearchParams(searchParams);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    AND: [
      params.status === "ALL" || params.status === "UNPUBLISHED_CHANGES" ? {} : { status: params.status },
      params.q ? { OR: [
        { draftVersion: { question: { contains: params.q, mode: "insensitive" as const } } },
        { publishedVersion: { question: { contains: params.q, mode: "insensitive" as const } } },
      ] } : {},
      params.status === "UNPUBLISHED_CHANGES" ? { publishedVersionId: { not: null }, draftVersionId: { not: null } } : {},
    ],
  };
  const totalItems = await prisma.fAQ.count({ where });
  const pagination = getCmsPagination({ page, pageSize, totalItems });
  const faqs = await prisma.fAQ.findMany({
    where,
    include: { draftVersion: true, publishedVersion: true },
    orderBy: { updatedAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  });
  return { params, pagination, faqs };
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
