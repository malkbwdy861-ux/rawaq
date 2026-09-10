"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? (
        <div
          className="rounded-[4px] border border-[oklch(46%_0.16_28)] bg-[oklch(94%_0.025_28)] px-3 py-2 text-sm font-medium text-[oklch(46%_0.16_28)]"
          role="alert"
        >
          {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-[0.8125rem] font-semibold" htmlFor="email">
          البريد الإلكتروني
        </label>
        <input
          className="min-h-12 w-full rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2"
          dir="ltr"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          className="block text-[0.8125rem] font-semibold"
          htmlFor="password"
        >
          كلمة المرور
        </label>
        <input
          className="min-h-12 w-full rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2"
          dir="ltr"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <Button
        className="min-h-12 w-full rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]"
        disabled={pending}
        type="submit"
      >
        {pending ? "جار تسجيل الدخول" : "تسجيل الدخول إلى لوحة التحكم"}
      </Button>
    </form>
  );
}
