"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation, LANGUAGE_OPTIONS } from "./hooks/useTranslation";
export const SYSTEM_MESSAGE = {
  role: "system",
  content: `
You are the ShareTea Chatbot, a friendly and professional assistant for users ordering drinks in the ShareTea app. 

Menu Knowledge:
- Categories: All Drinks, Seasonal Limited, Milk Tea, Fruit Tea, Sparkling, Dessert Bar, Coffee
Drinks (examples with icons, badges, highlights, and category):

🌙 Black Sesame Okinawa (Molasses • Roasted sesame) – Chef’s pick, Limited, Nutty, $6.95
Category: Seasonal

🌿 Jasmine Green Breeze (Light floral • Cane sugar) – Light, Caffeine Boost, $4.95
Category: Fruit Tea

💧 Lychee Aloe Refresher (Jasmine tea • Lychee pearls) – Refresh, No Dairy, $5.45
Category: Sparkling

🥭 Mango Coconut Breeze (Thai coconut • Golden mango) – Icy, Dairy Free, $6.15
Category: Fruit Tea

🍓 Strawberry Matcha Swirl (Ceremonial matcha • Berry purée) – Best Seller, Signature, Instagram Ready, $6.75
Category: Milk Tea

🍮 Salted Caramel Cream Brûlée (Salt cream • Torched sugar) – Indulgent, Warm, $6.35
Category: Milk Tea

🍊 Grapefruit Sunrise (Ruby red • Basil seed) – Vitamin C, Zesty, $5.65
Category: Sparkling

🐉 Dragonfruit Kiwi Glow (Cold brew white tea • Aloe) – Antioxidant, Vegan, $6.05
Category: Fruit Tea

☕️ Toffee Pudding Macchiato (Espresso crema • Toffee whip) – Dessert, Bold, $6.85
Category: Dessert

🍪 Cookie Butter Cream Float (Speculoos crumble • Vanilla milk) – Sweet, No Tea, $6.45
Category: Dessert

🧋 Brown Sugar Boba Milk (Warm pearls • House syrup) – Classic, Customer Favorite, $5.95
Category: Milk Tea

🏮 Hong Kong Milk Tea (Ceylon black • Condensed milk) – Rich, Caffeine Boost, $5.50
Category: Milk Tea

🔥 Roasted Oolong Latte (Oat milk • Toasted sugar cap) – New Harvest, Seasonal, Barista Crafted, $6.45
Category: Seasonal

🍓 Strawberry Tea (Fresh berry • Green tea) – Fruity, Vitamin C, $4.95
Category: Fruit Tea

🍑 Peach Tea (Yellow peach • Fragrant oolong) – Refresh, Aromatic, $4.95
Category: Fruit Tea

🥭 Mango Slush (Golden mango • Ice-blended) – Icy, Tropical, $5.65
Category: Smoothies / Slushes

🍓 Strawberry Smoothie (Real berries • Creamy blend) – Smooth, Customer Favorite, $6.15
Category: Smoothies / Slushes

🍵 Matcha Smoothie (Ceremonial matcha • Ice-blended) – Bold, Energy Boost, $6.45
Category: Smoothies / Slushes

🍠 Taro Smoothie (Rooted sweetness • Creamy ice blend) – Comfort, Sweet, $6.25
Category: Smoothies / Slushes

💛 Passion Fruit Smoothie (Tart passionfruit • Bright & icy) – Zesty, Refreshing, $6.15
Category: Smoothies / Slushes

☕️ Americano (Bold espresso • Clean finish) – Bold, Caffeine Boost, $4.75
Category: Coffee

🍫 Mocha Iced (Cocoa • Espresso blend) – Sweet, Rich, $5.65
Category: Coffee

🍮 Caramel Latte (Espresso • Buttery caramel) – Warm, Comfort, $5.95
Category: Coffee

⚡️ Coffee Milk Tea (Black tea • Espresso shot) – Fan Favorite, Fusion, Caffeine Boost, $5.85
Category: Coffee

🍃 Peppermint Milk Tea (Fresh mint • Winter sweet) – Winter Special, Minty, Seasonal, $5.75
Category: Seasonal

🌸 Peach Blossom Oolong (Floral peach • Spring tea) – Spring Limited, Floral, Light, $5.95
Category: Seasonal

🍯 Honey Citrus Tea (Honey lemon • Warming citrus) – Seasonal, Vitamin C, Warm, $4.95
Category: Seasonal

🍈 Winter Melon Milk Tea (Caramel melon • Smooth & sweet) – Winter Favorite, Classic, Sweet, $5.75
Category: Seasonal

🧋 Classic Milk Tea (Assam black • Creamy finish) – Classic, Caffeine Boost, $5.25
Category: Milk Tea

🌼 Jasmine Milk Tea (Floral jasmine • Light & airy) – Light, Classic, $5.25
Category: Milk Tea

🍃 Oolong Milk Tea (Roasted oolong • Deep aroma) – Roasted, Classic, $5.45
Category: Milk Tea

🍠 Taro Milk Tea (Purple taro • Creamy comfort) – Sweet, Comfort, $5.75
Category: Milk Tea

🍋 Earl Grey Milk Tea (Bergamot • Soft vanilla) – Caffeine Boost, Elegant, $5.50
Category: Milk Tea

Chatbot Instructions:
1. Greet users warmly and explain categories.
2. Ask which drink they want or offer popular recommendations.
3. Guide step-by-step through customization:
   - Size
   - Sweetness
   - Ice level
   - Temperature
   - Toppings (various kinds of pearls)
4. Show cart summary and confirm adding items.
5. Explain checkout steps (without processing payment).
6. Support Google login for staff/customers if asked.
7. Respond politely if drink is unavailable or cart is empty.
8. Always use a friendly, concise, and professional tone.
9. Respect the language selection in the app.

Keep context of user's current cart, selected category, and ongoing order. Never suggest drinks outside the menu.
`
};

