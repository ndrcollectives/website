import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLocale } from "@/lib/i18n/get-locale";
import { getLegalDoc } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPage() {
  const doc = getLegalDoc(await getLocale(), "privacy");
  return <LegalPage doc={doc} />;
}
