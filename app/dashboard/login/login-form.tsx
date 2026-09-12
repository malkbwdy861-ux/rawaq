"use client";

import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  function togglePasswordVisibility() {
    setPasswordVisible((visible) => !visible);
    requestAnimationFrame(() => passwordRef.current?.focus());
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label
          className="mb-2 block text-[0.8125rem] font-semibold leading-5 text-foreground"
          htmlFor="email"
        >
          البريد الإلكتروني
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <Input
            aria-describedby={emailError ? "email-error" : undefined}
            aria-invalid={Boolean(emailError)}
            autoComplete="email"
            className="h-14 rounded-[13px] border-border-strong/70 bg-background/70 py-3 pr-4 pl-11 text-left text-base text-foreground duration-150 hover:border-border-strong focus-visible:border-primary focus-visible:bg-card focus-visible:ring-ring/30 disabled:bg-muted disabled:text-muted-foreground aria-invalid:ring-destructive/15"
            dir="ltr"
            disabled={pending}
            id="email"
            name="email"
            placeholder="admin@example.com"
            required
            type="email"
          />
        </div>
        <p
          className="min-h-5 pt-1 text-xs font-medium leading-5 text-destructive"
          id="email-error"
        >
          {emailError}
        </p>
      </div>

      <div>
        <label
          className="mb-2 block text-[0.8125rem] font-semibold leading-5 text-foreground"
          htmlFor="password"
        >
          كلمة المرور
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <Input
            aria-describedby={passwordError ? "password-error" : undefined}
            aria-invalid={Boolean(passwordError)}
            autoComplete="current-password"
            className="h-14 rounded-[13px] border-border-strong/70 bg-background/70 py-3 pr-[3.25rem] pl-11 text-left text-base text-foreground duration-150 hover:border-border-strong focus-visible:border-primary focus-visible:bg-card focus-visible:ring-ring/30 disabled:bg-muted disabled:text-muted-foreground aria-invalid:ring-destructive/15"
            dir="ltr"
            disabled={pending}
            id="password"
            name="password"
            placeholder="أدخل كلمة المرور"
            ref={passwordRef}
            required
            type={passwordVisible ? "text" : "password"}
          />
          <button
            aria-label={passwordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            aria-pressed={passwordVisible}
            className="absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-[10px] text-muted-foreground outline-none transition-[color,background-color] duration-150 hover:bg-primary-soft hover:text-primary focus-visible:bg-primary-soft focus-visible:text-primary disabled:pointer-events-none disabled:text-muted-foreground"
            disabled={pending}
            onClick={togglePasswordVisibility}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
            ) : (
              <Eye aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
            )}
          </button>
        </div>
        <p
          className="min-h-5 pt-1 text-xs font-medium leading-5 text-destructive"
          id="password-error"
        >
          {passwordError}
        </p>
      </div>

      <div className="min-h-6" aria-live="polite">
        {state.error ? (
          <p
            className="rounded-[10px] border border-destructive/20 bg-danger-soft px-3 py-2 text-sm font-medium leading-6 text-destructive"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}
      </div>

      <Button
        className="h-14 w-full rounded-[13px] text-[0.9375rem] shadow-[0_8px_20px_color-mix(in_oklch,var(--primary)_18%,transparent)] transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-[0_10px_24px_color-mix(in_oklch,var(--primary)_22%,transparent)] focus-visible:ring-offset-card disabled:translate-y-0 disabled:bg-primary disabled:text-primary-foreground disabled:shadow-none"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" />
            جاري تسجيل الدخول...
          </>
        ) : (
          "تسجيل الدخول"
        )}
      </Button>
    </form>
  );
}
