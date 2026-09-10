"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import {
  FormProvider,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import type { z } from "zod";

import { cn } from "@/lib/utils";

export function useCmsForm<TValues extends FieldValues>({
  schema,
  defaultValues,
}: {
  schema: z.ZodType<TValues>;
  defaultValues: DefaultValues<TValues>;
}) {
  return useForm<TValues>({
    resolver: zodResolver(schema as never) as Resolver<TValues>,
    defaultValues,
    mode: "onBlur",
  });
}

export function CmsForm<TValues extends FieldValues>({
  form,
  children,
  className,
  onSubmit,
}: {
  form: UseFormReturn<TValues>;
  children: ReactNode;
  className?: string;
  onSubmit: (values: TValues) => void | Promise<void>;
}) {
  return (
    <FormProvider {...form}>
      <form className={cn("space-y-6", className)} noValidate onSubmit={form.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
}

export function CmsFieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold leading-[1.5]">{title}</h2>
        {description ? (
          <p className="max-w-[55ch] text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function CmsFieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-[0.8125rem] font-semibold leading-[1.55]" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-sm leading-[1.6] text-[oklch(50%_0.014_150)]" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-medium leading-[1.6] text-[oklch(46%_0.16_28)]" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const cmsInputClassName = "min-h-11 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2 disabled:bg-[oklch(95%_0.012_110)] disabled:text-[oklch(53%_0.012_150)]";
