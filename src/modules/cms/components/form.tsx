"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentProps, ReactNode } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    <section className="space-y-5 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold leading-[1.5]">{title}</h2>
        {description ? (
          <p className="max-w-[55ch] text-sm leading-[1.6] text-text-secondary">
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

export function CmsInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "min-h-11 w-full max-w-[760px] border-border-strong bg-card text-base focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-muted disabled:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CmsTextarea({ className, ...props }: ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={cn(
        "min-h-24 w-full max-w-[760px] resize-y border-border-strong bg-card text-base focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
}
