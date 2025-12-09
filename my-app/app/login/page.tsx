"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation, LANGUAGE_OPTIONS } from "../hooks/useTranslation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: "popup" | "redirect";
            auto_select?: boolean;
            context?: "signin" | "signup";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "small" | "medium" | "large";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              logo_alignment?: "left" | "center";
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

type Status = "idle" | "loading" | "success" | "error";

interface AuthenticatedUser {
  name?: string | null;
  email: string;
  role?: string;
  picture?: string | null;
}

export default function LoginPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const buttonRendered = useRef(false);

  const TRANSLATABLE_STRINGS = [
    "Staff & Customers",
    "Welcome back to ShareTea",
    "Use your Google account to access your personalized ShareTea experience. Cashiers and managers can jump straight into their dashboards, while customers can explore curated offers.",
    "One tap entry",
    "No new passwords—authenticate using your campus or personal Google account.",
    "Tailored roles",
    "We route managers, cashiers, and customers to the right workspace automatically.",
    "Sign in to continue",
    "Connecting to Google…",
    "Signed in. Redirecting you shortly...",
    "We couldn't sign you in. Please try again.",
    "Something went wrong.",
    "Signed in as",
    "Go to dashboard",
    "Sign out",
    "You're signed out. See you soon!",
    "We couldn't sign you out. Please try again.",
    "Something went wrong signing out.",
    "Make sure you allow pop-ups in your browser. Need access? Use",
    "No Google account?",
    "Request kiosk credentials",
    "Language",
    "Translating…",
  ];

  const { language, setLanguage, display, isTranslating } = useTranslation(TRANSLATABLE_STRINGS);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        setStatus("success");
      }
    } catch (error) {
      console.error("Unable to restore session", error);
    }
  }, []);

  const handleCredential = useCallback(
    async (credential: string) => {
      setStatus("loading");
      setMessage(null);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "We couldn't sign you in. Please try again.");
        }

        const data = await res.json();
        setUser(data.user);
        setStatus("success");
        setMessage("Signed in. Redirecting you shortly...");
        
        // Auto-redirect based on role
        setTimeout(() => {
          if (data.user.role === "manager") {
            window.location.href = "/dashboard";
          } else if (data.user.role === "cashier") {
            window.location.href = "/cashier";
          } else {
            window.location.href = "/";
          }
        }, 1500);
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Something went wrong.");
      }
    },
    []
  );

  const initializeGoogleButton = useCallback(() => {
    if (buttonRendered.current) return;
    if (!window.google || !buttonRef.current) return;
    if (!clientId) {
      setStatus("error");
      setMessage("Missing Google Client ID. Check NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        if (response?.credential) {
          void handleCredential(response.credential);
        }
      },
      ux_mode: "popup",
      auto_select: false,
      context: "signin",
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: 320,
    });
    buttonRendered.current = true;
  }, [clientId, handleCredential]);

  const handleSignOut = useCallback(async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/auth/session", { method: "DELETE" });
      if (!res.ok) {
        throw new Error("We couldn't sign you out. Please try again.");
      }

      setUser(null);
      setStatus("idle");
      setMessage("You're signed out. See you soon!");
      if (window.google?.accounts.id.prompt) {
        window.google.accounts.id.prompt();
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong signing out.");
    }
  }, []);

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    initializeGoogleButton();

    const timer = window.setInterval(() => {
      initializeGoogleButton();
      if (buttonRendered.current) {
        window.clearInterval(timer);
      }
    }, 500);

    return () => {
      window.clearInterval(timer);
    };
  }, [initializeGoogleButton]);

  return (
    <main className="login-shell">
      <section className="login-language" aria-label="Language selection" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
        <label htmlFor="login-language-select">{display("Language")}</label>
        <select
          id="login-language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value as "en" | "es" | "zh")}
          style={{ padding: '8px 16px', borderRadius: '999px', border: '1px solid rgba(0,0,0,0.2)' }}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        {isTranslating && <span>{display("Translating…")}</span>}
      </section>

      <section className="login-card" aria-label="ShareTea sign in options">
        <div className="login-card__intro">
          <p className="badge">{display("Staff & Customers")}</p>
          <h1>{display("Welcome back to ShareTea")}</h1>
          <p>{display("Use your Google account to access your personalized ShareTea experience. Cashiers and managers can jump straight into their dashboards, while customers can explore curated offers.")}</p>

          <ul className="login-perks" aria-label="Highlights">
            <li>
              <span>•</span>
              <div>
                <h3>{display("One tap entry")}</h3>
                <p>{display("No new passwords—authenticate using your campus or personal Google account.")}</p>
              </div>
            </li>
            <li>
              <span>•</span>
              <div>
                <h3>{display("Tailored roles")}</h3>
                <p>{display("We route managers, cashiers, and customers to the right workspace automatically.")}</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="login-card__action">
          <div className="login-panel">
            <p className="login-panel__title">{display("Sign in to continue")}</p>

            {status === "loading" && <p className="login-panel__status">{display("Connecting to Google…")}</p>}
            {message && status !== "loading" && (
              <p className={`login-panel__status login-panel__status--${status}`}>
                {status === "success" && message === "Signed in. Redirecting you shortly..." ? display("Signed in. Redirecting you shortly...") :
                 status === "success" && message === "You're signed out. See you soon!" ? display("You're signed out. See you soon!") :
                 status === "error" && message.includes("sign you out") ? display("We couldn't sign you out. Please try again.") :
                 status === "error" && message.includes("sign you in") ? display("We couldn't sign you in. Please try again.") :
                 status === "error" ? display("Something went wrong.") : message}
              </p>
            )}

            {user ? (
              <div className="login-session">
                {user.picture ? (
                  <img src={user.picture} alt={`${user.name ?? user.email} profile`} />
                ) : (
                  <div className="login-avatar-fallback">{user.name?.[0] ?? user.email[0]}</div>
                )}
                <div>
                  <p className="login-session__welcome">
                    {display("Signed in as")} <strong>{user.name ?? user.email}</strong>
                  </p>
                  <p className="login-session__email">{user.email}</p>
                </div>
                <div className="login-session__actions">
                  <a 
                    className="secondary-btn" 
                    href={user.role === "manager" ? "/dashboard" : user.role === "cashier" ? "/cashier" : "/"}
                  >
                    {display("Go to dashboard")}
                  </a>
                  <button className="ghost-btn" type="button" onClick={() => void handleSignOut()}>
                    {display("Sign out")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="login-google">
                <div ref={buttonRef} className="login-google__button" />
                <p className="login-google__note">
                  {display("Make sure you allow pop-ups in your browser. Need access? Use")} <strong>reveille.bubbletea@gmail.com</strong>.
                </p>
              </div>
            )}
          </div>

          <footer className="login-footer">
            <p>{display("No Google account?")}</p>
            <a href="mailto:sharetea-support@example.com" className="link">
              {display("Request kiosk credentials")}
            </a>
          </footer>
        </div>
      </section>
    </main>
  );
}
