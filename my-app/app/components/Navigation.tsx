'use client';

import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/order', label: 'Order' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/login', label: 'Login', isButton: true },
  ];

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
        <h1 className="text-2xl font-bold tracking-wide" style={{ margin: 0 }}>ShareTea</h1>
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
