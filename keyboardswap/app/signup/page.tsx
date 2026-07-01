import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader maxWidth="max-w-md" />

      <main className="mx-auto max-w-md px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Create account
          </h1>
          <p className="mt-2 text-zinc-600">
            Join KeyboardSwap to list your keyboards.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="font-medium text-zinc-900 hover:underline">
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
