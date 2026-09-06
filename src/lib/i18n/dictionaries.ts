export const locales = ["en", "nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LANGUAGE_COOKIE = "ndr-lang";

const en = {
  nav: {
    shop: "Shop",
    sets: "Sets",
    news: "News",
    account: "Account",
    myAccount: "My Account",
    signIn: "Sign In",
    searchPlaceholder: "Search cards, sets, numbers...",
    openCart: "Open cart",
    toggleMenu: "Toggle menu",
  },
  footer: {
    tagline:
      "Pokémon TCG news, release calendar, and a marketplace for singles, sealed product, and graded slabs.",
    shopHeading: "Shop",
    allCards: "All Cards",
    boosterBoxes: "Booster Boxes",
    etbs: "Elite Trainer Boxes",
    gradedSlabs: "Graded Slabs",
    exploreHeading: "Explore",
    releaseCalendar: "Release Calendar",
    newsSpoilers: "News & Spoilers",
    trackOrder: "Track Order",
    disclaimer:
      "Not affiliated with The Pokémon Company, Nintendo, Creatures, or Game Freak.",
  },
  home: {
    heroTitlePrefix: "Chase the",
    heroTitleHighlight: "next big pull",
    heroSubtitle:
      "Breaking Pokémon TCG news, a live set release calendar, and a curated marketplace of singles, sealed product, and graded slabs.",
    shopLatestCards: "Shop Latest Cards",
    viewSets: "View Sets",
    upcomingSetReleases: "Upcoming Set Releases",
    fullCalendar: "Full calendar",
    trendingSingles: "Trending Singles & Featured Boxes",
    browseShop: "Browse shop",
    latestArticles: "Latest Articles",
    allNews: "All news",
    justAdded: "Just Added",
  },
  shop: {
    title: "Shop",
    itemsForSale: "item for sale",
    itemsForSalePlural: "items for sale",
    moreShown: "more shown, not currently listed",
    noResults: "No products match those filters yet.",
    prev: "Prev",
    next: "Next",
    pageOf: "Page {current} of {total}",
    filters: "Filters",
    search: "Search",
    searchPlaceholder: "Charizard 004/102",
    setExpansion: "Set / Expansion",
    allSets: "All sets",
    cardType: "Card Type",
    allTypes: "All types",
    rarity: "Rarity",
    allRarities: "All rarities",
    condition: "Condition",
    anyCondition: "Any condition",
    price: "Price ($)",
    min: "Min",
    max: "Max",
    sortBy: "Sort By",
    sortNewest: "Newest Added",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortCardNumber: "Set Number",
    applyFilters: "Apply Filters",
    productTypeSingle: "Single",
    productTypeSealedBox: "Booster Box",
    productTypeEtb: "Elite Trainer Box",
    productTypePack: "Booster Pack",
    productTypeGradedSlab: "Graded Card / Slab",
  },
  cart: {
    title: "Your Cart",
    emptyTitle: "Your cart is empty",
    emptySubtitle: "Time to find your next chase card.",
    browseShop: "Browse Shop",
    removeItem: "Remove item",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shippingNote: "Shipping & taxes calculated at checkout.",
    checkout: "Checkout with Stripe",
    redirecting: "Redirecting...",
  },
  language: {
    label: "Language",
  },
};

type DeepStringify<T> = { [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]> };
export type Dictionary = DeepStringify<typeof en>;

const nl: Dictionary = {
  nav: {
    shop: "Shop",
    sets: "Sets",
    news: "Nieuws",
    account: "Account",
    myAccount: "Mijn Account",
    signIn: "Inloggen",
    searchPlaceholder: "Zoek kaarten, sets, nummers...",
    openCart: "Winkelwagen openen",
    toggleMenu: "Menu wisselen",
  },
  footer: {
    tagline:
      "Pokémon TCG-nieuws, releasekalender en een marktplaats voor losse kaarten, verzegelde producten en graded slabs.",
    shopHeading: "Shop",
    allCards: "Alle kaarten",
    boosterBoxes: "Booster Boxen",
    etbs: "Elite Trainer Boxen",
    gradedSlabs: "Graded Slabs",
    exploreHeading: "Ontdekken",
    releaseCalendar: "Releasekalender",
    newsSpoilers: "Nieuws & Spoilers",
    trackOrder: "Bestelling volgen",
    disclaimer:
      "Niet verbonden met The Pokémon Company, Nintendo, Creatures of Game Freak.",
  },
  home: {
    heroTitlePrefix: "Jaag op de",
    heroTitleHighlight: "volgende grote pull",
    heroSubtitle:
      "Het laatste Pokémon TCG-nieuws, een actuele releasekalender en een zorgvuldig samengestelde marktplaats voor losse kaarten, verzegelde producten en graded slabs.",
    shopLatestCards: "Bekijk nieuwste kaarten",
    viewSets: "Bekijk sets",
    upcomingSetReleases: "Aankomende Set-releases",
    fullCalendar: "Volledige kalender",
    trendingSingles: "Populaire losse kaarten & Uitgelichte boxen",
    browseShop: "Naar de shop",
    latestArticles: "Laatste artikelen",
    allNews: "Al het nieuws",
    justAdded: "Net toegevoegd",
  },
  shop: {
    title: "Shop",
    itemsForSale: "artikel te koop",
    itemsForSalePlural: "artikelen te koop",
    moreShown: "extra getoond, momenteel niet te koop",
    noResults: "Nog geen producten die aan deze filters voldoen.",
    prev: "Vorige",
    next: "Volgende",
    pageOf: "Pagina {current} van {total}",
    filters: "Filters",
    search: "Zoeken",
    searchPlaceholder: "Charizard 004/102",
    setExpansion: "Set / Uitbreiding",
    allSets: "Alle sets",
    cardType: "Kaarttype",
    allTypes: "Alle types",
    rarity: "Zeldzaamheid",
    allRarities: "Alle zeldzaamheden",
    condition: "Conditie",
    anyCondition: "Elke conditie",
    price: "Prijs ($)",
    min: "Min",
    max: "Max",
    sortBy: "Sorteren op",
    sortNewest: "Nieuwst toegevoegd",
    sortPriceAsc: "Prijs: laag naar hoog",
    sortPriceDesc: "Prijs: hoog naar laag",
    sortCardNumber: "Setnummer",
    applyFilters: "Filters toepassen",
    productTypeSingle: "Losse kaart",
    productTypeSealedBox: "Booster Box",
    productTypeEtb: "Elite Trainer Box",
    productTypePack: "Booster Pack",
    productTypeGradedSlab: "Graded kaart / Slab",
  },
  cart: {
    title: "Je Winkelwagen",
    emptyTitle: "Je winkelwagen is leeg",
    emptySubtitle: "Tijd om je volgende chase card te vinden.",
    browseShop: "Naar de shop",
    removeItem: "Artikel verwijderen",
    orderSummary: "Besteloverzicht",
    subtotal: "Subtotaal",
    shippingNote: "Verzendkosten & belasting worden bij het afrekenen berekend.",
    checkout: "Afrekenen met Stripe",
    redirecting: "Doorverwijzen...",
  },
  language: {
    label: "Taal",
  },
};

export const dictionaries = { en, nl };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
