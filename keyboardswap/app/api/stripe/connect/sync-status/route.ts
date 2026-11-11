import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  // 1. Verify the caller's JWT.
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = user.id;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const stripe = getStripe();

    // 2. Load stripe_account_id from our DB (trusted source — never from URL).
    const { data: paymentAccount } = await supabaseAdmin
      .from("seller_payment_accounts")
      .select("stripe_account_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!paymentAccount?.stripe_account_id) {
      return NextResponse.json(
        { error: "No Stripe account found for this user." },
        { status: 404 },
      );
    }

    // 3. Retrieve live account state from Stripe (authoritative source of truth).
    const stripeAccount = await stripe.accounts.retrieve(
      paymentAccount.stripe_account_id,
    );

    // 4. Write status flags — sourced exclusively from Stripe's API response.
    await supabaseAdmin
      .from("seller_payment_accounts")
      .update({
        stripe_charges_enabled: stripeAccount.charges_enabled ?? false,
        stripe_payouts_enabled: stripeAccount.payouts_enabled ?? false,
        stripe_details_submitted: stripeAccount.details_submitted ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return NextResponse.json({
      charges_enabled: stripeAccount.charges_enabled,
      payouts_enabled: stripeAccount.payouts_enabled,
      details_submitted: stripeAccount.details_submitted,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sync-status]", message);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        detail: process.env.NODE_ENV !== "production" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
