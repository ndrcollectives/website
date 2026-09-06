import { cookies } from "next/headers";
import {
  defaultLocale,
  isLocale,
  LANGUAGE_COOKIE,
  type Locale,
} from "@/lib/i18n/dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LANGUAGE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}
