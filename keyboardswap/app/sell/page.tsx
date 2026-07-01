import Link from "next/link";
import { CreateListingForm } from "@/components/CreateListingForm";

export default function SellPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            KeyboardSwap
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back to listings
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Sell a keyboard
          </h1>
          <p className="mt-2 text-zinc-600">
            Submit your listing for review. Approved listings appear on the
            homepage.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <CreateListingForm />
        </div>
      </main>
    </div>
  );
}
