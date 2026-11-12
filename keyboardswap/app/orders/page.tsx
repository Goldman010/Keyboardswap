import { MyOrdersContent } from "@/components/MyOrdersContent";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { pageDescriptionClass, pageTitleClass } from "@/lib/ui";

export default function MyOrdersPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />
      <PageContainer>
        <div className="mb-6">
          <h1 className={pageTitleClass}>My Orders</h1>
          <p className={pageDescriptionClass}>Find auctions you won and items you sold.</p>
        </div>
        <MyOrdersContent />
      </PageContainer>
    </div>
  );
}
