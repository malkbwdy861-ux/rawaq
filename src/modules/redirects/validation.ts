import { z } from "zod";

const blockedPrefixes = ["/api", "/dashboard", "/media", "/preview", "/_next"];

export function normalizeRedirectPath(value: string) {
  const trimmed = value.trim();
  if (trimmed === "/") return trimmed;
  return trimmed.replace(/\/+$/, "");
}

const redirectPathSchema = z.string().trim().min(1, "المسار مطلوب.").max(2048).transform(normalizeRedirectPath).pipe(
  z.string()
    .regex(/^\/(?!\/)[^\s?#\\]*$/, "استخدم مسارًا داخليًا صالحًا يبدأ بشرطة مائلة واحدة.")
    .refine((path) => !path.includes("?") && !path.includes("#"), "لا تضف استعلامًا أو جزءًا مرجعيًا إلى المسار.")
    .refine((path) => !blockedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)), "لا يمكن إعادة توجيه مسار داخلي محمي."),
);

export const redirectInputSchema = z.object({
  redirectId: z.string().cuid().optional(),
  sourcePath: redirectPathSchema,
  destinationPath: redirectPathSchema,
}).refine((value) => value.sourcePath !== value.destinationPath, {
  message: "يجب أن يختلف مسار المصدر عن الوجهة.",
  path: ["destinationPath"],
});

export const redirectIdSchema = z.object({ redirectId: z.string().cuid() });

export type RedirectInput = z.infer<typeof redirectInputSchema>;
