"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreateListingForm } from "@/components/CreateListingForm";
import { supabase } from "@/lib/supabaseClient";
import { cardClass, primaryButtonClass } from "@/lib/ui";

export function SubmitContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setIsAuthenticated(Boolean(data.session));
        setIsLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-zinc-500">Checking login status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={cardClass}>
        <p className="text-zinc-600">
          You must be logged in to submit a listing.
        </p>
        <Link href="/login" className={`${primaryButtonClass} mt-4 inline-block`}>
          Log in to continue
        </Link>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <CreateListingForm onSuccess="inline" />
    </div>
  );
}
