import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoteBD | Secure Institutional & Student Voting Platform",
  description:
    "Production-grade, confidential, and verifiable voting platform for school councils, class representatives, clubs, and organizational committees in Bangladesh.",
  keywords: [
    "voting app bangladesh",
    "cr election",
    "class representative vote",
    "online voting bd",
    "secret ballot",
    "votebd",
    "institutional voting",
  ],
  authors: [{ name: "VoteBD Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#006A4E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${notoSansBengali.variable} h-full`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-[#006A4E] selection:text-white transition-colors duration-150">
        <LanguageProvider>
          <ToastProvider>
            <Suspense fallback={<div className="h-16 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />}>
              <Header />
            </Suspense>
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
