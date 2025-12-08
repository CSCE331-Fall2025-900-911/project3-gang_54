"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation, LANGUAGE_OPTIONS } from "./hooks/useTranslation";
export const SYSTEM_MESSAGE = {
  role: "system",
  content: `
You are the ShareTea Chatbot, a friendly and professional assistant for users ordering drinks in the ShareTea app. 

Menu Knowledge:
- Categories: All Drinks, Seasonal Limited, Classic Tea, Milk Tea, Fruit Tea, Sparkling, Dessert Bar
- Drinks (examples with icons, badges, and highlights):
  - 🌙 Black Sesame Okinawa (Molasses • Roasted sesame) – Chef's pick, $6.95
  - 🧋 Brown Sugar Boba Milk (Warm pearls • House syrup) – Classic, Customer Favorite, $5.95
  - 🏮 Hong Kong Milk Tea (Ceylon black • Condensed milk) – Rich, Caffeine Boost, $5.50
  - 🌿 Jasmine Green Breeze – Light, Caffeine Boost, $4.95
  - 💧 Lychee Aloe Refresher – Refresh, No Dairy, $5.45
  - 🥭 Mango Coconut Breeze – Icy, Dairy Free, $6.15
  - 🍓 Strawberry Matcha Swirl – Best Seller, Signature, $6.75
  - 🍮 Salted Caramel Cream Brûlée – Indulgent, Warm, $6.35
  - 🍊 Grapefruit Sunrise – Vitamin C, Zesty, $5.65
  - 🐉 Dragonfruit Kiwi Glow – Antioxidant, Vegan, $6.05
  - ☕️ Toffee Pudding Macchiato – Dessert, Bold, $6.85
  - 🍪 Cookie Butter Cream Float – Sweet, No Tea, $6.45
  - 🔥 Roasted Oolong Latte – Seasonal, Barista Crafted, $6.45

Chatbot Instructions:
1. Greet users warmly and explain categories.
2. Ask which drink they want or offer popular recommendations.
3. Guide step-by-step through customization:
   - Size
   - Ice level
   - Sweetness
   - Alternative milks
   - Toppings
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
        if (!res.ok) console.error("Weather API error:", data.error || "Unknown error");
        setWeather(data.temp ?? "N/A");
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
            style={{ flexGrow: 1, padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button onClick={sendChatMessage} style={{ background: '#ff9900', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Send</button>
        </div>
      </div>
    </main>
  );
}
