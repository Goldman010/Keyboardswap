import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  // 1. Verify the caller's JWT from the Authorization header.
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

    // 2. Check whether we already have a stripe_account_id for this user.
    const { data: existingAccount } = await supabaseAdmin
      .from("seller_payment_accounts")
      .select("stripe_account_id")
      .eq("user_id", userId)
      .maybeSingle();

    let stripeAccountId = existingAccount?.stripe_account_id ?? null;

    if (!stripeAccountId) {
      // 3. Create a new Express connected account. Pre-fill email when available.
      const account = await stripe.accounts.create({
        type: "express",
        ...(user.email ? { email: user.email } : {}),
      });
      stripeAccountId = account.id;

      // 4. Persist the new account ID via the service role client.
      await supabaseAdmin.from("seller_payment_accounts").upsert(
        {
          user_id: userId,
          stripe_account_id: stripeAccountId,
          stripe_charges_enabled: false,
          stripe_payouts_enabled: false,
          stripe_details_submitted: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }

    // 5. Generate a fresh account link for onboarding / continuing setup.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/stripe/connect/refresh`,
      return_url: `${siteUrl}/stripe/connect/return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[create-account]", message);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        detail: process.env.NODE_ENV !== "production" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
