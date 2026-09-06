import type { Metadata } from "next";
import { CookiePreferences } from "@/components/cookie-preferences";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Cookie Settings",
};

export default async function CookiesPage() {
  const dict = getDictionary(await getLocale());

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">{dict.cookies.settingsTitle}</h1>
      <p className="mt-2 text-muted">{dict.cookies.settingsIntro}</p>

      <div className="mt-8">
        <CookiePreferences />
      </div>
    </div>
  );
}
