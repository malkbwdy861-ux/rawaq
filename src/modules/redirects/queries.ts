import { z } from "zod";

import { getCmsPagination } from "@/modules/cms/validation";
import { prisma } from "@/server/db/prisma";

const paramsSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
});

export async function getRedirectList(searchParams: Record<string, string | string[] | undefined>) {
  const parsed = paramsSchema.safeParse({ q: searchParams.q, page: searchParams.page });
  const params = parsed.success ? parsed.data : { q: "", page: 1 };
  const where = params.q ? { OR: [
    { sourcePath: { contains: params.q, mode: "insensitive" as const } },
    { destinationPath: { contains: params.q, mode: "insensitive" as const } },
  ] } : {};
  const totalItems = await prisma.redirect.count({ where });
  const pagination = getCmsPagination({ page: params.page, pageSize: 20, totalItems });
  const redirects = await prisma.redirect.findMany({ where, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], skip: pagination.skip, take: pagination.take });
  return { params, pagination, redirects };
}
