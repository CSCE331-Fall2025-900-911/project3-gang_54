'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CategoryId =
  | "all"
  | "seasonal"
  | "classics"
  | "milk-tea"
  | "fruit-tea"
  | "sparkling"
  | "dessert";

interface Category {
  id: CategoryId;
  label: string;
  helper?: string;
}

interface Drink {
  name: string;
  subtitle?: string;
  description: string;
  price: number;
  tags: string[];
  category: CategoryId;
  icon: string;
  badge?: string;
}

const categories: Category[] = [
  { id: "all", label: "All Drinks" },
  { id: "seasonal", label: "Seasonal Limited", helper: "Cozy & limited-time pours" },
  { id: "classics", label: "Classic Tea", helper: "Original recipes everyone loves" },
  { id: "milk-tea", label: "Milk Tea", helper: "Silky, slow-steeped blends" },
  { id: "fruit-tea", label: "Fruit Tea", helper: "Bright, juicy infusions" },
  { id: "sparkling", label: "Sparkling", helper: "Fizz-forward refreshers" },
  { id: "dessert", label: "Dessert Bar", helper: "Sweet treats & creamy finishes" },
];

const drinkMenu: Drink[] = [
  {
    name: "Roasted Oolong Latte",
    subtitle: "Oat milk • Toasted sugar cap",
    description: "Slow-roasted oolong balanced with velvety oat milk and caramelized sugar cap.",
    price: 6.45,
    tags: ["Seasonal", "Barista Crafted"],
    category: "seasonal",
    icon: "🔥",
    badge: "New Harvest",
  },
  {
    name: "Black Sesame Okinawa",
    subtitle: "Molasses • Roasted sesame",
    description: "Earthy black sesame paste whisked with Okinawa brown sugar and layered milk foam.",
    price: 6.95,
    tags: ["Limited", "Nutty"],
    category: "seasonal",
    icon: "🌙",
    badge: "Chef's pick",
  },
  {
    name: "Brown Sugar Boba Milk",
    subtitle: "Warm pearls • House syrup",
    description: "Charred brown sugar syrup folded through fresh milk and soft boba pearls.",
    price: 5.95,
    tags: ["Classic", "Customer Favorite"],
    category: "classics",
    icon: "🧋",
  },
  {
    name: "Hong Kong Milk Tea",
    subtitle: "Ceylon black • Condensed milk",
    description: "Velvety HK-style milk tea brewed strong and finished with silky condensed milk.",
    price: 5.50,
    tags: ["Rich", "Caffeine Boost"],
    category: "classics",
    icon: "🏮",
  },
  {
    name: "Jasmine Green Breeze",
    subtitle: "Light floral • Cane sugar",
    description: "Fragrant jasmine tea shaken cold with a touch of cane syrup and soft foam.",
    price: 4.95,
    tags: ["Light", "Caffeine Boost"],
    category: "fruit-tea",
    icon: "🌿",
  },
  {
    name: "Lychee Aloe Refresher",
    subtitle: "Jasmine tea • Lychee pearls",
    description: "Bright lychee syrup, aloe bites, and sparkling jasmine tea over pebble ice.",
    price: 5.45,
    tags: ["Refresh", "No Dairy"],
    category: "sparkling",
    icon: "💧",
  },
  {
    name: "Mango Coconut Breeze",
    subtitle: "Thai coconut • Golden mango",
    description: "Sun-ripe mango nectar blended with coconut milk, topped with mango jelly.",
    price: 6.15,
    tags: ["Icy", "Dairy Free"],
    category: "fruit-tea",
    icon: "🥭",
  },
  {
    name: "Strawberry Matcha Swirl",
    subtitle: "Ceremonial matcha • Berry purée",
    description: "Organic matcha layered over strawberries and milk snow for a bold, sweet finish.",
    price: 6.75,
    tags: ["Signature", "Instagram Ready"],
    category: "milk-tea",
    icon: "🍓",
    badge: "Best Seller",
  },
  {
    name: "Salted Caramel Cream Brûlée",
    subtitle: "Salt cream • Torched sugar",
    description: "Butter-toasted caramel infused into Assam tea with a brûléed sea-salt cream cap.",
    price: 6.35,
    tags: ["Indulgent", "Warm"],
    category: "milk-tea",
    icon: "🍮",
  },
  {
    name: "Grapefruit Sunrise",
    subtitle: "Ruby red • Basil seed",
    description: "Fresh grapefruit segments, basil seeds, and sparkling jasmine tea—bright & tart.",
    price: 5.65,
    tags: ["Vitamin C", "Zesty"],
    category: "sparkling",
    icon: "🍊",
  },
  {
    name: "Dragonfruit Kiwi Glow",
    subtitle: "Cold brew white tea • Aloe",
    description: "Vibrant dragonfruit and kiwi purée layered with aloe and white tea.",
    price: 6.05,
    tags: ["Antioxidant", "Vegan"],
    category: "fruit-tea",
    icon: "🐉",
  },
  {
    name: "Toffee Pudding Macchiato",
    subtitle: "Espresso crema • Toffee whip",
    description: "House espresso shot over pudding milk tea with torched toffee whip.",
    price: 6.85,
    tags: ["Dessert", "Bold"],
    category: "dessert",
    icon: "☕️",
  },
  {
    name: "Cookie Butter Cream Float",
    subtitle: "Speculoos crumble • Vanilla milk",
    description: "Chilled vanilla milk topped with speculoos cookie butter cream and crunch.",
    price: 6.45,
    tags: ["Sweet", "No Tea"],
    category: "dessert",
    icon: "🍪",
  },
];

