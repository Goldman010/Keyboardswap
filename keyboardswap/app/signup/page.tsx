import Link from "next/link";
import { SignupForm } from "@/components/SignupForm";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { cardClass, navLinkClass, pageDescriptionClass, pageTitleClass } from "@/lib/ui";

export default function SignupPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-md">
        <div className="mb-8">
          <h1 className={pageTitleClass}>Create account</h1>
          <p className={pageDescriptionClass}>
            Join KeyboardSwap to list your keyboards.
          </p>
        </div>

        <div className={cardClass}>
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className={`${navLinkClass} hover:underline`}>
            Back to home
          </Link>
        </p>
      </PageContainer>
    </div>
  );
}
