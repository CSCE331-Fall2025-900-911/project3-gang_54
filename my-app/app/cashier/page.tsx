"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useRouter } from "next/navigation";

interface AuthenticatedUser {
  email: string;
  name: string;
  role: string;
  picture?: string | null;
}

export default function CashierPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const TRANSLATABLE_STRINGS = [
    "Cashier Dashboard",
    "Welcome",
    "View Orders",
    "Process Payment",
    "Order History",
    "Sign out",
    "You're signed out. See you soon!",
    "We couldn't sign you out. Please try again.",
    "Something went wrong signing out.",
    "Language",
    "Translating…",
  ];

  const { language, setLanguage, display, isTranslating } = useTranslation(TRANSLATABLE_STRINGS);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) {
          console.error("Session fetch failed:", res.status);
          setLoading(false);
          setTimeout(() => router.push("/login"), 100);
          return;
        }

        const data = await res.json();
        console.log("Session data:", data); // Debug log
        
        if (data?.user) {
          console.log("User role:", data.user.role); // Debug log
          if (data.user.role !== "cashier") {
            setLoading(false);
            console.log("User is not cashier, redirecting..."); // Debug log
            // Redirect managers to manager dashboard, customers to home
            if (data.user.role === "manager") {
              setTimeout(() => router.push("/dashboard"), 100);
            } else {
              setTimeout(() => router.push("/"), 100);
            }
            return;
          }
          console.log("Setting user as cashier"); // Debug log
          setUser(data.user);
          setLoading(false);
        } else {
          console.log("No user in session data"); // Debug log
          setLoading(false);
          setTimeout(() => router.push("/login"), 100);
        }
      } catch (error) {
        console.error("Unable to restore session", error);
        setLoading(false);
        setTimeout(() => router.push("/login"), 100);
      }
    }
    fetchSession();
  }, [router]);

  const handleSignOut = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { method: "DELETE" });
      if (!res.ok) {
        throw new Error("We couldn't sign you out. Please try again.");
      }

      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error", error);
      alert(error instanceof Error ? error.message : "Something went wrong signing out.");
    }
  }, [router]);

  if (loading) {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        <p>Redirecting...</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "10px" }}>
          If you're not redirected, <a href="/login" style={{ color: "#ff9900" }}>click here to login</a>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 8px 0" }}>{display("Cashier Dashboard")}</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            {display("Welcome")}, {user.name}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "10px 20px",
            background: "#ff9900",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {display("Sign out")}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "12px" }}>{display("View Orders")}</h2>
          <p style={{ opacity: 0.7, marginBottom: "20px" }}>
            View and manage incoming orders from customers
          </p>
          <button
            onClick={() => router.push("/order")}
            style={{
              padding: "12px 24px",
              background: "#ff9900",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              width: "100%",
            }}
          >
            {display("View Orders")}
          </button>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "12px" }}>{display("Process Payment")}</h2>
          <p style={{ opacity: 0.7, marginBottom: "20px" }}>
            Process customer payments at the counter
          </p>
          <button
            onClick={() => router.push("/cashier/process-payment")}
            style={{
              padding: "12px 24px",
              background: "#ff9900",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              width: "100%",
            }}
          >
            {display("Process Payment")}
          </button>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "12px" }}>{display("Order History")}</h2>
          <p style={{ opacity: 0.7, marginBottom: "20px" }}>
            View past orders and sales history
          </p>
          <button
            onClick={() => router.push("/cashier/order-history")}
            style={{
              padding: "12px 24px",
              background: "#ff9900",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              width: "100%",
            }}
          >
            {display("Order History")}
          </button>
        </div>
      </div>
    </main>
  );
}

