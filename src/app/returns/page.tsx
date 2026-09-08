import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLocale } from "@/lib/i18n/get-locale";
import { getLegalDoc } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Returns Policy",
};

export default async function ReturnsPage() {
  const doc = getLegalDoc(await getLocale(), "returns");
  return <LegalPage doc={doc} />;
}
