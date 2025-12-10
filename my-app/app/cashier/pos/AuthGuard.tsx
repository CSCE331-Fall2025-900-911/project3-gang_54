"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.push("/"); // not logged in
          return;
        }

        if (!data.user.roles?.includes("cashier")) {
          router.push("/"); // logged in but not cashier
          return;
        }

        setLoading(false);
      })
      .catch(() => router.push("/"));
  }, [router]);

  if (loading) return <div className="p-8 text-xl">Loading...</div>;

  return <>{children}</>;
}
