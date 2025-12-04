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
        const data = await res.json();
        if (!res.ok) {
          console.error("Weather API error:", data.error || "Unknown error");
          setWeather(data.temp ?? "N/A");
        } else {
          setWeather(data.temp ?? "N/A");
        }
        // Show error in console if API key is missing
        if (data.error && data.error.includes("not configured")) {
          console.warn("Weather API:", data.error);
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

  return (
    <main className="home-container">
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
