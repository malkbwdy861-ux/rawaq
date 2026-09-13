import { z } from "zod";

export const projectCategoryIconKeys = ["car", "home", "school", "building", "trees", "umbrella", "warehouse"] as const;
export const projectCategoryIconKeySchema = z.enum(projectCategoryIconKeys);

export const projectCategoryInputSchema = z.object({
  categoryId: z.string().cuid().optional(),
  name: z.string().trim().min(1, "أدخل اسم التصنيف.").max(100, "يجب ألا يتجاوز الاسم 100 حرف."),
  iconKey: projectCategoryIconKeySchema,
  description: z.string().trim().max(300, "يجب ألا يتجاوز الوصف 300 حرف.").optional().or(z.literal("")),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int("أدخل ترتيباً صحيحاً.").min(0, "يجب ألا يقل الترتيب عن صفر.").max(999, "يجب ألا يتجاوز الترتيب 999."),
});

export const projectCategoryIdSchema = z.object({ categoryId: z.string().cuid() });
export type ProjectCategoryIconKey = z.infer<typeof projectCategoryIconKeySchema>;
