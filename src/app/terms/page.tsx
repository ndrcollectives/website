import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLocale } from "@/lib/i18n/get-locale";
import { getLegalDoc } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default async function TermsPage() {
  const doc = getLegalDoc(await getLocale(), "terms");
  return <LegalPage doc={doc} />;
}
