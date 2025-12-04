'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed top-0 left-0 w-full bg-black text-white shadow-md flex justify-between items-center px-6 py-4 z-50"
      style={{ zIndex: 50, pointerEvents: 'auto', position: 'fixed' }}
    >
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1 className="text-2xl font-bold tracking-wide">ShareTea</h1>
      </Link>
      <ul className="flex gap-6" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center' }}>
        <li>
          <Link 
            href="/" 
            className="hover:text-orange-400 transition-colors"
            style={{ 
              color: pathname === '/' ? '#ff9900' : '#fff', 
              textDecoration: 'none', 
              cursor: 'pointer',
              display: 'block',
              padding: '4px 8px'
            }}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            href="/order" 
            className="hover:text-orange-400 transition-colors"
            style={{ 
              color: pathname === '/order' ? '#ff9900' : '#fff', 
              textDecoration: 'none', 
              cursor: 'pointer',
              display: 'block',
              padding: '4px 8px'
            }}
          >
            Order
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard" 
            className="hover:text-orange-400 transition-colors"
            style={{ 
              color: pathname === '/dashboard' ? '#ff9900' : '#fff', 
              textDecoration: 'none', 
              cursor: 'pointer',
              display: 'block',
              padding: '4px 8px'
            }}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            href="/login" 
            className="hover:text-orange-400 transition-colors login_box"
            style={{ 
              color: '#fff', 
              textDecoration: 'none', 
              cursor: 'pointer',
              display: 'block',
              padding: '10px 18px',
              backgroundColor: '#ff9900',
              borderRadius: '8px'
            }}
          >
            <strong>Login</strong>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

