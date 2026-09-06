import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { isNextControlFlowError } from "@/lib/supabase/errors";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { getLocale } from "@/lib/i18n/get-locale";
import { ConsentProvider } from "@/lib/consent-context";
import { getConsent } from "@/lib/get-consent";
import { CookieBanner } from "@/components/cookie-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "NDR Collectives | Pokémon TCG News & Card Marketplace",
    template: "%s | NDR Collectives",
  },
  description:
    "Pokémon TCG news, upcoming set release calendar, and a marketplace for singles, sealed product, and graded slabs.",
  openGraph: {
    siteName: "NDR Collectives",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, consent] = await Promise.all([getLocale(), getConsent()]);
  let isSignedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = !!user;
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    // Supabase env vars not configured yet — render signed-out state.
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
            var t = localStorage.getItem("ndr-theme");
            if (t === "light") document.documentElement.dataset.theme = "light";
          } catch (e) {}`}
        </Script>
        <ConsentProvider initialStatus={consent}>
          <LanguageProvider initialLocale={locale}>
            <CartProvider>
              <Navbar isSignedIn={isSignedIn} />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <CookieBanner />
            </CartProvider>
          </LanguageProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
