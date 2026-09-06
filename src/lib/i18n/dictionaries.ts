export const locales = ["en", "nl"] as const;
export type Locale = (typeof locales)[number];
// The Netherlands is the initial market, so first-time visitors land in
// Dutch; an explicit switch (footer or account preferences) overrides this
// via the ndr-lang cookie.
export const defaultLocale: Locale = "nl";
export const LANGUAGE_COOKIE = "ndr-lang";

const en = {
  nav: {
    shop: "Shop",
    sets: "Sets",
    news: "News",
    account: "Account",
    myAccount: "My Account",
    signIn: "Sign In",
    search: "Search",
    searchPlaceholder: "Search cards, sets, numbers...",
    settings: "Settings",
    openCart: "Open cart",
    toggleMenu: "Toggle menu",
    favorites: "Favorites",
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
    faq: "FAQ",
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
  favorites: {
    title: "Favorites",
    add: "Add to favorites",
    remove: "Remove from favorites",
    emptyTitle: "No favorites yet",
    emptyBody: "Tap the heart on any card or product to save it here.",
    browseShop: "Browse Shop",
    back: "Back to Account",
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Answers to the questions we get asked most.",
  },
  scrollToTop: {
    label: "Scroll to top",
  },
  language: {
    label: "Language",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    toggle: "Toggle light/dark theme",
  },
  cookies: {
    bannerTitle: "We use cookies",
    bannerBody:
      "We use strictly necessary cookies to keep you signed in and your cart working, and optional preference cookies to remember your language and theme choice. See our cookie settings for details.",
    accept: "Accept all",
    reject: "Reject non-essential",
    manage: "Cookie settings",
    settingsTitle: "Cookie Settings",
    settingsIntro:
      "Here's exactly what we store and why, so you can decide what to allow.",
    alwaysOn: "Always on",
    necessaryTitle: "Strictly necessary",
    necessaryBody:
      "Keeps you signed in and remembers what's in your cart while you shop and check out. These can't be switched off — the site can't function without them.",
    preferencesTitle: "Preferences",
    preferencesBody:
      "Remembers your language and light/dark theme choice between visits. If you reject these, the site still works and switching language/theme still works for the rest of this visit, but nothing is remembered once you close the browser or come back later — it resets to the default (Dutch, dark).",
    statusAccepted: "You've accepted preference cookies.",
    statusRejected: "You've rejected preference cookies — your language and theme choice won't be remembered.",
    statusUndecided: "You haven't made a choice yet.",
    acceptPreferences: "Accept preferences",
    rejectPreferences: "Reject preferences",
  },
  accountPreferences: {
    title: "Website Preferences",
    back: "Back to Account",
    languageTitle: "Language",
    languageBody: "Choose the language used across the site.",
    themeTitle: "Appearance",
    themeBody: "Choose how the site looks.",
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
    search: "Zoeken",
    searchPlaceholder: "Zoek kaarten, sets, nummers...",
    settings: "Instellingen",
    openCart: "Winkelwagen openen",
    toggleMenu: "Menu wisselen",
    favorites: "Favorieten",
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
    faq: "Veelgestelde vragen",
    disclaimer:
      "Niet verbonden met The Pokémon Company, Nintendo, Creatures of Game Freak.",
  },
  home: {
    heroTitlePrefix: "Jaag op de",
    heroTitleHighlight: "volgende grote hit",
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
  favorites: {
    title: "Favorieten",
    add: "Toevoegen aan favorieten",
    remove: "Verwijderen uit favorieten",
    emptyTitle: "Nog geen favorieten",
    emptyBody: "Tik op het hartje bij een kaart of product om het hier op te slaan.",
    browseShop: "Naar de shop",
    back: "Terug naar Account",
  },
  faq: {
    title: "Veelgestelde vragen",
    subtitle: "Antwoorden op de vragen die we het vaakst krijgen.",
  },
  scrollToTop: {
    label: "Scroll naar boven",
  },
  language: {
    label: "Taal",
  },
  theme: {
    light: "Licht",
    dark: "Donker",
    toggle: "Licht/donker thema wisselen",
  },
  cookies: {
    bannerTitle: "Wij gebruiken cookies",
    bannerBody:
      "We gebruiken strikt noodzakelijke cookies om je ingelogd te houden en je winkelwagen te laten werken, en optionele voorkeurscookies om je taal- en themakeuze te onthouden. Bekijk onze cookie-instellingen voor details.",
    accept: "Alles accepteren",
    reject: "Niet-essentiële weigeren",
    manage: "Cookie-instellingen",
    settingsTitle: "Cookie-instellingen",
    settingsIntro:
      "Hier zie je precies wat we opslaan en waarom, zodat je zelf kunt kiezen wat je toestaat.",
    alwaysOn: "Altijd aan",
    necessaryTitle: "Strikt noodzakelijk",
    necessaryBody:
      "Houdt je ingelogd en onthoudt wat er in je winkelwagen zit tijdens het winkelen en afrekenen. Deze kunnen niet worden uitgeschakeld — zonder deze werkt de site niet.",
    preferencesTitle: "Voorkeuren",
    preferencesBody:
      "Onthoudt je taal- en licht/donker-themakeuze tussen bezoeken. Als je deze weigert, blijft de site werken en kun je de rest van dit bezoek nog gewoon wisselen, maar zodra je de browser sluit of later terugkomt, wordt niets onthouden en valt alles terug op de standaardinstelling (Nederlands, donker).",
    statusAccepted: "Je hebt voorkeurscookies geaccepteerd.",
    statusRejected: "Je hebt voorkeurscookies geweigerd — je taal- en themakeuze worden niet onthouden.",
    statusUndecided: "Je hebt nog geen keuze gemaakt.",
    acceptPreferences: "Voorkeuren accepteren",
    rejectPreferences: "Voorkeuren weigeren",
  },
  accountPreferences: {
    title: "Websitevoorkeuren",
    back: "Terug naar Account",
    languageTitle: "Taal",
    languageBody: "Kies de taal die op de hele site wordt gebruikt.",
    themeTitle: "Weergave",
    themeBody: "Kies hoe de site eruitziet.",
  },
};

export const dictionaries = { en, nl };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
