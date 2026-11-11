import Link from "next/link";
import { MyListingsContent } from "@/components/MyListingsContent";
import { PageContainer } from "@/components/PageContainer";
import { PayoutStatusSection } from "@/components/PayoutStatusSection";
import { SiteHeader } from "@/components/SiteHeader";
import {
  alertSuccessClass,
  pageDescriptionClass,
  pageTitleClass,
  primaryButtonClass,
} from "@/lib/ui";

type Props = {
  searchParams: Promise<{ payout_updated?: string }>;
};

export default async function MyListingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const payoutUpdated = params.payout_updated === "1";

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className={pageTitleClass}>My listings</h1>
            <p className={pageDescriptionClass}>
              Track pending, approved, rejected, and sold submissions.
            </p>
          </div>
          <Link href="/submit" className={primaryButtonClass}>
            Submit another listing
          </Link>
        </div>

        {payoutUpdated && (
          <div className={`${alertSuccessClass} mb-6`}>
            Payout setup updated successfully.
          </div>
        )}

        <PayoutStatusSection />

        <MyListingsContent />
      </PageContainer>
    </div>
  );
}