type LanguageCode = "en" | "es" | "zh";

const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
];

const BASE_TRANSLATABLE_STRINGS = [
  "In-store kiosk",
  "Craft your ShareTea drink",
  "Tap a drink to start customizing sweetness, ice, and toppings. Freshly brewed, ready when your name is called.",
  "Quick order guide",
  "Customize each drink in three intuitive steps:",
  "Select size and ice level.",
  "Choose sweetness and alternative milks.",
  "Add toppings, confirm, and pay at the counter.",
  "Need a recommendation?",
  "Ask a team member or switch the kiosk to accessibility mode at the bottom of the screen.",
  "Barista highlights",
  "Language",
  "Translating…",
  "We couldn't translate right now. Showing original text.",
  "Customize drink",
  "Quick add",
];

const CATEGORY_TRANSLATABLE_STRINGS = categories.flatMap((category) =>
  category.helper ? [category.label, category.helper] : [category.label]
);

const DRINK_TRANSLATABLE_STRINGS = drinkMenu.flatMap((drink) => {
  const strings = [drink.name, drink.description];
  if (drink.subtitle) {
    strings.push(drink.subtitle);
  }
  if (drink.badge) {
    strings.push(drink.badge);
  }
  drink.tags.forEach((tag) => strings.push(tag));
  return strings;
});

const ORDER_SUMMARY_TRANSLATABLE_STRINGS = [
  "Quick order guide",
  "Customize each drink in three intuitive steps:",
  "Select size and ice level.",
  "Choose sweetness and alternative milks.",
  "Add toppings, confirm, and pay at the counter.",
  "Need a recommendation?",
  "Ask a team member or switch the kiosk to accessibility mode at the bottom of the screen.",
  "Barista highlights",
  "Quick order guide",
  "Need a recommendation?",
  "Barista highlights",
];

