"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin, signOut } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { siteSettingsSchema, type SiteSettingsInput } from "./validation";

const accountSettingsSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().max(80),
  currentPassword: z.string().min(1),
  newPassword: z.string(),
  confirmPassword: z.string(),
}).superRefine((value, context) => {
  if (!value.newPassword && !value.confirmPassword) return;

  if (value.newPassword.length < 6) {
    context.addIssue({
      code: "custom",
      path: ["newPassword"],
      message: "Password must be at least 6 characters.",
    });
  }

  if (value.newPassword !== value.confirmPassword) {
    context.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }
});

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse(readSettingsForm(formData));
  if (!parsed.success) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("تعذر حفظ الإعدادات. راجع الحقول المطلوبة والروابط المدخلة.")}`);
  }

  const existing = await prisma.siteSettings.findFirst({ select: { id: true }, orderBy: { createdAt: "asc" } });
  const data = toPrismaData(parsed.data);

  if (existing) {
    await prisma.siteSettings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.siteSettings.create({ data });
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
  redirect(`/dashboard/settings?success=${encodeURIComponent("تم حفظ إعدادات الموقع وتحديث بيانات التواصل العامة.")}`);
}

export async function saveAdminAccountAction(formData: FormData) {
  const session = await requireAdmin();
  const parsed = accountSettingsSchema.safeParse({
    email: formData.get("accountEmail"),
    name: formData.get("accountName"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("تعذر تحديث الحساب. راجع البريد الإلكتروني وكلمة المرور الجديدة.")}`);
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!admin) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("تعذر العثور على حساب المدير الحالي.")}`);
  }

  const currentPasswordMatches = await compare(parsed.data.currentPassword, admin.passwordHash);

  if (!currentPasswordMatches) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("كلمة المرور الحالية غير صحيحة.")}`);
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== admin.email) {
    const existing = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
    if (existing && existing.id !== admin.id) {
      redirect(`/dashboard/settings?error=${encodeURIComponent("البريد الإلكتروني مستخدم لحساب مدير آخر.")}`);
    }
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      email,
      name: parsed.data.name || null,
      ...(parsed.data.newPassword ? { passwordHash: await hash(parsed.data.newPassword, 12) } : {}),
    },
  });

  revalidatePath("/dashboard/settings");
  await signOut({ redirectTo: "/dashboard/login" });
}

function readSettingsForm(formData: FormData): SiteSettingsInput {
  const value = (name: string) => String(formData.get(name) ?? "");

  return {
    companyName: value("companyName"),
    companyDescription: value("companyDescription"),
    logoMediaId: value("logoMediaId"),
    primaryPhone: value("primaryPhone"),
    secondaryPhone: value("secondaryPhone"),
    whatsappNumber: value("whatsappNumber"),
    email: value("email"),
    address: value("address"),
    businessHours: value("businessHours"),
    socialLinks: {
      facebook: value("facebook"),
      instagram: value("instagram"),
      x: value("x"),
      tiktok: value("tiktok"),
      youtube: value("youtube"),
      linkedin: value("linkedin"),
    },
    defaultSeoTitle: value("defaultSeoTitle"),
    defaultSeoDescription: value("defaultSeoDescription"),
    defaultOpenGraphImageId: value("defaultOpenGraphImageId"),
    defaultCtaText: value("defaultCtaText"),
    defaultWhatsappText: value("defaultWhatsappText"),
  };
}

function emptyToNull(value: string | undefined) {
  return value?.trim() || null;
}

function toPrismaData(input: SiteSettingsInput) {
  return {
    companyName: input.companyName,
    companyDescription: emptyToNull(input.companyDescription),
    logoMediaId: emptyToNull(input.logoMediaId),
    primaryPhone: input.primaryPhone,
    secondaryPhone: emptyToNull(input.secondaryPhone),
    whatsappNumber: input.whatsappNumber,
    email: emptyToNull(input.email),
    address: emptyToNull(input.address),
    businessHours: emptyToNull(input.businessHours),
    socialLinks: Object.fromEntries(Object.entries(input.socialLinks).filter(([, value]) => Boolean(value?.trim()))),
    defaultSeoTitle: emptyToNull(input.defaultSeoTitle),
    defaultSeoDescription: emptyToNull(input.defaultSeoDescription),
    defaultOpenGraphImageId: emptyToNull(input.defaultOpenGraphImageId),
    defaultCtaText: emptyToNull(input.defaultCtaText),
    defaultWhatsappText: emptyToNull(input.defaultWhatsappText),
  };
}
