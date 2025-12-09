"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useRouter } from "next/navigation";

interface Order {
  orderId: number;
  timestamp: string;
  items: Array<{
    drinkId: number;
    drinkName: string;
    quantity: number;
    price: number;
    size: string;
    sugar: string;
    ice: string;
    temperature: string;
    boba: string;
  }>;
  total: number;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const router = useRouter();

  const TRANSLATABLE_STRINGS = [
    "Order History",
    "All Orders",
    "Order #",
    "Date",
    "Total",
    "Items",
    "Back to Cashier Dashboard",
    "No orders found",
    "Loading orders...",
    "Size",
    "Sugar",
    "Ice",
    "Temperature",
    "Toppings",
    "Quantity",
    "Select an order to view details",
  ];

  const { language, setLanguage, display, isTranslating } = useTranslation(TRANSLATABLE_STRINGS);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sales_history?limit=100");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        <p>{display("Loading orders...")}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>{display("Order History")}</h1>
        <button
          onClick={() => router.push("/cashier")}
          style={{
            padding: "10px 20px",
            background: "#666",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {display("Back to Cashier Dashboard")}
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", opacity: 0.7 }}>
          <p style={{ fontSize: "1.2rem" }}>{display("No orders found")}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          {/* Orders List */}
          <div>
            <h2 style={{ marginBottom: "20px" }}>{display("All Orders")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "80vh", overflowY: "auto" }}>
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    padding: "20px",
                    background: selectedOrder?.orderId === order.orderId ? "rgba(255, 153, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    border: selectedOrder?.orderId === order.orderId ? "2px solid #ff9900" : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong>{display("Order #")} {order.orderId}</strong>
                    <span style={{ color: "#ff9900", fontWeight: "600" }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", opacity: 0.7, margin: 0 }}>
                    {new Date(order.timestamp).toLocaleString()}
                  </p>
                  <p style={{ fontSize: "0.9rem", marginTop: "8px", marginBottom: 0 }}>
                    {order.items.length} {display("Items")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div>
            {selectedOrder ? (
              <div
                style={{
                  padding: "24px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  position: "sticky",
                  top: "20px",
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
                  {display("Order #")} {selectedOrder.orderId}
                </h2>

                <p style={{ opacity: 0.7, marginBottom: "24px" }}>
                  {new Date(selectedOrder.timestamp).toLocaleString()}
                </p>

                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ marginBottom: "12px" }}>{display("Items")}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "16px",
                          background: "rgba(0, 0, 0, 0.2)",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                          <div>
                            <strong style={{ fontSize: "1.1rem" }}>{item.drinkName}</strong>
                            {item.quantity > 1 && (
                              <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                                ({display("Quantity")}: {item.quantity})
                              </span>
                            )}
                          </div>
                          <strong style={{ color: "#ff9900", fontSize: "1.1rem" }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </strong>
                        </div>
                        <div style={{ fontSize: "0.9rem", opacity: 0.8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "8px" }}>
                          <div>{display("Size")}: {item.size}</div>
                          <div>{display("Sugar")}: {item.sugar}</div>
                          <div>{display("Ice")}: {item.ice}</div>
                          <div>{display("Temperature")}: {item.temperature}</div>
                          <div>{display("Toppings")}: {item.boba}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "16px", background: "rgba(255, 153, 0, 0.1)", borderRadius: "8px", marginTop: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "1.2rem" }}>{display("Total")}:</strong>
                    <strong style={{ fontSize: "1.5rem", color: "#ff9900" }}>
                      ${selectedOrder.total.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <p style={{ opacity: 0.7 }}>{display("Select an order to view details")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

