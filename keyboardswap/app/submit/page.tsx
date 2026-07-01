import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitContent } from "@/components/SubmitContent";
import { pageDescriptionClass, pageTitleClass } from "@/lib/ui";

export default function SubmitPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-3xl">
        <div className="mb-8">
          <h1 className={pageTitleClass}>Submit a listing</h1>
          <p className={pageDescriptionClass}>
            Fill in the details below. Your listing will be reviewed before it
            goes live.
          </p>
        </div>

        <SubmitContent />
      </PageContainer>
    </div>
  );
}