const TRANSLATABLE_STRINGS = Array.from(
  new Set([
    ...BASE_TRANSLATABLE_STRINGS,
    ...CATEGORY_TRANSLATABLE_STRINGS,
    ...DRINK_TRANSLATABLE_STRINGS,
    ...ORDER_SUMMARY_TRANSLATABLE_STRINGS,
  ])
);

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("seasonal");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const translationsCache = useRef<Partial<Record<LanguageCode, Record<string, string>>>>({});

  const filteredDrinks = useMemo(() => {
    if (activeCategory === "all") {
      return drinkMenu;
    }
    return drinkMenu.filter((drink) => drink.category === activeCategory);
  }, [activeCategory]);

  const categoryHelper = useMemo(() => {
    return categories.find((category) => category.id === activeCategory)?.helper;
  }, [activeCategory]);

  const recommendedDrinks = useMemo(() => {
    return filteredDrinks.slice(0, 3);
  }, [filteredDrinks]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    if (language === "en") {
      setTranslations({});
      setTranslationError(null);
      setIsTranslating(false);
      return () => {
        abortController.abort();
      };
    }

    const cached = translationsCache.current[language];
    if (cached) {
      setTranslations(cached);
      setTranslationError(null);
      setIsTranslating(false);
      return () => {
        abortController.abort();
      };
    }

    async function translate() {
      try {
        setIsTranslating(true);
        setTranslationError(null);

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texts: TRANSLATABLE_STRINGS,
            targetLanguage: language,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Translation request failed.");
        }

        const data = (await response.json()) as {
          translations?: Record<string, string>;
        };

        if (!data.translations) {
          throw new Error("Translation data missing.");
        }

        if (!cancelled) {
          translationsCache.current[language] = data.translations;
          setTranslations(data.translations);
          setIsTranslating(false);
        }
      } catch (error) {
        if (cancelled || abortController.signal.aborted) {
          return;
        }
        console.error("Translation error", error);
        setTranslationError("We couldn't translate right now. Showing original text.");
        setIsTranslating(false);
        setTranslations({});
      }
    }

    void translate();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [language]);

  const display = useCallback(
    (text: string | undefined | null) => {
      if (!text) {
        return "";
      }
      return translations[text] ?? text;
    },
    [translations]
  );

  return (
    <main className="order-page">
      <section className="order-hero" aria-labelledby="order-heading">
        <p className="order-kicker">{display("In-store kiosk")}</p>
        <h1 id="order-heading">{display("Craft your ShareTea drink")}</h1>
        <p className="order-subtitle">
          {display(
            "Tap a drink to start customizing sweetness, ice, and toppings. Freshly brewed, ready when your name is called."
          )}
        </p>
      </section>

      <section className="order-language" aria-label="Language selection">
        <label htmlFor="order-language-select">{display("Language")}</label>
        <select
          id="order-language-select"
          className="order-language__select"
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="order-language__status" aria-live="polite">
          {isTranslating && <span>{display("Translating…")}</span>}
          {!isTranslating && translationError && (
            <span className="order-language__status--error">{display("We couldn't translate right now. Showing original text.")}</span>
          )}
        </div>
      </section>

      <section className="order-filters" aria-label="Drink categories">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`filter-chip ${activeCategory === category.id ? "active" : ""}`}
            aria-pressed={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {display(category.label)}
          </button>
        ))}
      </section>

      {categoryHelper && (
        <p className="order-category-note" role="status">
          {display(categoryHelper)}
        </p>
      )}

      <section className="order-layout">
        <div className="order-menu" aria-label="Menu items">
          {filteredDrinks.map((drink) => (
            <article key={drink.name} className="order-card">
              <header className="order-card-header">
                <div className="order-card-title">
                  <span className="order-icon" aria-hidden>{drink.icon}</span>
                  <div>
                    <h2>{display(drink.name)}</h2>
                    {drink.subtitle && <p className="order-card-subtitle">{display(drink.subtitle)}</p>}
                  </div>
                </div>
                {drink.badge && <span className="order-card-badge">{display(drink.badge)}</span>}
                <span className="order-price">${drink.price.toFixed(2)}</span>
              </header>
              <p className="order-description">{display(drink.description)}</p>
              <ul className="order-tags">
                {drink.tags.map((tag) => (
                  <li key={tag}>{display(tag)}</li>
                ))}
              </ul>
              <div className="order-card-actions">
                <button type="button" className="order-button">
                  {display("Customize drink")}
                </button>
                <button type="button" className="order-button order-button--ghost">
                  {display("Quick add")}
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="order-summary" aria-label="Order summary">
          <h2>{display("Quick order guide")}</h2>
          <p>{display("Customize each drink in three intuitive steps:")}</p>
          <ol>
            <li>{display("Select size and ice level.")}</li>
            <li>{display("Choose sweetness and alternative milks.")}</li>
            <li>{display("Add toppings, confirm, and pay at the counter.")}</li>
          </ol>
          <div className="order-tip">
            <h3>{display("Need a recommendation?")}</h3>
            <p>{display("Ask a team member or switch the kiosk to accessibility mode at the bottom of the screen.")}</p>
          </div>
          <div className="order-recommendations">
            <h3>{display("Barista highlights")}</h3>
            <ul>
              {recommendedDrinks.map((drink) => (
                <li key={drink.name}>
                  <span className="order-recommendations__icon" aria-hidden>
                    {drink.icon}
                  </span>
                  <div>
                    <p className="order-recommendations__name">{display(drink.name)}</p>
                    <p className="order-recommendations__note">
                      {drink.subtitle
                        ? display(drink.subtitle)
                        : drink.tags.map((tag) => display(tag)).join(" • ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

