import type { Prisma } from "@prisma/client";

export async function lockPublishingNamespace(tx: Prisma.TransactionClient, namespace: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${namespace}))`;
}
