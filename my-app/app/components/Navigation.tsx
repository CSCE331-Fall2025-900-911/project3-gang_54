'use client';

import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white shadow-md flex justify-between items-center px-6 py-4 z-50">
      <h1 className="text-2xl font-bold tracking-wide">ShareTea</h1>
      <ul className="flex gap-6">
        <li>
          <Link href="/" className="hover:text-orange-400 transition-colors">
            Home
          </Link>
        </li>
        <li>
          <Link href="/order" className="hover:text-orange-400 transition-colors">
            Order
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="hover:text-orange-400 transition-colors">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/login" className="hover:text-orange-400 transition-colors login_box">
            <strong>Login</strong>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

