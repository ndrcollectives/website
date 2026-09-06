import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { getFavoriteProducts } from "@/lib/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function FavoritesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in?next=/account/favorites");

  const [products, locale] = await Promise.all([
    getFavoriteProducts(profile.id),
    getLocale(),
  ]);
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/account"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict.favorites.back}
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold">{dict.favorites.title}</h1>

      {products.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold">{dict.favorites.emptyTitle}</p>
          <p className="mt-2 text-muted">{dict.favorites.emptyBody}</p>
          <Link href="/shop" className="mt-6 inline-block">
            <Button size="lg">{dict.favorites.browseShop}</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} favorited />
          ))}
        </div>
      )}
    </div>
  );
}
