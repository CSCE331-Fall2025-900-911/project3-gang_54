'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation, LANGUAGE_OPTIONS } from "../hooks/useTranslation";

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

export default function OrderPage() {
  const [drinkMenu, setDrinkMenu] = useState<Drink[]>([]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/ordermenu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data: Drink[] = await res.json();
        setDrinkMenu(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMenu();
  }, []);

  const [activeCategory, setActiveCategory] = useState<CategoryId>("seasonal");
  const [cart, setCart] = useState<Drink[]>([]);

  const filteredDrinks = useMemo(() => {
    if (activeCategory === "all") return drinkMenu;
    return drinkMenu.filter((drink) => drink.category === activeCategory);
  }, [activeCategory, drinkMenu]);

  const categoryHelper = useMemo(() => {
    return categories.find((category) => category.id === activeCategory)?.helper;
  }, [activeCategory]);

  const recommendedDrinks = useMemo(() => filteredDrinks.slice(0, 3), [filteredDrinks]);

  // Memoize translatable strings to prevent infinite loops
  const TRANSLATABLE_STRINGS = useMemo(() => {
    const categoryStrings = categories.flatMap((category) =>
      category.helper ? [category.label, category.helper] : [category.label]
    );

    const drinkStrings = drinkMenu.flatMap((drink) => {
      const strings = [drink.name, drink.description];
      if (drink.subtitle) strings.push(drink.subtitle);
      if (drink.badge) strings.push(drink.badge);
      drink.tags?.forEach((tag) => strings.push(tag));
      return strings;
    });

    const orderStrings = [
      "Quick order guide",
      "Customize each drink in three intuitive steps:",
      "Select size and ice level.",
      "Choose sweetness and alternative milks.",
      "Add toppings, confirm, and pay at the counter.",
      "Need a recommendation?",
      "Ask a team member or switch the kiosk to accessibility mode at the bottom of the screen.",
      "Barista highlights",
    ];

    return Array.from(new Set([...BASE_TRANSLATABLE_STRINGS, ...categoryStrings, ...drinkStrings, ...orderStrings]));
  }, [drinkMenu]);

  const { language, setLanguage, display, isTranslating, translationError } = useTranslation(TRANSLATABLE_STRINGS);

  const addToCart = useCallback((drink: Drink) => setCart((prev) => [...prev, drink]), []);
  const removeFromCart = useCallback((index: number) => setCart((prev) => prev.filter((_, i) => i !== index)), []);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price), 0), [cart]);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <main className="order-page">
      {/* ... your JSX unchanged ... */}
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
          onChange={(event) => setLanguage(event.target.value as "en" | "es" | "zh")}
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

      {categoryHelper && <p className="order-category-note" role="status">{display(categoryHelper)}</p>}

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
                <span className="order-price">${Number(drink.price).toFixed(2)}</span>
              </header>
              <p className="order-description">{display(drink.description)}</p>
              <ul className="order-tags">
                {drink.tags.map((tag) => (<li key={tag}>{display(tag)}</li>))}
              </ul>
              <div className="order-card-actions">
                <button type="button" className="order-button">{display("Customize drink")}</button>
                <button
                  type="button"
                  className="order-button order-button--ghost"
                  onClick={() => { addToCart(drink); setCartOpen(true); }}
                >
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
                  <span className="order-recommendations__icon" aria-hidden>{drink.icon}</span>
                  <div>
                    <p className="order-recommendations__name">{display(drink.name)}</p>
                    <p className="order-recommendations__note">
                      {drink.subtitle ? display(drink.subtitle) : drink.tags.map((tag) => display(tag)).join(" • ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <div className={"cart-sidebar" + (cartOpen && " open")}>
        <div className="cart-header">
          <h2>Your Order</h2>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {cart.length === 0 && <p className="cart-empty">Your cart is empty.</p>}

        <ul className="cart-items">
          {cart.map((item, index) => (
            <li key={index} className="cart-item">
              <div className="cart-item-info">
                <span className="cart-item-name">{item.icon} {item.name}</span>
                <span className="cart-item-price">${Number(item.price).toFixed(2)}</span>
              </div>
              <button className="cart-remove" onClick={() => removeFromCart(index)}>Remove</button>
            </li>
          ))}
        </ul>

        {cart.length > 0 && (
          <div className="cart-footer">
            <p className="cart-total">Total: ${Number(cartTotal).toFixed(2)}</p>
            <button className="cart-checkout">Checkout</button>
          </div>
        )}
      </div>
      <button type="button" className="cart-toggle-button" onClick={() => setCartOpen(true)}>
        View Cart ({cart.length})
      </button>
    </main>
  );
}
