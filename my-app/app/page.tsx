export default function Home() {
  return (
    <main className="home-container">
      <div className="home-box">
        <h1>Welcome to ShareTea</h1>
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
            <img src="/coffee.jpg" />
            <p>Coffee Milk Tea</p>
          </div>
          <div className="drink-card">
            <img src="green.jpg" />
            <p>Classic Green Tea</p>
          </div>
          <div className="drink-card">
            <img src="mango.jpg"/>
            <p>Coffee Milk Tea</p>
          </div>
        </div>
      </section>
    </main>
  );
}
