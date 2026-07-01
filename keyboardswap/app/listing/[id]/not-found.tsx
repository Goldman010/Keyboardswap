import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { navLinkClass } from "@/lib/ui";

export default function ListingNotFound() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-4xl">
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-zinc-500">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Listing not found
          </h1>
          <p className="mt-3 text-zinc-600">
            This listing may have been removed or is not yet approved.
          </p>
          <Link
            href="/listings"
            className={`${navLinkClass} mt-8 inline-block text-sm underline underline-offset-4`}
          >
            Back to listings
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
