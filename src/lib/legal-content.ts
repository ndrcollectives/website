import type { Locale } from "@/lib/i18n/dictionaries";

// Draft policy text for a single-shop Pokémon TCG webshop selling to
// NL/BE/DE/FR/US/CA/GB/AU. These are informed starting points (EU distance-
// selling withdrawal right, GDPR/AVG basics, standard shop policies) — NOT
// legal advice. Have them reviewed by a professional once the business is
// KVK/BTW-registered, and fill in the bracketed placeholders with real
// details at that point. Business-specific numbers (shipping cost/window)
// are written generically like faq-content.ts — edit once decided for real.

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

const en: Record<"terms" | "privacy" | "returns" | "shipping", LegalDoc> = {
  terms: {
    title: "Terms & Conditions",
    lastUpdated: "Draft — pending legal review",
    intro:
      "These terms apply to every order placed on ndrcollectives.com. By placing an order you agree to them.",
    sections: [
      {
        heading: "Who we are",
        body: [
          "NDR Collectives, operating ndrcollectives.com. Chamber of Commerce (KVK) and VAT (BTW) registration is in progress; the registration number will be added here once it's complete. Contact: support@ndrcollectives.com.",
        ],
      },
      {
        heading: "Orders and contract",
        body: [
          "A contract is formed once we confirm your order by email or on the order-success page. We reserve the right to refuse or cancel an order — for example if stock runs out, pricing was clearly wrong, or payment can't be verified. If we cancel a paid order, you'll be refunded in full.",
        ],
      },
      {
        heading: "Prices and payment",
        body: [
          "All prices are shown in EUR and include the fees itemized at checkout (subtotal, transaction fee, shipping). Payment is processed by PayPal; we never see or store your full card details. Prices can change at any time but never after you've placed an order.",
        ],
      },
      {
        heading: "Right of withdrawal (14 days)",
        body: [
          "As an EU consumer, you can cancel your order within 14 days of receiving it, without giving a reason — see our Returns Policy for the full process. This right doesn't apply to business/reseller purchases.",
        ],
      },
      {
        heading: "Product condition and conformity",
        body: [
          "Card condition (e.g. Near Mint, Lightly Played) and grading company/grade for graded slabs are described as accurately as we can on each listing. If an item doesn't match its listing, contact us — see the Returns Policy for how we resolve that.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "We're liable for damages caused by our own intent or gross negligence, and otherwise as required by Dutch/EU consumer law. We're not liable for indirect damages (e.g. lost value of a collection you were building).",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the law of the Netherlands. Disputes not resolved directly can be brought before the competent Dutch court, without prejudice to any mandatory consumer-protection rights in your own country of residence.",
        ],
      },
      {
        heading: "Changes to these terms",
        body: [
          "We may update these terms from time to time; the version in effect at the time you place an order is the one that applies to it.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: September 8, 2026",
    intro:
      "This explains what personal data NDR Collectives collects when you use ndrcollectives.com, why, and what rights you have over it under GDPR.",
    sections: [
      {
        heading: "Who's responsible for your data",
        body: [
          "NDR Collectives is the data controller for personal data collected through this site. Contact: support@ndrcollectives.com.",
        ],
      },
      {
        heading: "What we collect",
        body: [
          "Account data: email address, and name if you provide one. Order data: items purchased, shipping address, order history. Site usage: favorites, language preference, and cookie-consent choices (see Cookie Policy). We never collect or store your full card payment details — PayPal handles that directly.",
        ],
      },
      {
        heading: "Why we collect it",
        body: [
          "To create your account and process orders (necessary to perform our contract with you), to respond to support requests, and — only with your consent — to send release-alert emails you've signed up for.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "PayPal (payment processing), Supabase (database/authentication hosting), and Vercel (website hosting) each process data on our behalf as needed to run the site. We don't sell your data to anyone.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Account data is kept while your account is active. Order records are kept as long as required for tax/accounting purposes once we're formally registered. You can ask us to delete your account data at any time, subject to those legal retention requirements.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "Under GDPR/AVG you can request access to, correction of, or deletion of your personal data, object to certain processing, and request a copy of your data in a portable format. Email support@ndrcollectives.com to exercise any of these. You can also lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "See our Cookie Policy for what cookies we use and how to manage your preferences.",
        ],
      },
    ],
  },
  returns: {
    title: "Returns Policy",
    lastUpdated: "Draft — pending legal review",
    intro:
      "How returns, the 14-day right of withdrawal, and refunds work for orders placed on ndrcollectives.com.",
    sections: [
      {
        heading: "14-day right of withdrawal",
        body: [
          "As an EU consumer, you can cancel your order within 14 days of receiving it, without giving a reason. Email support@ndrcollectives.com within that window to start a return.",
        ],
      },
      {
        heading: "Condition of returned items",
        body: [
          "Return items in the same condition you received them — this matters more than usual for collectible cards, since handling beyond what's needed to inspect the item can reduce its value, and we may deduct that reduction from your refund as EU law allows.",
        ],
      },
      {
        heading: "Damaged, wrong, or not-as-described items",
        body: [
          "If an item arrives damaged, isn't what you ordered, or doesn't match its listed condition/grade, email us with your order number and photos — this is on us to fix, at no cost to you, separate from the standard withdrawal right above.",
        ],
      },
      {
        heading: "Return shipping cost",
        body: [
          "For a standard withdrawal (changed your mind), return shipping is at your own cost. For damaged/wrong/not-as-described items, we cover it.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Once we receive and check the returned item, we refund the original payment method (via PayPal) within 14 days. Shipping costs from the original order are refunded too, except the return shipping cost noted above.",
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    lastUpdated: "Draft — pending final business details",
    intro: "Where we ship, what it costs, and how long it takes.",
    sections: [
      {
        heading: "Where we ship",
        body: [
          "Netherlands, Belgium, Germany, France, United States, Canada, United Kingdom, and Australia. Choose your country at checkout to see it confirmed.",
        ],
      },
      {
        heading: "Shipping cost",
        body: [
          "A flat shipping fee is shown and charged at checkout alongside your order subtotal and transaction fee — no surprise costs at delivery.",
        ],
      },
      {
        heading: "Processing time",
        body: [
          "Orders are typically packed and handed to the carrier within a few business days of payment confirmation — exact timing depends on order volume. [Confirm and replace with your real processing window.]",
        ],
      },
      {
        heading: "Tracking",
        body: [
          "Once your order ships, tracking details appear on your Order History page in your account.",
        ],
      },
      {
        heading: "Customs (outside the EU)",
        body: [
          "Orders shipped to the US, Canada, UK, or Australia may be subject to import duties or taxes charged by your country's customs authority on arrival — these aren't included in our checkout price and are the recipient's responsibility.",
        ],
      },
    ],
  },
};

const nl: Record<"terms" | "privacy" | "returns" | "shipping", LegalDoc> = {
  terms: {
    title: "Algemene Voorwaarden",
    lastUpdated: "Concept — nog te laten toetsen door een jurist",
    intro:
      "Deze voorwaarden gelden voor elke bestelling geplaatst op ndrcollectives.com. Door te bestellen ga je ermee akkoord.",
    sections: [
      {
        heading: "Wie wij zijn",
        body: [
          "NDR Collectives, handelend onder ndrcollectives.com. KVK- en btw-registratie volgt binnenkort; het KVK-nummer wordt hier toegevoegd zodra de inschrijving is afgerond. Contact: support@ndrcollectives.com.",
        ],
      },
      {
        heading: "Bestelling en overeenkomst",
        body: [
          "Er ontstaat een overeenkomst zodra we je bestelling bevestigen per e-mail of op de orderbevestigingspagina. We behouden ons het recht voor een bestelling te weigeren of te annuleren — bijvoorbeeld bij een uitverkocht artikel, een duidelijke prijsfout, of als de betaling niet kan worden geverifieerd. Bij annulering van een betaalde bestelling ontvang je een volledige terugbetaling.",
        ],
      },
      {
        heading: "Prijzen en betaling",
        body: [
          "Alle prijzen staan in euro's en zijn inclusief de kosten die bij het afrekenen apart getoond worden (subtotaal, transactiekosten, verzendkosten). Betalingen verlopen via PayPal; wij zien of bewaren nooit je volledige kaartgegevens. Prijzen kunnen wijzigen, maar nooit meer nadat je een bestelling hebt geplaatst.",
        ],
      },
      {
        heading: "Herroepingsrecht (14 dagen)",
        body: [
          "Als consument binnen de EU kun je je bestelling binnen 14 dagen na ontvangst zonder opgaaf van reden annuleren — zie ons Retourbeleid voor de volledige procedure. Dit recht geldt niet bij zakelijke aankopen.",
        ],
      },
      {
        heading: "Conditie en conformiteit",
        body: [
          "De conditie van kaarten (bijv. Near Mint, Lightly Played) en het gradingbedrijf/de grade bij graded slabs beschrijven we zo nauwkeurig mogelijk per listing. Komt een artikel niet overeen met de beschrijving, neem dan contact op — zie het Retourbeleid voor hoe we dit oplossen.",
        ],
      },
      {
        heading: "Aansprakelijkheid",
        body: [
          "Wij zijn aansprakelijk voor schade veroorzaakt door opzet of grove nalatigheid van onze kant, en verder zoals de Nederlandse/Europese consumentenwetgeving vereist. Wij zijn niet aansprakelijk voor indirecte schade (bijvoorbeeld verminderde waarde van een verzameling die je aan het opbouwen was).",
        ],
      },
      {
        heading: "Toepasselijk recht",
        body: [
          "Op deze voorwaarden is Nederlands recht van toepassing. Geschillen die niet onderling worden opgelost kunnen worden voorgelegd aan de bevoegde Nederlandse rechter, onverminderd eventuele dwingende consumentenbeschermingsregels in jouw eigen woonland.",
        ],
      },
      {
        heading: "Wijzigingen",
        body: [
          "We kunnen deze voorwaarden van tijd tot tijd aanpassen; de versie die geldt op het moment van bestellen is van toepassing op die bestelling.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacybeleid",
    lastUpdated: "Laatst bijgewerkt: 8 september 2026",
    intro:
      "Dit legt uit welke persoonsgegevens NDR Collectives verzamelt via ndrcollectives.com, waarom, en welke rechten je hebt onder de AVG.",
    sections: [
      {
        heading: "Wie verantwoordelijk is voor je gegevens",
        body: [
          "NDR Collectives is de verwerkingsverantwoordelijke voor persoonsgegevens verzameld via deze site. Contact: support@ndrcollectives.com.",
        ],
      },
      {
        heading: "Wat we verzamelen",
        body: [
          "Accountgegevens: e-mailadres en naam indien opgegeven. Bestelgegevens: gekochte artikelen, verzendadres, bestelgeschiedenis. Sitegebruik: favorieten, taalvoorkeur en cookievoorkeuren (zie Cookiebeleid). We verzamelen of bewaren nooit je volledige betaalkaartgegevens — dat verloopt rechtstreeks via PayPal.",
        ],
      },
      {
        heading: "Waarom we het verzamelen",
        body: [
          "Om je account aan te maken en bestellingen te verwerken (noodzakelijk voor de uitvoering van onze overeenkomst met jou), om supportvragen te beantwoorden, en — alleen met jouw toestemming — om release-alert e-mails te sturen waarvoor je je hebt aangemeld.",
        ],
      },
      {
        heading: "Met wie we het delen",
        body: [
          "PayPal (betalingsverwerking), Supabase (database-/authenticatiehosting) en Vercel (websitehosting) verwerken gegevens namens ons, voor zover nodig om de site te laten draaien. We verkopen je gegevens aan niemand.",
        ],
      },
      {
        heading: "Hoe lang we het bewaren",
        body: [
          "Accountgegevens bewaren we zolang je account actief is. Bestelgegevens bewaren we zo lang als vereist voor fiscale/administratieve doeleinden zodra we formeel geregistreerd zijn. Je kunt op elk moment vragen je accountgegevens te verwijderen, met inachtneming van die wettelijke bewaartermijnen.",
        ],
      },
      {
        heading: "Jouw rechten",
        body: [
          "Onder de AVG heb je recht op inzage, correctie of verwijdering van je persoonsgegevens, je kunt bezwaar maken tegen bepaalde verwerkingen, en een kopie van je gegevens opvragen in een overdraagbaar formaat. Mail support@ndrcollectives.com om een van deze rechten uit te oefenen. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "Zie ons Cookiebeleid voor welke cookies we gebruiken en hoe je je voorkeuren beheert.",
        ],
      },
    ],
  },
  returns: {
    title: "Retourbeleid",
    lastUpdated: "Concept — nog te laten toetsen door een jurist",
    intro:
      "Hoe retourneren, het herroepingsrecht van 14 dagen, en terugbetalingen werken voor bestellingen op ndrcollectives.com.",
    sections: [
      {
        heading: "Herroepingsrecht (14 dagen)",
        body: [
          "Als consument binnen de EU kun je je bestelling binnen 14 dagen na ontvangst zonder opgaaf van reden annuleren. Mail support@ndrcollectives.com binnen die termijn om een retour te starten.",
        ],
      },
      {
        heading: "Conditie van geretourneerde artikelen",
        body: [
          "Retourneer artikelen in dezelfde staat als waarin je ze ontving — dit weegt extra zwaar bij verzamelkaarten, aangezien hanteren voorbij wat nodig is om het artikel te beoordelen de waarde kan verminderen. Die waardevermindering kunnen we, zoals de wet toestaat, in mindering brengen op je terugbetaling.",
        ],
      },
      {
        heading: "Beschadigd, verkeerd, of niet zoals beschreven",
        body: [
          "Komt een artikel beschadigd aan, is het niet wat je besteld hebt, of komt de conditie/grade niet overeen met de listing? Mail ons met je bestelnummer en foto's — dit lossen wij op, kosteloos, los van het standaard herroepingsrecht hierboven.",
        ],
      },
      {
        heading: "Kosten van retourneren",
        body: [
          "Bij een standaard herroeping (van gedachten veranderd) zijn de verzendkosten van de retour voor jouw rekening. Bij beschadigde, verkeerde of niet-zoals-beschreven artikelen nemen wij deze voor onze rekening.",
        ],
      },
      {
        heading: "Terugbetaling",
        body: [
          "Zodra we het geretourneerde artikel hebben ontvangen en gecontroleerd, betalen we binnen 14 dagen terug via de oorspronkelijke betaalmethode (via PayPal). De verzendkosten van de oorspronkelijke bestelling worden ook terugbetaald, met uitzondering van de retourverzendkosten hierboven.",
        ],
      },
    ],
  },
  shipping: {
    title: "Verzendbeleid",
    lastUpdated: "Concept — definitieve bedrijfsgegevens volgen nog",
    intro: "Waar we naartoe verzenden, wat het kost, en hoe lang het duurt.",
    sections: [
      {
        heading: "Waar we naartoe verzenden",
        body: [
          "Nederland, België, Duitsland, Frankrijk, Verenigde Staten, Canada, Verenigd Koninkrijk en Australië. Kies je land bij het afrekenen om dit te bevestigen.",
        ],
      },
      {
        heading: "Verzendkosten",
        body: [
          "Een vast verzendtarief wordt getoond en in rekening gebracht bij het afrekenen, samen met je subtotaal en transactiekosten — geen verrassingen bij levering.",
        ],
      },
      {
        heading: "Verwerkingstijd",
        body: [
          "Bestellingen worden meestal binnen enkele werkdagen na betaalbevestiging ingepakt en aan de vervoerder overgedragen — de exacte tijd hangt af van het bestelvolume. [Bevestig en vervang dit door je werkelijke verwerkingstijd.]",
        ],
      },
      {
        heading: "Tracking",
        body: [
          "Zodra je bestelling is verzonden, verschijnen de trackinggegevens op je Bestelgeschiedenis-pagina in je account.",
        ],
      },
      {
        heading: "Douane (buiten de EU)",
        body: [
          "Bestellingen naar de VS, Canada, het VK of Australië kunnen bij aankomst onderworpen zijn aan invoerrechten of belastingen van de douane van dat land — deze zijn niet inbegrepen in onze checkoutprijs en komen voor rekening van de ontvanger.",
        ],
      },
    ],
  },
};

export function getLegalDoc(
  locale: Locale,
  doc: "terms" | "privacy" | "returns" | "shipping",
): LegalDoc {
  return locale === "nl" ? nl[doc] : en[doc];
}
