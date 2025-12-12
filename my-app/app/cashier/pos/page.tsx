"use client"; 
import AuthGuard from "./AuthGuard";
import { useEffect, useState } from "react";

interface Item {
  item_id: number;
  name: string;
  price: number;
  category: string;
}

interface CartItem {
  item_id: number;
  name: string;
  price: number;
  size: string;
  sugar: string;
  ice: string;
  temperature: string;
  boba: string;
  quantity: number;
}

const CATEGORIES = [
  { label: "All Drinks", value: "all" },
  { label: "Milk Tea", value: "milk-tea" },
  { label: "Fruit Tea", value: "fruit-tea" },
  { label: "Sparkling", value: "sparkling" },
  { label: "Dessert", value: "dessert" },
  { label: "Seasonal", value: "seasonal" },
  { label: "Coffee", value: "coffee" },
  { label: "Smoothies", value: "smoothies" }

];

export default function CashierPOS() {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<"cash" | "card" | null>(null);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [size, setSize] = useState("Medium");
  const [sugar, setSugar] = useState("Normal");
  const [ice, setIce] = useState("Medium");
  const [temp, setTemp] = useState("Cold");
  const [boba, setBoba] = useState("Pearls");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch("/api/ordermenu", { cache: "no-store" })
      .then((res) => res.json())
      .then(setItems);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  function addToCart() {
    if (!selectedItem) return;

    setCart((prev) => [
      ...prev,
      {
        item_id: selectedItem.item_id,
        name: selectedItem.name,
        price: selectedItem.price,
        size,
        sugar,
        ice,
        temperature: temp,
        boba,
        quantity: qty,
      },
    ]);

    setSelectedItem(null);
    setQty(1);
  }

  function checkout() {
    setShowPayment(true);
  }

  function confirmPayment() {
    const payload = {
      items: cart.map((c) => ({
        item_id: c.item_id,
        quantity: c.quantity,
        price: c.price,
        size: c.size,
        sugar: c.sugar,
        ice: c.ice,
        temperature: c.temperature,
        boba: c.boba,
      })),
      paymentType,
      total: cartTotal,
    };

    fetch("/api/sales_history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      alert(`Payment Successful (${paymentType?.toUpperCase()})`);
      setCart([]);
      setShowPayment(false);
      setPaymentType(null);
    });
  }

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-64px)] text-black overflow-hidden">



        {/* LEFT: MENU */}
        <div className="w-2/3 p-4 flex flex-col">

          <div className="grid grid-cols-4 gap-3 mb-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`p-4 text-lg rounded ${
                  category === c.value ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* 🔥 MAKE THIS SECTION SCROLLABLE + FIXED HEIGHT */}
          <div className="grid grid-cols-4 gap-3 overflow-y-auto" style={{ maxHeight: "70vh" }}>
            {items
              .filter((item) =>  category === "all" || item.category === category.toLowerCase().replace(" ", "-"))
              .map((item) => (
                <button
                  key={item.item_id}
                  onClick={() => setSelectedItem(item)}
                  className="p-6 bg-green-300 text-lg rounded shadow"
                >
                  {item.name}
                  <div>${item.price}</div>
                </button>
              ))}
          </div>
        </div>

        {/* RIGHT: CART */}
<div className="w-1/3 bg-gray-100 p-4 flex flex-col overflow-hidden h-full">
  <h2 className="text-2xl font-bold mb-4">Cart</h2>

  {/* Scrollable list that can shrink */}
  <div className="flex-1 overflow-y-auto min-h-0">
    {cart.map((c, i) => (
      <div key={i} className="mb-3 p-2 bg-white rounded flex justify-between items-center">
        <div>
          {c.name} x{c.quantity}
          <div className="text-sm">
            {c.size}, {c.sugar}, {c.ice}, {c.temperature}, {c.boba}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedItem({
                item_id: c.item_id,
                name: c.name,
                price: c.price,
                category: "",
              });
              setSize(c.size);
              setSugar(c.sugar);
              setIce(c.ice);
              setTemp(c.temperature);
              setBoba(c.boba);
              setQty(c.quantity);
              setCart(cart.filter((_, idx) => idx !== i));
            }}
            className="bg-blue-500 text-white px-2 rounded"
          >
            EDIT
          </button>

          <button
            onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
            className="bg-red-500 text-white px-2 rounded"
          >
            X
          </button>
        </div>
      </div>
    ))}
  </div>

  <div className="mb-3 text-xl font-bold">
    Total: ${cartTotal.toFixed(2)}
  </div>

  <button
    onClick={checkout}
    className="bg-green-600 text-white text-xl p-4 rounded"
  >
    CHECKOUT
  </button>
