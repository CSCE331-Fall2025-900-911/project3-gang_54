"use client";

import { useEffect, useState } from "react";

interface Item {
  item_id: number;
  item_name: string;
  price: number;
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
  "Milk Tea",
  "Fruit Tea",
  "Milk Drinks",
  "Smoothies",
  "Lattes",
  "Coffee",
  "Seasonal",
];

export default function CashierPOS() {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [size, setSize] = useState("Medium");
  const [sugar, setSugar] = useState("Normal");
  const [ice, setIce] = useState("Medium");
  const [temp, setTemp] = useState("Cold");
  const [boba, setBoba] = useState("Pearls");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch("/api/menu_items")
      .then((res) => res.json())
      .then(setItems);
  }, []);

  function addToCart() {
    if (!selectedItem) return;

    setCart((prev) => [
      ...prev,
      {
        item_id: selectedItem.item_id,
        name: selectedItem.item_name,
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
    };

    fetch("/api/sales_history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      alert("Order Sent!");
      setCart([]);
    });
  }

  return (
    <div className="flex h-screen text-black">
      {/* LEFT: MENU */}
      <div className="w-2/3 p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`p-4 text-lg rounded ${
                category === c ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {items.map((item) => (
            <button
              key={item.item_id}
              onClick={() => setSelectedItem(item)}
              className="p-6 bg-green-300 text-lg rounded shadow"
            >
              {item.item_name}
              <div>${item.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: CART */}
      <div className="w-1/3 bg-gray-100 p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Cart</h2>

        <div className="flex-1 overflow-y-auto">
          {cart.map((c, i) => (
            <div key={i} className="mb-3 p-2 bg-white rounded">
              {c.name} x{c.quantity}
              <div className="text-sm">
                {c.size}, {c.sugar}, {c.ice}, {c.temperature}, {c.boba}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={checkout}
          className="bg-green-600 text-white text-xl p-4 rounded"
        >
          CHECKOUT
        </button>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">
              {selectedItem.item_name}
            </h2>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <select onChange={(e) => setSize(e.target.value)}><option>Small</option><option>Medium</option><option>Large</option></select>
              <select onChange={(e) => setSugar(e.target.value)}><option>Extra</option><option>Normal</option><option>Less</option><option>None</option></select>
              <select onChange={(e) => setIce(e.target.value)}><option>Extra</option><option>Medium</option><option>Less</option><option>None</option></select>
              <select onChange={(e) => setTemp(e.target.value)}><option>Cold</option><option>Hot</option></select>
              <select onChange={(e) => setBoba(e.target.value)}><option>Pearls</option><option>None</option></select>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setQty(qty - 1)}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={addToCart}
                className="bg-blue-600 text-white p-3 rounded w-full"
              >
                ADD
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-gray-400 p-3 rounded w-full"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
