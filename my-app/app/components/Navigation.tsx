'use client';

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  email: string;
  name: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        setUser(data.user);
        setRole(data.user?.role ?? null);
      } catch {
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  const isEmployee = role && role !== "customer";

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/order', label: 'Order' },
    ...(isEmployee ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    ...(!user
      ? [{ href: '/login', label: 'Login', isButton: true }]
      : [{ href: '/logout', label: 'Logout', isButton: true }]),
  ];

  if (loading) return null;

  return (
    <nav 
      className="fixed top-0 left-0 w-full bg-black text-white shadow-md flex justify-between items-center px-6 py-4"
      style={{
        zIndex: 9999,
        pointerEvents: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px'
      }}
    >
      <a
        href="/"
        style={{ 
          textDecoration: 'none', 
          color: 'inherit',
          cursor: 'pointer'
        }}
      >
        <h1 className="text-2xl font-bold tracking-wide" style={{ margin: 0 }}>
          ShareTea
        </h1>
      </a>

      <ul 
        style={{ 
          listStyle: 'none', 
          margin: 0, 
          padding: 0, 
          display: 'flex', 
          alignItems: 'center',
          gap: '24px'
        }}
      >
        {navLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={link.isButton ? "login_box" : "hover:text-orange-400 transition-colors"}
              style={{
                color: pathname === link.href ? '#ff9900' : '#fff',
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'inline-block',
                padding: link.isButton ? '10px 18px' : '4px 8px',
                backgroundColor: link.isButton ? '#ff9900' : 'transparent',
                borderRadius: link.isButton ? '8px' : '0',
                fontSize: '16px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              {link.isButton ? <strong>{link.label}</strong> : link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}