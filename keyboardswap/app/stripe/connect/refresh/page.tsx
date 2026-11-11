"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StripeRefreshPage() {
  const [error, setError] = useState(false);

  useEffect(() => {
    async function refreshLink() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const { url } = (await res.json()) as { url: string };
        window.location.href = url;
      } else {
        setError(true);
      }
    }

    refreshLink();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p className="text-sm text-zinc-500">
        {error
          ? "Something went wrong. Please return to My Listings and try again."
          : "Preparing your payout setup…"}
      </p>
    </div>
  );
}
