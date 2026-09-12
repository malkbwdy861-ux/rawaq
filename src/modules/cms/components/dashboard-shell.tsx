"use client";

import {
  BookOpenText,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  FileText,
  FolderKanban,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageOpen,
  PanelsTopLeft,
  Route,
  Settings,
  Shapes,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { label?: string; items: NavItem[] };

const groups: NavGroup[] = [
  { items: [{ label: "نظرة عامة", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "المحتوى",
    items: [
      { label: "الخدمات", href: "/dashboard/services", icon: PanelsTopLeft },
      { label: "الحلول", href: "/dashboard/solutions", icon: Shapes },
      { label: "المواد", href: "/dashboard/materials", icon: PackageOpen },
      { label: "المشاريع", href: "/dashboard/projects", icon: FolderKanban },
      { label: "المقالات", href: "/dashboard/articles", icon: BookOpenText },
      { label: "الأسئلة الشائعة", href: "/dashboard/faqs", icon: CircleHelp },
      { label: "الصفحات", href: "/dashboard/pages", icon: FileText },
    ],
  },
  { label: "الأصول", items: [{ label: "الوسائط", href: "/dashboard/media", icon: ImageIcon }] },
  { label: "الظهور", items: [{ label: "إعادة التوجيه", href: "/dashboard/seo/redirects", icon: Route }] },
  { label: "النظام", items: [{ label: "الإعدادات", href: "/dashboard/settings", icon: Settings }] },
];

const routeLabels = [
  ["/dashboard/services", "الخدمات"],
  ["/dashboard/solutions", "الحلول"],
  ["/dashboard/materials", "المواد"],
  ["/dashboard/projects", "المشاريع"],
  ["/dashboard/articles", "المقالات"],
  ["/dashboard/faqs", "الأسئلة الشائعة"],
  ["/dashboard/pages", "الصفحات"],
  ["/dashboard/media", "الوسائط"],
  ["/dashboard/seo", "تحسين الظهور"],
  ["/dashboard/settings", "الإعدادات"],
] as const;

export function DashboardShell({ children, userLabel, logoutAction }: { children: ReactNode; userLabel: string; logoutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const context = routeLabels.find(([path]) => pathname.startsWith(path))?.[1] ?? "نظرة عامة";

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusable?.[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (profileRef.current?.contains(event.target as Node)) return;
      setProfileOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <div className="dashboard-root min-h-screen bg-dashboard-canvas text-foreground xl:grid xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-e border-border bg-dashboard-sidebar xl:sticky xl:top-0 xl:block xl:h-screen xl:overflow-y-auto">
        <DashboardNav pathname={pathname} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-100 flex h-[60px] items-center justify-between border-b border-border bg-card px-3 shadow-[var(--shadow-rest)] sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button aria-label="فتح قائمة لوحة التحكم" className="xl:hidden" onClick={() => setOpen(true)} ref={menuButtonRef} size="icon" variant="ghost"><Menu /></Button>
            <div className="flex min-w-0 items-center gap-2 text-sm"><span className="hidden text-muted-foreground sm:inline">لوحة التحكم</span><span aria-hidden="true" className="hidden text-border-strong sm:inline">/</span><strong className="truncate font-semibold">{context}</strong></div>
          </div>
          <div className="flex items-center gap-1">
            <Link className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-dashboard-hover hover:text-foreground" href="/" target="_blank"><span className="hidden sm:inline">عرض الموقع</span><ExternalLink className="size-4" /></Link>
            <div className="relative" ref={profileRef}>
              <button aria-expanded={profileOpen} aria-haspopup="menu" className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md px-2 transition-colors hover:bg-dashboard-hover" onClick={() => setProfileOpen((current) => !current)} type="button"><span className="grid size-8 place-items-center rounded-full bg-primary-soft text-primary"><UserRound className="size-4" /></span><span className="hidden max-w-36 truncate text-sm font-medium md:block">{userLabel}</span><ChevronDown className={`size-4 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} /></button>
              {profileOpen ? <div className="absolute end-0 top-[calc(100%+8px)] z-200 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-[var(--shadow-float)]" role="menu">
                <div className="border-b border-border px-2 py-2"><p className="text-xs text-muted-foreground">الحساب الحالي</p><p className="mt-0.5 truncate text-sm font-medium">{userLabel}</p></div>
                <form action={logoutAction} className="mt-1"><button className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-dashboard-hover" role="menuitem" type="submit"><LogOut className="size-4" />تسجيل الخروج</button></form>
              </div> : null}
            </div>
          </div>
        </header>
        <main id="main-content" className="w-full flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-300 h-[100dvh] min-h-[100dvh] xl:hidden">
          <button aria-label="إغلاق قائمة لوحة التحكم" className="absolute inset-0 h-full bg-foreground/35" onClick={() => { setOpen(false); menuButtonRef.current?.focus(); }} type="button" />
          <aside aria-label="قائمة لوحة التحكم" aria-modal="true" className="absolute inset-block-start-0 inset-inline-start-0 h-[100dvh] max-h-[100dvh] w-[min(88vw,320px)] overflow-y-auto overscroll-contain border-e border-border bg-dashboard-sidebar shadow-[var(--shadow-float)]" ref={drawerRef} role="dialog">
            <Button aria-label="إغلاق القائمة" className="absolute end-3 top-2.5" onClick={() => { setOpen(false); menuButtonRef.current?.focus(); }} size="icon" variant="ghost"><X /></Button>
            <DashboardNav onNavigate={() => setOpen(false)} pathname={pathname} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function DashboardNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div>
      <Link className="flex h-[60px] items-center border-b border-border px-4" href="/dashboard" onClick={onNavigate}><span><strong className="block text-sm font-bold">Jeddah Shading</strong><span className="mt-0.5 block text-[11px] text-muted-foreground">نظام إدارة المحتوى</span></span></Link>
      <nav aria-label="تنقل لوحة التحكم" className="space-y-3.5 p-3">
        {groups.map((group, index) => (
          <div className="grid gap-0.5" key={group.label ?? index}>
            {group.label ? <p className="px-2 pb-1 pt-0.5 text-[11px] font-medium text-muted-foreground">{group.label}</p> : null}
            {group.items.map((item) => {
              const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return <Link aria-current={active ? "page" : undefined} className={`flex min-h-10 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors ${active ? "bg-primary-soft/60 font-semibold text-primary shadow-[inset_0_0_0_1px_var(--border)]" : "font-medium text-text-secondary hover:bg-dashboard-hover hover:text-foreground"}`} href={item.href} key={item.href} onClick={onNavigate}><Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.8} />{item.label}</Link>;
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
