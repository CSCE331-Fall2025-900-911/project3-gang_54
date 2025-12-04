'use client';

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before using router
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/order', label: 'Order' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/login', label: 'Login', isButton: true },
  ];

  const handleNavigation = useCallback((href: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Navigation clicked:', href);
    
    if (!mounted) {
      console.log('Not mounted yet, using window.location');
      window.location.href = href;
      return;
    }

    try {
      console.log('Attempting router.push:', href);
      router.push(href);
    } catch (error) {
      console.error('Navigation error:', error);
      console.log('Falling back to window.location');
      window.location.href = href;
    }
  }, [router, mounted]);

  const handleHomeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Home clicked');
    
    if (!mounted) {
      window.location.href = '/';
      return;
    }

    try {
      router.push('/');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  }, [router, mounted]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
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
        <button
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
          style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit'
          }}
        >
          <h1 className="text-2xl font-bold tracking-wide" style={{ margin: 0 }}>ShareTea</h1>
        </button>
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = link.href;
                }}
                className={link.isButton ? "login_box" : "hover:text-orange-400 transition-colors"}
                style={{ 
                  color: '#fff', 
                  textDecoration: 'none', 
                  cursor: 'pointer',
                  display: 'inline-block',
                  padding: link.isButton ? '10px 18px' : '4px 8px',
                  backgroundColor: link.isButton ? '#ff9900' : 'transparent',
                  borderRadius: link.isButton ? '8px' : '0',
                  fontSize: '16px',
                  border: 'none',
                  font: 'inherit',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {link.isButton ? <strong>{link.label}</strong> : link.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

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
      <button
        onClick={handleHomeClick}
        style={{ 
          textDecoration: 'none', 
          color: 'inherit',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit'
        }}
      >
        <h1 className="text-2xl font-bold tracking-wide" style={{ margin: 0 }}>ShareTea</h1>
      </button>
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
            <button
              onClick={(e) => handleNavigation(link.href, e)}
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
                border: 'none',
                font: 'inherit',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              {link.isButton ? <strong>{link.label}</strong> : link.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
