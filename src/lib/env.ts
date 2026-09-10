import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  APP_URL: z.string().url(),
  UPLOAD_DIR: z.string().min(1),
  UPLOAD_PUBLIC_BASE: z.string().min(1),
});

export const env = envSchema.parse(process.env);
