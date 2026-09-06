import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LanguagePreference } from "@/components/language-preference";
import { ThemePreference } from "@/components/theme-preference";
import { CookiePreferences } from "@/components/cookie-preferences";

export default async function AccountPreferencesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in?next=/account/preferences");

  const dict = getDictionary(await getLocale());

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/account"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict.accountPreferences.back}
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold">{dict.accountPreferences.title}</h1>

      <div className="mt-8 space-y-8">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">{dict.accountPreferences.languageTitle}</h2>
          <p className="mt-1 text-sm text-muted">{dict.accountPreferences.languageBody}</p>
          <div className="mt-4">
            <LanguagePreference />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">{dict.accountPreferences.themeTitle}</h2>
          <p className="mt-1 text-sm text-muted">{dict.accountPreferences.themeBody}</p>
          <div className="mt-4">
            <ThemePreference />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-semibold">{dict.cookies.settingsTitle}</h2>
          <CookiePreferences />
        </section>
      </div>
    </div>
  );
}
