'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  // Use anchor tags - they work even if JavaScript fails
  const NavLink = ({ link }: { link: typeof navLinks[0] }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Only prevent default if we can use client-side navigation
      // Otherwise, let the anchor tag work naturally
      if (mounted && router) {
        try {
          e.preventDefault();
          console.log('Navigating to:', link.href);
          router.push(link.href);
        } catch (err) {
          console.error('Router push failed, using default navigation:', err);
          // Don't prevent default - let the anchor tag work
        }
      }
      // If not mounted or router fails, let default anchor behavior work
    };

    return (
      <a
        href={link.href}
        onClick={handleClick}
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
    );
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (mounted && router) {
      try {
        e.preventDefault();
        console.log('Navigating to home');
        router.push('/');
      } catch (err) {
        console.error('Router push failed, using default navigation:', err);
        // Let default anchor behavior work
      }
    }
    // If not mounted or router fails, let default anchor behavior work
  };

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
        onClick={handleHomeClick}
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
            <NavLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
