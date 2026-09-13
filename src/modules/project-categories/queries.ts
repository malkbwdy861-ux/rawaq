import { prisma } from "@/server/db/prisma";

export type ProjectCategoryOption = { id: string; name: string; iconKey: string; isActive: boolean };

export async function getProjectCategoryOptions(): Promise<ProjectCategoryOption[]> {
  return prisma.projectCategory.findMany({ select: { id: true, name: true, iconKey: true, isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getProjectCategoryList() {
  const [categories, projects] = await Promise.all([
    prisma.projectCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.project.findMany({ select: { draftVersion: { select: { categoryId: true } }, publishedVersion: { select: { categoryId: true } } } }),
  ]);
  const counts = new Map<string, number>();
  for (const project of projects) {
    const categoryId = project.draftVersion?.categoryId ?? project.publishedVersion?.categoryId;
    if (categoryId) counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
  }
  return categories.map((category) => ({ ...category, projectCount: counts.get(category.id) ?? 0 }));
}
