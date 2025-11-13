"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => setWeather(data.temp))
      .catch(() => setWeather("Unavailable"));
  }, []);

  return (
    <main className="home-container">

      

      <div className="home-box">

  <h1>Welcome to ShareTea</h1>

  <p className="weather-text">
    Current Weather: {weather}°F
  </p>

  <p>Your favorite bubble tea, just a click away!</p>
  <hr />

  <div className="home-buttons">
    <a href="/login" className="button">Login</a>
    <a href="/order" className="button">Order Now</a>
  </div>

</div>


      <section className="featured-drinks">
        <h2>Featured Drinks</h2>
        <div className="drinks-grid">
          <div className="drink-card">
            <img src="/coffee.jpg" alt="Coffee Milk Tea"/>
            <p>Coffee Milk Tea</p>
          </div>
          <div className="drink-card">
            <img src="/green.jpg" alt="Classic Green Tea"/>
            <p>Classic Green Tea</p>
          </div>
          <div className="drink-card">
            <img src="/mango.jpg" alt="Mango Fruit Tea"/>
            <p>Mango Fruit Tea</p>
          </div>
        </div>
      </section>
    </main>
  );
}
