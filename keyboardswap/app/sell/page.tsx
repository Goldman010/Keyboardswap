import { CreateListingForm } from "@/components/CreateListingForm";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { cardClass, pageDescriptionClass, pageTitleClass } from "@/lib/ui";

export default function SellPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-3xl">
        <div className="mb-8">
          <h1 className={pageTitleClass}>Sell a keyboard</h1>
          <p className={pageDescriptionClass}>
            Submit your listing for review. Approved listings appear on the
            marketplace.
          </p>
        </div>

        <div className={cardClass}>
          <CreateListingForm />
        </div>
      </PageContainer>
    </div>
  );
}
