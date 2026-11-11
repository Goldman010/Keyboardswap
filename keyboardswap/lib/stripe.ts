import "server-only";
import Stripe from "stripe";

/**
 * Returns a Stripe client instance.
 * Called at request time so the build succeeds before STRIPE_SECRET_KEY is set.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY must be set.");
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia", typescript: true });
}
