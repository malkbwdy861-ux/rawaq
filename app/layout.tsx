import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Jeddah Shading",
  description: "Custom shading solutions in Jeddah.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar-SA"
      dir="rtl"
      className={`${readexPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
