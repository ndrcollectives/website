import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getFaq } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "FAQ",
};

export default async function FaqPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const items = getFaq(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">{dict.faq.title}</h1>
      <p className="mt-2 text-muted">{dict.faq.subtitle}</p>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">
        {items.map((item) => (
          <details key={item.question} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
