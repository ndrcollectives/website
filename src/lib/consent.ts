export const CONSENT_COOKIE = "ndr-cookie-consent";

export type ConsentChoice = "accepted" | "rejected";
export type ConsentStatus = ConsentChoice | null;

export function isConsentChoice(value: string | undefined | null): value is ConsentChoice {
  return value === "accepted" || value === "rejected";
}
