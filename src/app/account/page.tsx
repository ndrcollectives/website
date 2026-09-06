import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function AccountPage() {
  const [profile, locale] = await Promise.all([getCurrentProfile(), getLocale()]);
  if (!profile) redirect("/sign-in?next=/account");
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">{dict.nav.myAccount}</h1>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Name</p>
        <p className="font-medium">{profile.full_name ?? "—"}</p>
        <p className="mt-4 text-sm text-muted">Email</p>
        <p className="font-medium">{profile.email}</p>
        {profile.role === "admin" && (
          <p className="mt-4">
            <Link href="/admin" className="text-sm text-accent-blue hover:underline">
              Go to Admin Dashboard &rarr;
            </Link>
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/account/orders">
          <Button variant="secondary">Order History</Button>
        </Link>
        <Link href="/account/preferences">
          <Button variant="secondary">{dict.accountPreferences.title}</Button>
        </Link>
        <Link href="/account/favorites">
          <Button variant="secondary">{dict.favorites.title}</Button>
        </Link>
        <form action={signOut}>
          <Button variant="outline" type="submit">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
