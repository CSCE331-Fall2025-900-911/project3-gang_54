"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ DEV BYPASS — ONLY ON LOCALHOST
    if (process.env.NODE_ENV === "development") {
      setLoading(false);
      return;
    }

    // ✅ REAL AUTH FOR VERCEL
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.push("/");
          return;
        }

        const roles = data.user.roles || [];

      // allow cashier OR manager
      if (!roles.includes("cashier") && !roles.includes("manager")) {
        router.push("/");
        return;
        }


        setLoading(false);
      })
      .catch(() => router.push("/"));
  }, [router]);

  if (loading) return <div className="p-8 text-xl">Loading...</div>;

  return <>{children}</>;
}
