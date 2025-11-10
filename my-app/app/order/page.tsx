const drinkMenu = [
  {
    name: "Roasted Oolong Latte",
    description: "Slow-brewed oolong with creamy oat milk and a hint of raw sugar.",
    price: 6.25,
    tags: ["Seasonal", "Barista Crafted"],
  },
  {
    name: "Brown Sugar Boba Milk",
    description: "House-made brown sugar syrup with fresh milk and warm pearls.",
    price: 5.75,
    tags: ["Classic", "Customer Favorite"],
  },
  {
    name: "Jasmine Green Tea",
    description: "Fragrant jasmine tea shaken cold with a touch of cane syrup.",
    price: 4.95,
    tags: ["Light", "Caffeine Boost"],
  },
  {
    name: "Mango Coconut Breeze",
    description: "Sun-ripe mango nectar blended with coconut milk over crushed ice.",
    price: 5.95,
    tags: ["Icy", "Dairy Free"],
  },
  {
    name: "Strawberry Matcha Swirl",
    description: "Ceremonial matcha layered with strawberry puree and milk foam.",
    price: 6.65,
    tags: ["Signature", "Instagram Ready"],
  },
  {
    name: "Lychee Sparkling Tea",
    description: "Bright lychee syrup with sparkling jasmine tea and citrus pearls.",
    price: 5.45,
    tags: ["Refresh", "No Dairy"],
  },
];

const categories = ["Seasonal", "Classics", "Fruit Teas", "Milk Teas", "Sparkling"];

export default function OrderPage() {
  return (
    <main className="order-page">
      <section className="order-hero" aria-labelledby="order-heading">
        <p className="order-kicker">In-store kiosk</p>
        <h1 id="order-heading">Craft your ShareTea drink</h1>
        <p className="order-subtitle">
          Tap a drink to start customizing sweetness, ice, and toppings. Freshly brewed, ready when your name is called.
        </p>
      </section>

      <section className="order-filters" aria-label="Drink categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-chip ${category === "Seasonal" ? "active" : ""}`}
            aria-pressed={category === "Seasonal"}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="order-layout">
        <div className="order-menu" aria-label="Menu items">
          {drinkMenu.map((drink) => (
            <article key={drink.name} className="order-card">
              <header className="order-card-header">
                <h2>{drink.name}</h2>
                <span className="order-price">${drink.price.toFixed(2)}</span>
              </header>
              <p className="order-description">{drink.description}</p>
              <ul className="order-tags">
                {drink.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <button type="button" className="order-button">
                Customize drink
              </button>
            </article>
          ))}
        </div>

        <aside className="order-summary" aria-label="Order summary">
          <h2>Quick order guide</h2>
          <p>Customize each drink in three intuitive steps:</p>
          <ol>
            <li>Select size and ice level.</li>
            <li>Choose sweetness and alternative milks.</li>
            <li>Add toppings, confirm, and pay at the counter.</li>
          </ol>
          <div className="order-tip">
            <h3>Need a recommendation?</h3>
            <p>Ask a team member or switch the kiosk to accessibility mode at the bottom of the screen.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

