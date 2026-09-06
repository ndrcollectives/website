"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { toggleFavorite } from "@/app/account/favorites/actions";

export function FavoriteButton({
  productId,
  initialFavorited = false,
  className,
}: {
  productId: string;
  initialFavorited?: boolean;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const { dict } = useLanguage();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleFavorite(productId);
      if (!result.ok) {
        router.push(`/sign-in?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      setFavorited(result.favorited);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? dict.favorites.remove : dict.favorites.add}
      title={favorited ? dict.favorites.remove : dict.favorites.add}
      className={cn(
        "rounded-lg bg-surface-raised/90 p-2 backdrop-blur transition-colors hover:bg-surface-raised disabled:opacity-60",
        favorited ? "text-accent-red" : "text-foreground",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
    </button>
  );
}
