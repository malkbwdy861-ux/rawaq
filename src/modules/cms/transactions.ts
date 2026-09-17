import { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export async function runSerializableCmsTransaction<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await prisma.$transaction(operation, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034" || attempt === 3) throw error;
    }
  }
  throw new Error("Serializable transaction retry limit reached.");
}
