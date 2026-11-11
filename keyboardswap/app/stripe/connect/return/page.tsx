"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function StripeReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"syncing" | "error">("syncing");

  useEffect(() => {
    async function syncAndRedirect() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/stripe/connect/sync-status", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        router.replace("/my-listings?payout_updated=1");
      } else {
        setStatus("error");
      }
    }

    syncAndRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p className="text-sm text-zinc-500">
        {status === "syncing"
          ? "Updating your payout setup…"
          : "Something went wrong. Please return to My Listings and try again."}
      </p>
    </div>
  );
}
