import type { Locale } from "@/lib/i18n/dictionaries";

export type FaqItem = { question: string; answer: string };

// Placeholder, business-specific answers (shipping times/costs, returns
// window, support address) are written generically — edit them once the
// real policies are decided; the structure/UI is what this feature adds.
const en: FaqItem[] = [
  {
    question: "Is it safe to buy Pokémon cards from NDR Collectives?",
    answer:
      "Yes. Checkout is handled entirely by Stripe, a PCI-compliant payment processor used by millions of stores — we never see or store your card details. Every listing shows the exact condition and set/number before you buy.",
  },
  {
    question: "What currency do I pay in?",
    answer: "All prices are in EUR (€), which is what you're actually charged.",
  },
  {
    question: "How do you grade card condition?",
    answer:
      "Ungraded singles use the standard scale: M (Mint), NM (Near Mint), LP (Lightly Played), MP (Moderately Played), HP (Heavily Played), DMG (Damaged). Graded slabs list the grading company and grade (e.g. PSA 10, BGS 9.5) as given by that service.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Sign in and go to Account → Order History to see the status of every order. Once an order ships, the tracking number and carrier appear there too.",
  },
  {
    question: "What if my order arrives damaged or doesn't arrive?",
    answer:
      "Email us at support@ndrcollectives.com with your order number and we'll sort it out.",
  },
  {
    question: "Can I return an order?",
    answer:
      "Get in touch before sending anything back so we can guide you through it — trading card singles are fragile in transit, so how a return is handled depends on the item and its condition on arrival.",
  },
  {
    question: "Do you ship outside the Netherlands?",
    answer:
      "Check the shipping options shown at checkout for your address — availability and cost vary by destination.",
  },
  {
    question: "How can I contact you?",
    answer: "Email us at support@ndrcollectives.com and we'll get back to you as soon as we can.",
  },
];

const nl: FaqItem[] = [
  {
    question: "Is het veilig om Pokémon kaarten te kopen bij NDR Collectives?",
    answer:
      "Ja. Het afrekenen verloopt volledig via Stripe, een PCI-compliant betaalverwerker die door miljoenen webshops wordt gebruikt — wij zien of bewaren je kaartgegevens nooit. Elke listing toont de exacte conditie en set/nummer voordat je koopt.",
  },
  {
    question: "In welke valuta betaal ik?",
    answer: "Alle prijzen staan in euro's (€), en dat is ook wat je daadwerkelijk betaalt.",
  },
  {
    question: "Hoe bepalen jullie de conditie van kaarten?",
    answer:
      "Ongegradeerde losse kaarten gebruiken de standaardschaal: M (Mint), NM (Near Mint), LP (Lightly Played), MP (Moderately Played), HP (Heavily Played), DMG (Damaged). Graded slabs vermelden het gradingbedrijf en de grade (bijv. PSA 10, BGS 9.5) zoals door die dienst toegekend.",
  },
  {
    question: "Hoe volg ik mijn bestelling?",
    answer:
      "Log in en ga naar Account → Bestelgeschiedenis om de status van elke bestelling te zien. Zodra een bestelling is verzonden, verschijnen daar ook het trackingnummer en de vervoerder.",
  },
  {
    question: "Wat als mijn bestelling beschadigd aankomt of niet aankomt?",
    answer: "Mail ons op support@ndrcollectives.com met je bestelnummer, dan lossen we het samen op.",
  },
  {
    question: "Kan ik een bestelling retourneren?",
    answer:
      "Neem contact op voordat je iets terugstuurt, dan begeleiden we je erdoorheen — losse kaarten zijn kwetsbaar tijdens verzending, dus hoe een retour verloopt hangt af van het artikel en de conditie bij aankomst.",
  },
  {
    question: "Verzenden jullie ook buiten Nederland?",
    answer:
      "Bekijk de verzendopties die bij het afrekenen voor jouw adres worden getoond — beschikbaarheid en kosten verschillen per bestemming.",
  },
  {
    question: "Hoe kan ik contact opnemen?",
    answer: "Mail ons op support@ndrcollectives.com en we reageren zo snel mogelijk.",
  },
];

export function getFaq(locale: Locale): FaqItem[] {
  return locale === "nl" ? nl : en;
}
