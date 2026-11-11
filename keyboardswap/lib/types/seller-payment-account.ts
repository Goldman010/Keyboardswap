export type SellerPaymentAccount = {
  user_id: string;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;
  stripe_details_submitted: boolean;
  updated_at: string;
};
