import type { SellerPaymentAccount } from "@/lib/types/seller-payment-account";

/**
 * Returns true only when Stripe has confirmed that the connected account
 * has completed onboarding and is ready to receive payouts.
 * Derived exclusively from Stripe's account status flags — never from a
 * separate boolean we store ourselves.
 */
export function isPayoutReady(
  account: SellerPaymentAccount | null | undefined,
): boolean {
  if (!account?.stripe_account_id) return false;
  return (
    account.stripe_details_submitted &&
    account.stripe_charges_enabled &&
    account.stripe_payouts_enabled
  );
}
