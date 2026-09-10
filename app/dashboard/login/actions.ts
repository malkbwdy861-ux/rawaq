"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/server/auth";

export type LoginFormState = {
  error?: string;
};

const loginSchema = z.object({
  email: z.string().trim().email("أدخل بريدًا إلكترونيًا صحيحًا."),
  password: z.string().min(1, "أدخل كلمة المرور."),
});

export async function loginAction(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات الدخول غير صحيحة." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
    }

    throw error;
  }

  redirect("/dashboard");
}
