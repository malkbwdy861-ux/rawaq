import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { JsonLd } from "@/modules/seo/components/json-ld";
import { getSiteUrl } from "@/modules/seo/site-url";
import { getSiteSettings } from "@/modules/settings/queries";
import "./globals.css";

const tajawal = localFont({
  variable: "--font-tajawal",
  src: [
    { path: "../public/fonts/Tajawal-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../public/fonts/Tajawal-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Tajawal-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Tajawal-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Tajawal-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Tajawal-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/Tajawal-Black.ttf", weight: "900", style: "normal" },
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.companyName || "Jeddah Shading";
  return {
    metadataBase: getSiteUrl(),
    title: { default: settings?.defaultSeoTitle || siteName, template: `%s | ${siteName}` },
    description: settings?.defaultSeoDescription ?? settings?.companyDescription ?? undefined,
    openGraph: {
      type: "website",
      locale: "ar_SA",
      siteName,
      images: settings?.defaultOpenGraphImage?.url ? [settings.defaultOpenGraphImage.url] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar-SA"
      dir="rtl"
      className={`${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><OrganizationData />{children}</body>
    </html>
  );
}

async function OrganizationData() {
  const settings = await getSiteSettings();
  if (!settings?.companyName) return null;
  return <JsonLd data={{
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.companyName,
    description: settings.companyDescription || undefined,
    url: getSiteUrl().toString(),
    telephone: settings.primaryPhone || undefined,
    email: settings.email || undefined,
    address: settings.address || undefined,
    openingHours: settings.businessHours || undefined,
    logo: settings.logoMedia?.url || undefined,
    sameAs: Object.values(settings.socialLinks).filter(Boolean),
  }} />;
}
