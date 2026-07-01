import Link from "next/link";
import { EditListingContent } from "@/components/EditListingContent";
import { SiteHeader } from "@/components/SiteHeader";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader maxWidth="max-w-3xl" showSubmitLink />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/my-listings"
          className="mb-6 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Back to my listings
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Edit listing
          </h1>
          <p className="mt-2 text-zinc-600">
            Update your listing details. Approved or rejected listings return to
            pending after save.
          </p>
        </div>

        <EditListingContent listingId={id} />
      </main>
    </div>
  );
}