</div>


        {/* MODALS (unchanged) */}
        {selectedItem && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
    <div className="bg-white p-6 rounded w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">{selectedItem.name}</h2>

      {/* Wide 3-column grid */}
      <div className="grid grid-cols-3 gap-6 text-lg">

        {/* SIZE */}
        <div>
          <label className="font-semibold mb-2 block">Size</label>
          <div className="flex flex-wrap gap-2">
            {["Small", "Medium", "Large"].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-2 rounded ${
                  size === s ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* SUGAR */}
        <div>
          <label className="font-semibold mb-2 block">Sugar</label>
          <div className="flex flex-wrap gap-2">
            {["Extra", "Normal", "Less", "None"].map((s) => (
              <button
                key={s}
                onClick={() => setSugar(s)}
                className={`px-3 py-2 rounded ${
                  sugar === s ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ICE */}
        <div>
          <label className="font-semibold mb-2 block">Ice</label>
          <div className="flex flex-wrap gap-2">
            {["Extra", "Medium", "Less", "None"].map((i) => (
              <button
                key={i}
                onClick={() => setIce(i)}
                className={`px-3 py-2 rounded ${
                  ice === i ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* TEMP */}
        <div>
          <label className="font-semibold mb-2 block">Temp</label>
          <div className="flex flex-wrap gap-2">
            {["Cold", "Hot"].map((t) => (
              <button
                key={t}
                onClick={() => setTemp(t)}
                className={`px-3 py-2 rounded ${
                  temp === t ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* TOPPINGS */}
        <div className="col-span-2">
          <label className="font-semibold mb-2 block">Toppings</label>
          <div className="flex flex-wrap gap-2">
            {["Pearls", "None"].map((b) => (
              <button
                key={b}
                onClick={() => setBoba(b)}
                className={`px-3 py-2 rounded ${
                  boba === b ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Quantity */}
      <div className="flex items-center justify-center gap-6 my-6 text-2xl">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          -
        </button>
        <span>{qty}</span>
        <button
          onClick={() => setQty(qty + 1)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          +
        </button>
      </div>

      {/* Bottom Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={addToCart}
          className="bg-blue-600 text-white p-3 rounded w-full text-xl"
        >
          ADD
        </button>

        <button
          onClick={() => setSelectedItem(null)}
          className="bg-gray-400 p-3 rounded w-full text-xl"
        >
          CANCEL
        </button>
      </div>

    </div>
  </div>
)}


        {showPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-80 text-center">
              <h2 className="text-2xl font-bold mb-4">Select Payment</h2>

              <div className="text-lg mb-4">
                Total: ${cartTotal.toFixed(2)}
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={() => setPaymentType("card")}
                  className={`p-3 rounded ${
                    paymentType === "card" ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  💳 Card
                </button>

                <button
                  onClick={() => setPaymentType("cash")}
                  className={`p-3 rounded ${
                    paymentType === "cash" ? "bg-green-600 text-white" : "bg-gray-200"
                  }`}
                >
                  💵 Cash
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={!paymentType}
                  onClick={confirmPayment}
                  className="bg-black text-white p-3 rounded w-full disabled:opacity-50"
                >
                  CONFIRM
                </button>

                <button
                  onClick={() => {
                    setShowPayment(false);
                    setPaymentType(null);
                  }}
                  className="bg-gray-400 p-3 rounded w-full"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
