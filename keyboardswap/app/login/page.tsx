import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { cardClass, navLinkClass, pageDescriptionClass, pageTitleClass } from "@/lib/ui";

export default function LoginPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-md">
        <div className="mb-8">
          <h1 className={pageTitleClass}>Log in</h1>
          <p className={pageDescriptionClass}>
            Sign in to submit and manage your listings.
          </p>
        </div>

        <div className={cardClass}>
          <LoginForm />
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
