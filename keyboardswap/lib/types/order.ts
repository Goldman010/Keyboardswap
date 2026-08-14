export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipped"
  | "completed"
  | "canceled"
  | "refunded"
  | "disputed"
  | "resolved";

export type Order = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  final_price: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};
