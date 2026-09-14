"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, CmsInput } from "@/modules/cms/components/form";

import { saveAdminAccountAction } from "../actions";

type AdminAccount = {
  email: string;
  name: string | null;
};

export function AccountForm({ account }: { account: AdminAccount | null }) {
  return (
    <form action={saveAdminAccountAction} className="space-y-5">
      <div className="rounded-xl border border-border bg-card px-4 py-6 shadow-[var(--shadow-rest)] sm:px-6">
        <CmsFieldGroup title="حساب المدير" description="تغيير بيانات تسجيل الدخول يتطلب كلمة المرور الحالية. بعد الحفظ ستحتاج إلى تسجيل الدخول مرة أخرى.">
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <CmsFieldShell id="accountEmail" label="البريد الإلكتروني لتسجيل الدخول">
              <CmsInput dir="ltr" id="accountEmail" name="accountEmail" defaultValue={account?.email ?? ""} required type="email" />
            </CmsFieldShell>
            <CmsFieldShell id="accountName" label="اسم العرض">
              <CmsInput id="accountName" name="accountName" defaultValue={account?.name ?? ""} />
            </CmsFieldShell>
          </div>

          <CmsFieldShell id="currentPassword" label="كلمة المرور الحالية" hint="مطلوبة لتأكيد أي تغيير في بيانات الحساب.">
            <PasswordInput id="currentPassword" name="currentPassword" required autoComplete="current-password" />
          </CmsFieldShell>

          <div className="grid items-start gap-4 sm:grid-cols-2">
            <CmsFieldShell id="newPassword" label="كلمة المرور الجديدة" hint="اتركها فارغة إذا كنت تريد تغيير البريد أو الاسم فقط.">
              <PasswordInput id="newPassword" name="newPassword" minLength={6} autoComplete="new-password" />
            </CmsFieldShell>
            <CmsFieldShell id="confirmPassword" label="تأكيد كلمة المرور الجديدة">
              <PasswordInput id="confirmPassword" name="confirmPassword" minLength={6} autoComplete="new-password" />
            </CmsFieldShell>
          </div>
        </CmsFieldGroup>
      </div>

      <div className="flex justify-end rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-rest)]">
        <Button className="min-h-11 w-full px-5 sm:w-auto" type="submit">
          حفظ بيانات الحساب
        </Button>
      </div>
    </form>
  );
}

function PasswordInput({ id, name, required, minLength, autoComplete }: { id: string; name: string; required?: boolean; minLength?: number; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleVisibility() {
    setVisible((current) => !current);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className="relative max-w-[760px]">
      <CmsInput
        autoComplete={autoComplete}
        className="pr-12"
        dir="ltr"
        id={id}
        minLength={minLength}
        name={name}
        ref={inputRef}
        required={required}
        type={visible ? "text" : "password"}
      />
      <button
        aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        aria-pressed={visible}
        className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-dashboard-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        onClick={toggleVisibility}
        onMouseDown={(event) => event.preventDefault()}
        type="button"
      >
        {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}
