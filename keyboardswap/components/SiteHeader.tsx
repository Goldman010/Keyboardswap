"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SiteHeaderProps = {
  maxWidth?: string;
  subtitle?: string;
  showSubmitLink?: boolean;
};

export function SiteHeader({
  maxWidth = "max-w-6xl",
  subtitle,
  showSubmitLink = false,
}: SiteHeaderProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setEmail(data.session?.user.email ?? null);
        setIsLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div
        className={`mx-auto flex items-center justify-between px-6 py-4 ${maxWidth}`}
      >
        <div>
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            KeyboardSwap
          </Link>
          {subtitle ? (
            <p className="text-sm text-zinc-500">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-4 text-sm">
          {showSubmitLink ? (
            <Link
              href="/submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Sell a keyboard
            </Link>
          ) : null}

          {isLoading ? (
            <span className="text-zinc-400">...</span>
          ) : email ? (
            <>
              <span className="hidden text-zinc-600 sm:inline">{email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="font-medium text-zinc-600 hover:text-zinc-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-zinc-600 hover:text-zinc-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-700"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
