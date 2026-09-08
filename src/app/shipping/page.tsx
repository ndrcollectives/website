import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLocale } from "@/lib/i18n/get-locale";
import { getLegalDoc } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Shipping Policy",
};

export default async function ShippingPage() {
  const doc = getLegalDoc(await getLocale(), "shipping");
  return <LegalPage doc={doc} />;
}
