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
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoteBD | Secure Institutional & Student Voting Platform",
  description:
    "Confidential and verifiable voting platform for school councils, class representatives, clubs, and organizational committees in Bangladesh.",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#006A4E" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0E14" },
  ],
};

const FOUC_INIT_SCRIPT = `(function(){try{var r=document.documentElement;var m=document.querySelector('meta[name="color-scheme"]');var t=localStorage.getItem("votebd_theme");var sys=window.matchMedia("(prefers-color-scheme: dark)").matches;var mode=(t==="light"||t==="dark"||t==="system")?t:"light";if(m)m.content=mode==="system"?"light dark":mode;var dark=mode==="dark"||(mode==="system"&&sys);r.classList.toggle("dark",dark);var fs=localStorage.getItem("votebd_fontsize");if(fs==="large")r.style.fontSize="18px";else if(fs==="xlarge")r.style.fontSize="20px";var hc=localStorage.getItem("votebd_high_contrast");if(hc==="true")r.classList.add("high-contrast");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansBengali.variable} h-full`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: FOUC_INIT_SCRIPT }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 selection:bg-[#006A4E] selection:text-white transition-colors duration-150"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[#006A4E] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-md focus:outline-none"
        >
          Skip to main content
        </a>
        <LanguageProvider>
          <ToastProvider>
            <Suspense
              fallback={
                <div className="h-16 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121721]" />
              }
            >
              <Header />
            </Suspense>
            <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
