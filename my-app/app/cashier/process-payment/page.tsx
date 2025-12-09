"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function ProcessPaymentPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const TRANSLATABLE_STRINGS = [
    "Process Payment",
    "Pending Orders",
    "Select an order to process payment",
    "Order #",
    "Total:",
    "Items:",
    "Payment Method:",
    "Cash",
    "Credit Card",
    "Debit Card",
    "Mobile Pay",
    "Gift Card",
    "Process Payment",
    "Payment processed successfully!",
    "Back to Cashier Dashboard",
    "No pending orders",
    "Loading orders...",
  ];

  const { language, setLanguage, display, isTranslating } = useTranslation(TRANSLATABLE_STRINGS);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sales_history?limit=20");
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

  const handleProcessPayment = async () => {
    if (!selectedOrder) return;

    setProcessing(true);
    try {
      // In a real implementation, you would process the payment here
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      alert(display("Payment processed successfully!"));
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Payment processing error:", error);
      alert("Failed to process payment");
    } finally {
      setProcessing(false);
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
        <h1 style={{ fontSize: "2rem", margin: 0 }}>{display("Process Payment")}</h1>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Orders List */}
        <div>
          <h2 style={{ marginBottom: "20px" }}>{display("Pending Orders")}</h2>
          {orders.length === 0 ? (
            <p style={{ opacity: 0.7 }}>{display("No pending orders")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                    {order.items.length} {display("Items:")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Processing */}
        <div>
          {selectedOrder ? (
            <div
              style={{
                padding: "24px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
                {display("Order #")} {selectedOrder.orderId}
              </h2>

              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ marginBottom: "12px" }}>{display("Items:")}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px",
                        background: "rgba(0, 0, 0, 0.2)",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <strong>{item.drinkName}</strong>
                        <p style={{ fontSize: "0.85rem", opacity: 0.7, margin: "4px 0 0 0" }}>
                          {item.size} • {item.sugar} • {item.ice} • {item.temperature} • {item.boba}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                        {item.quantity > 1 && (
                          <p style={{ fontSize: "0.85rem", opacity: 0.7, margin: 0 }}>
                            x{item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "24px", padding: "16px", background: "rgba(255, 153, 0, 0.1)", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "1.2rem" }}>{display("Total:")}</strong>
                  <strong style={{ fontSize: "1.5rem", color: "#ff9900" }}>
                    ${selectedOrder.total.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
                  {display("Payment Method:")}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "1rem",
                  }}
                >
                  <option value="cash">{display("Cash")}</option>
                  <option value="credit">{display("Credit Card")}</option>
                  <option value="debit">{display("Debit Card")}</option>
                  <option value="mobile">{display("Mobile Pay")}</option>
                  <option value="gift">{display("Gift Card")}</option>
                </select>
              </div>

              <button
                onClick={handleProcessPayment}
                disabled={processing}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: processing ? "#666" : "#ff9900",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: processing ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {processing ? "Processing..." : display("Process Payment")}
              </button>
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
              <p style={{ opacity: 0.7, fontSize: "1.1rem" }}>
                {display("Select an order to process payment")}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

