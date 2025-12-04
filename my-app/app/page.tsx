"use client";

import { useState, useEffect } from "react";
import { useTranslation, LANGUAGE_OPTIONS } from "./hooks/useTranslation";

export default function Home() {
  const [weather, setWeather] = useState<string | number | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const TRANSLATABLE_STRINGS = [
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
  ];

  const { language, setLanguage, display, isTranslating } = useTranslation(TRANSLATABLE_STRINGS);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setWeatherLoading(true);
        const res = await fetch("/api/weather");
        if (!res.ok) throw new Error("Weather API failed");
        const data = await res.json();
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

  return (
    <main className="home-container">
      <section className="home-language" aria-label="Language selection" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
        <label htmlFor="home-language-select">{display("Language")}</label>
        <select
          id="home-language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value as "en" | "es" | "zh")}
          style={{ padding: '8px 16px', borderRadius: '999px', border: '1px solid rgba(0,0,0,0.2)' }}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        {isTranslating && <span>{display("Translating…")}</span>}
      </section>

      <div className="home-box">
        <h1 className="title-heading">{display("Welcome to ShareTea")}</h1>

        <p className="weather-text">
          {display("Current Weather:")} {weatherLoading ? "Loading..." : `${weather}°F`}
        </p>

        <p>{display("Your favorite bubble tea, just a click away!")}</p>

        <hr />

        <div className="home-buttons">
          <a href="/login" className="button">
            {display("Login")}
          </a>
          <a href="/order" className="button">
            {display("Order Now")}
          </a>
        </div>
      </div>

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
    </main>
  );
}
