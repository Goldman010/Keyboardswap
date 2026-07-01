import Link from "next/link";
import { EditListingContent } from "@/components/EditListingContent";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { navLinkClass, pageDescriptionClass, pageTitleClass } from "@/lib/ui";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-3xl">
        <Link
          href="/my-listings"
          className={`${navLinkClass} mb-6 inline-block text-sm`}
        >
          ← Back to my listings
        </Link>

        <div className="mb-8">
          <h1 className={pageTitleClass}>Edit listing</h1>
          <p className={pageDescriptionClass}>
            Update your listing details. Approved or rejected listings return to
            pending after save.
          </p>
        </div>

        <EditListingContent listingId={id} />
      </PageContainer>
    </div>
  );
}
