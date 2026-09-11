"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db/prisma";

import { siteSettingsSchema, type SiteSettingsInput } from "./validation";

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
