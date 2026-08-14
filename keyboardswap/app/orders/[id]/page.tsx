import { OrderDetailContent } from "@/components/OrderDetailContent";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />
      <PageContainer>
        <OrderDetailContent orderId={id} />
      </PageContainer>
    </div>
  );
}
