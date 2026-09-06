import { cookies } from "next/headers";
import { CONSENT_COOKIE, isConsentChoice, type ConsentStatus } from "@/lib/consent";

export async function getConsent(): Promise<ConsentStatus> {
  const store = await cookies();
  const value = store.get(CONSENT_COOKIE)?.value;
  return isConsentChoice(value) ? value : null;
}
