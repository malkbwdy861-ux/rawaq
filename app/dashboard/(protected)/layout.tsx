import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/server/auth";

import { logoutAction } from "./actions";

const contentLinks = [
  ["الخدمات", "/dashboard/services"],
  ["الحلول", "/dashboard/solutions"],
  ["المواد", "/dashboard/materials"],
  ["المشاريع", "/dashboard/projects"],
  ["المقالات", "/dashboard/articles"],
  ["الأسئلة الشائعة", "/dashboard/faqs"],
  ["الصفحات", "/dashboard/pages"],
] as const;

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="rounded-[4px] px-3 py-2 text-sm font-medium text-[oklch(42%_0.018_150)] transition-colors hover:bg-[oklch(95.5%_0.018_145)] hover:text-[oklch(22%_0.018_155)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]"
      href={href}
    >
      {children}
    </Link>
  );
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-[oklch(97.5%_0.009_100)] text-[oklch(22%_0.018_155)] lg:grid lg:grid-cols-[minmax(0,1fr)_264px]">
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-100 flex min-h-14 items-center justify-between border-b border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] px-4 md:min-h-16 md:px-8">
          <div>
            <p className="text-xs font-medium text-[oklch(50%_0.014_150)]">
              لوحة التحكم
            </p>
            <p className="text-sm font-semibold">
              {session.user.name ?? session.user.email}
            </p>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" className="min-h-10 rounded-[4px]">
              تسجيل الخروج
            </Button>
          </form>
        </header>
        <main className="w-full max-w-[1600px] flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <aside className="order-first border-l border-[oklch(82%_0.012_145)] bg-[oklch(96.5%_0.009_120)] p-4 lg:min-h-screen">
        <Link className="mb-6 block rounded-[4px] px-3 py-2" href="/dashboard">
          <span className="block text-base font-bold">Jeddah Shading</span>
          <span className="block text-xs text-[oklch(50%_0.014_150)]">
            إدارة المحتوى والنشر
          </span>
        </Link>

        <nav aria-label="تنقل لوحة التحكم" className="space-y-5">
          <div className="grid gap-1">
            <NavLink href="/dashboard">نظرة عامة</NavLink>
          </div>

          <div className="grid gap-1">
            <p className="px-3 text-[0.75rem] font-semibold text-[oklch(50%_0.014_150)]">
              المحتوى
            </p>
            {contentLinks.map(([label, href]) => (
              <NavLink href={href} key={href}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="grid gap-1">
            <NavLink href="/dashboard/media">الوسائط</NavLink>
          </div>

          <div className="grid gap-1">
            <p className="px-3 text-[0.75rem] font-semibold text-[oklch(50%_0.014_150)]">
              SEO
            </p>
            <NavLink href="/dashboard/seo/redirects">إعادة التوجيه</NavLink>
          </div>

          <div className="grid gap-1">
            <NavLink href="/dashboard/settings">الإعدادات</NavLink>
          </div>
        </nav>
      </aside>
    </div>
  );
}
