import Link from "next/link";
import { MyListingsContent } from "@/components/MyListingsContent";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import {
  pageDescriptionClass,
  pageTitleClass,
  primaryButtonClass,
} from "@/lib/ui";

export default function MyListingsPage() {
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

        <MyListingsContent />
      </PageContainer>
    </div>
  );
}
