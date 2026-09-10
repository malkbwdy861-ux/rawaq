import { redirect } from "next/navigation";

import { getAdminSession } from "@/server/auth";

import { LoginForm } from "./login-form";

export default async function DashboardLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[oklch(97.5%_0.009_100)] px-4 py-10 text-[oklch(22%_0.018_155)]">
      <section className="w-full max-w-md rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-6 sm:p-8">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold text-[oklch(37%_0.075_155)]">
            Jeddah Shading
          </p>
          <h1 className="text-2xl font-bold leading-[1.45] sm:text-[1.75rem]">
            دخول المسؤول
          </h1>
          <p className="max-w-[55ch] text-base leading-[1.65] text-[oklch(42%_0.018_150)]">
            هذه المساحة مخصصة لإدارة المحتوى والنشر داخل لوحة التحكم.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
