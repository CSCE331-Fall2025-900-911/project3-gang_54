export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* ✅ HERO Section */}
      <section className="w-full h-[60vh] bg-[url('/mango.jpg')] bg-cover bg-center flex flex-col justify-center items-center text-white text-center shadow-xl">
        <div className="bg-black/50 w-full h-full flex flex-col items-center justify-center p-6">
          <h1 className="text-5xl font-bold drop-shadow-lg">Welcome to ShareTea</h1>
          <p className="text-xl mt-4 max-w-xl drop-shadow-lg">
            Your favorite bubble tea — fresh, fast, and customizable.
          </p>

          <div className="flex gap-4 mt-6">
            <a href="/order" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-semibold">
              Order Now
            </a>
            <a href="/login" className="px-6 py-3 bg-white text-black rounded-xl text-lg font-semibold shadow-lg hover:bg-gray-200">
              Login
            </a>
          </div>
        </div>
      </section>

      {/* ✅ Featured Drinks Section */}
      <section className="max-w-6xl w-full px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Drinks</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { name: "Coffee Milk Tea", img: "/coffee.jpg" },
            { name: "Classic Green Tea", img: "/green.jpg" },
            { name: "Mango Smoothie", img: "/mango.jpg" },
          ].map((drink) => (
            <div
              key={drink.name}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-[1.03] transition"
            >
              <img
                src={drink.img}
                alt={drink.name}
                className="w-48 h-48 object-cover rounded-xl mb-4"
              />
              <p className="text-xl font-semibold">{drink.name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
