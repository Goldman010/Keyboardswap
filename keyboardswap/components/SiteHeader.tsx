"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { navLinkActiveClass, navLinkClass } from "@/lib/ui";

const NAV_LINKS = [
  { href: "/listings", label: "Browse" },
  { href: "/submit", label: "Sell" },
  { href: "/my-listings", label: "My Listings" },
  { href: "/admin", label: "Admin" },
] as const;

function navLinkClasses(href: string, pathname: string) {
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return isActive
    ? `${navLinkClass} ${navLinkActiveClass}`
    : navLinkClass;
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-zinc-900">
          KeyboardSwap
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClasses(link.href, pathname)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          {isLoading ? (
            <span className="text-zinc-400">...</span>
          ) : email ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-zinc-600 sm:inline">
                {email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className={navLinkClass}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass}>
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