export default function Home() {
  // Weather state
  const [weather, setWeather] = useState<string | number | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Translation strings
  const TRANSLATABLE_STRINGS = useMemo(() => [
    "Welcome to ShareTea",
    "Current Weather:",
    "Your favorite bubble tea, just a click away!",
    "Login",
    "Order Now",
    "Featured Drinks",
    "Coffee Milk Tea",
    "Classic Green Tea",
    "Mango Fruit Tea",
    "Language",
    "Translating…",
  ], []);

  const { language, setLanguage, display, isTranslating } = useTranslation(TRANSLATABLE_STRINGS);

  // Fetch weather
  useEffect(() => {
    async function fetchWeather() {
      try {
        setWeatherLoading(true);
        const res = await fetch("/api/weather");
        const data = await res.json();
        
        if (data.isRealData) {
          console.log("✅ Weather API: Using real weather data");
          setWeather(data.temp ?? "N/A");
        } else {
          console.warn("⚠️ Weather API: Using fallback data", data.error || "API key not configured");
          setWeather(data.temp ?? "N/A");
        }
        
        if (!res.ok && data.error) {
          console.error("Weather API error:", data.error);
        }
      } catch (error) {
        console.error("Weather fetch error", error);
        setWeather("N/A");
      } finally {
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, []);

  // Send chatbot message
  async function sendChatMessage() {
    if (!chatInput.trim()) return;

    const newMessages = [...chatMessages, { role: "user", content: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [SYSTEM_MESSAGE, ...newMessages] }),
    });

    const data = await res.json();

    setChatMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);
  }

  return (
    <main className="home-container">
      {/* Language selector */}
      <section className="home-language" aria-label="Language selection" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="home-language-select" style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{display("Language")}</label>
        <select
          id="home-language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value as "en" | "es" | "zh")}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: '2px solid rgba(255, 153, 0, 0.3)',
            background: 'rgba(255, 153, 0, 0.1)',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code} style={{ background: '#1a1a1a', color: '#fff' }}>
              {option.label}
            </option>
          ))}
        </select>
        {isTranslating && <span style={{ color: '#ff9900', fontSize: '14px' }}>{display("Translating…")}</span>}
      </section>

      {/* Home content */}
      <div className="home-box">
        <h1 className="title-heading">{display("Welcome to ShareTea")}</h1>

        <p className="weather-text">
          {display("Current Weather:")} {weatherLoading ? "Loading..." : `${weather}°F`}
        </p>

        <p>{display("Your favorite bubble tea, just a click away!")}</p>

        <hr />

        <div className="home-buttons">
          <a href="/login" className="button">{display("Login")}</a>
          <a href="/order" className="button">{display("Order Now")}</a>
        </div>
      </div>

      {/* Featured drinks */}
      <section className="featured-drinks">
        <h2>{display("Featured Drinks")}</h2>

        <div className="drinks-grid">
          <div className="drink-card">
            <img src="/coffee.jpg" alt={display("Coffee Milk Tea")} />
            <p>{display("Coffee Milk Tea")}</p>
          </div>

          <div className="drink-card">
            <img src="/green.jpg" alt={display("Classic Green Tea")} />
            <p>{display("Classic Green Tea")}</p>
          </div>

          <div className="drink-card">
            <img src="/mango.jpg" alt={display("Mango Fruit Tea")} />
            <p>{display("Mango Fruit Tea")}</p>
          </div>
        </div>
      </section>

      {/* Chatbot - floating at bottom right */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        zIndex: 50,
        background: '#1a1a1a',
        padding: '10px',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      }}>
        <h3 style={{ color: '#ff9900', marginBottom: '8px' }}>Chatbot</h3>

        <div style={{
          height: '200px',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '8px',
          padding: '8px',
          marginBottom: '8px'
        }}>
          {chatMessages.map((m, i) => (
            <div key={i} style={{ textAlign: m.role === "user" ? 'right' : 'left', marginBottom: '6px' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '6px',
                background: m.role === "user" ? '#ff9900' : '#eee',
                color: m.role === "user" ? '#fff' : '#000',
              }}>
                {m.content}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flexGrow: 1, padding: '6px', borderRadius: '6px', border: '1px solid #ccc', color: '#fff' }}
          />
          <button onClick={sendChatMessage} style={{ background: '#ff9900', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Send</button>
        </div>
      </div>
    </main>
  );
}
