import { redirect } from "next/navigation";

import { getAdminSession } from "@/server/auth";

import { LoginForm } from "./login-form";

export default async function DashboardLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main
      className="login-canvas flex min-h-screen min-h-dvh items-center justify-center px-5 py-6 text-foreground sm:px-6 sm:py-10"
    >
      <section
        aria-labelledby="login-title"
        className="login-card w-full max-w-[500px] rounded-[26px] border border-border/80 bg-card px-6 py-9 sm:px-10 sm:py-11 md:px-12"
      >
        <div className="text-center">
          <p className="text-[1.375rem] font-bold leading-[1.5] text-primary">
            مظلات جدة
          </p>
          <p
            className="mt-0.5 text-[0.8125rem] font-medium leading-5 text-text-secondary"
            dir="ltr"
          >
            Jeddah Shading
          </p>
          <span
            aria-hidden="true"
            className="mx-auto mt-4 block h-px w-11 bg-clay/55"
          />
        </div>

        <div className="mb-8 mt-9 text-center sm:mb-9 sm:mt-10">
          <h1
            className="text-[1.625rem] font-bold leading-[1.45] text-foreground sm:text-[1.75rem]"
            id="login-title"
          >
            دخول المسؤول
          </h1>
          <p className="mt-2 text-sm leading-7 text-text-secondary sm:text-[0.9375rem]">
            تسجيل الدخول إلى لوحة تحكم مظلات جدة
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
