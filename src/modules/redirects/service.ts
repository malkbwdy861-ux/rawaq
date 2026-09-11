import type { Prisma } from "@prisma/client";

import type { RedirectInput } from "./validation";

type RedirectTransaction = Prisma.TransactionClient;

export async function saveRedirectMapping(
  tx: RedirectTransaction,
  input: RedirectInput,
  options: { allowExistingSource?: boolean } = {},
) {
  const rows = await tx.redirect.findMany({ select: { id: true, sourcePath: true, destinationPath: true } });
  const existingSource = rows.find((row) => row.sourcePath === input.sourcePath && row.id !== input.redirectId);

  if (existingSource && !options.allowExistingSource) {
    throw new Error("مسار المصدر مستخدم في إعادة توجيه أخرى.");
  }

  const graph = new Map(
    rows
      .filter((row) => row.id !== input.redirectId && row.id !== existingSource?.id)
      .map((row) => [row.sourcePath, row.destinationPath]),
  );
  graph.set(input.sourcePath, input.destinationPath);

  const flattened = new Map<string, string>();
  for (const source of graph.keys()) flattened.set(source, resolveDestination(graph, source));

  const targetId = input.redirectId ?? existingSource?.id;
  if (targetId) {
    await tx.redirect.update({
      where: { id: targetId },
      data: { sourcePath: input.sourcePath, destinationPath: flattened.get(input.sourcePath)!, statusCode: 301 },
    });
  } else {
    await tx.redirect.create({
      data: { sourcePath: input.sourcePath, destinationPath: flattened.get(input.sourcePath)!, statusCode: 301 },
    });
  }

  await Promise.all(
    rows
      .filter((row) => row.id !== targetId && row.id !== existingSource?.id)
      .map((row) => {
        const destinationPath = flattened.get(row.sourcePath);
        return destinationPath && destinationPath !== row.destinationPath
          ? tx.redirect.update({ where: { id: row.id }, data: { destinationPath, statusCode: 301 } })
          : null;
      }),
  );
}

export async function savePublishedSlugRedirect(tx: RedirectTransaction, sourcePath: string, destinationPath: string) {
  if (sourcePath === destinationPath) return;

  // A newly published canonical path must not remain a redirect source, including when reverting a slug.
  await tx.redirect.deleteMany({ where: { sourcePath: destinationPath } });
  await saveRedirectMapping(tx, { sourcePath, destinationPath }, { allowExistingSource: true });
}

function resolveDestination(graph: Map<string, string>, source: string) {
  const visited = new Set([source]);
  let destination = graph.get(source)!;

  while (graph.has(destination)) {
    if (visited.has(destination)) throw new Error("تعذر الحفظ لأن إعادة التوجيه ستنشئ حلقة مغلقة.");
    visited.add(destination);
    destination = graph.get(destination)!;
  }

  if (destination === source) throw new Error("تعذر الحفظ لأن إعادة التوجيه ستعود إلى المصدر.");
  return destination;
}
