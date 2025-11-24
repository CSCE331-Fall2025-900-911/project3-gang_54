"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [weather, setWeather] = useState(null);

  // not working rn
  // useEffect(() => {
  //   fetch("/api/weather")
  //     .then((res) => res.json())
  //     .then((data) => setWeather(data.temp))
  //     .catch(() => setWeather("Unavailable"));
  // }, []);

  return (
    <main className="home-container">

      <div className="home-box">

        {/* TITLE — always shows EN or ES based on body class */}
        <h1 className="title-heading">
          <span className="translate-en">Welcome to ShareTea</span>
          <span className="translate-es">Bienvenido a ShareTea</span>
        </h1>

        {/* WEATHER */}
        <p className="weather-text">
          <span className="translate-en">Current Weather: {weather}°F</span>
          <span className="translate-es">Clima Actual: {weather}°F</span>
        </p>

        {/* SUBTITLE */}
        <p>
          <span className="translate-en">
            Your favorite bubble tea, just a click away!
          </span>
          <span className="translate-es">
            ¡Tu bubble tea favorito, a solo un clic!
          </span>
        </p>

        <hr />

        {/* BUTTONS */}
        <div className="home-buttons">

          <a href="/login" className="button">
            <span className="translate-en">Login</span>
            <span className="translate-es">Iniciar Sesión</span>
          </a>

          <a href="/order" className="button">
            <span className="translate-en">Order Now</span>
            <span className="translate-es">Ordenar Ahora</span>
          </a>

        </div>

      </div>

      {/* FEATURED DRINKS */}
      <section className="featured-drinks">
        <h2>
          <span className="translate-en">Featured Drinks</span>
          <span className="translate-es">Bebidas Destacadas</span>
        </h2>

        <div className="drinks-grid">

          {/* DRINK 1 */}
          <div className="drink-card">
            <img src="/coffee.jpg" alt="Coffee Milk Tea" />
            <p>
              <span className="translate-en">Coffee Milk Tea</span>
              <span className="translate-es">Té con Leche y Café</span>
            </p>
          </div>

          {/* DRINK 2 */}
          <div className="drink-card">
            <img src="/green.jpg" alt="Classic Green Tea" />
            <p>
              <span className="translate-en">Classic Green Tea</span>
              <span className="translate-es">Té Verde Clásico</span>
            </p>
          </div>

          {/* DRINK 3 */}
          <div className="drink-card">
            <img src="/mango.jpg" alt="Mango Fruit Tea" />
            <p>
              <span className="translate-en">Mango Fruit Tea</span>
              <span className="translate-es">Té de Mango</span>
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}
