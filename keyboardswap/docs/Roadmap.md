# KeyboardSwap Roadmap

This roadmap defines the implementation order for KeyboardSwap.

The goal is to always build the strongest foundation before moving on to more advanced features.

---

# Phase 1 - Marketplace MVP

Goal:
Launch a trustworthy marketplace where users can buy and sell keyboard-related items through curated auctions.

## Accounts

- User authentication
- Profiles
- Seller pages
- Builder role support (future)

## Listings

- Dynamic listing form
- Category-specific attributes
- Image uploads
- Listing approval
- Listing scheduling
- Edit listings
- Delete listings
- My Listings

## Marketplace

- Browse listings
- Search
- Category pages
- Dynamic filters
- Homepage
- Featured listings

## Auctions

- Live countdown
- Proxy bidding
- Reserve prices
- Buy It Now
- Bid increments
- Anti-sniping
- Auction history
- Sold archive
- Auction scheduling ✅
- Auction UI
- Countdown timer
- Place Bid
- Bid history
- Winning bidder workflow

## Administration

- Listing review queue
- Featured listings
- Brand approval
- Product approval
- User moderation

---

# Phase 2 - Transactions

Goal:
Create a trusted buying experience.

## Orders, checkout and shipping rollout

Requirements are in [Payments and Fulfillment](PAYMENTS_AND_FULFILLMENT.md). Implementation requires approval of this plan and the open pricing decisions.

1. **Listing and order terms.** Validate the $50 floor in forms, admin approval and database writes. Record package details and disclosed shipping charges, lock terms at auction start, show bid totals, and snapshot the winning price and shipping terms when an order is created. Preserve auction logic, seller onboarding, and existing test orders. Make closing and payment deadlines reliable even without page visits.
2. **Test checkout.** Reuse the Stripe server client, seller Connect onboarding, and My Orders. Add buyer-only checkout using server-owned totals and a validated US destination, a reusable payment session, and signed, idempotent webhooks. Test wrong buyer, failed or late payment, retries, and concurrent checkout attempts. Keep seller transfers disabled.
3. **Platform labels and basic fraud protection.** Integrate EasyPost Wallet behind a narrow server module, starting with a small domestic carrier/service allowlist. Generate labels only for paid, cleared orders. Enforce protection tiers, keep tracking provider-owned, ingest verified tracking updates, and reconcile missed or out-of-order events. Test supported insurance and signatures with real carrier quotes before pilot launch. Add admin review for $750+ orders and an evidence and dispute queue.
4. **Delayed seller transfers and pilot.** After Stripe and legal signoff, add an idempotent transfer process, balance and dispute reconciliation, and admin exception handling. Verify that missed events, duplicate requests, and open disputes do not release funds. Run the full flow in test mode before any limited live pilot.

### Codebase impact

- Listing creation, editing, and admin scheduling currently validate prices independently. Update all three and add a database guard for price and shipping invariants.
- Bid and proxy-bid dialogs have no structured shipping charge. Extend their existing totals and the listing detail presentation.
- The auction finalization migration writes the winning item price and pending-payment order. Add immutable terms and a deadline while preserving its existing order uniqueness and participant access rules.
- Order detail currently has payment and shipping placeholders. Extend it for checkout, label purchase and tracking. Reuse My Orders and the seller Connect endpoints. Add separate server endpoints for signed payment and shipping events and admin-only dispute actions.

### Provider and cost assumptions

Recommend [EasyPost Wallet](https://www.easypost.com/pricing/) for the US-only pilot. Wallet includes the label API fee for up to 3,000 labels per month, with postage billed separately and tracking included with eligible EasyPost labels. Verify multi-seller use and actual USPS/UPS rates, insurance eligibility and supported signature services before committing. Keep [Shippo API Starter](https://goshippo.com/pricing/api) as the fallback. It includes the API fee for 30 labels per month, then charges $0.07 per label, with separate charges for some API services.

Budget for postage, insurance, signature fees, address checks where billed, carrier adjustments, Stripe card processing, applicable Connect account/payout fees, and dispute costs. EasyPost publishes 1% declared-value insurance with a $1 minimum. Stripe lists standard US domestic card processing at 2.9% plus $0.30. Exact label and signature costs depend on the service and shipment.

## Ratings

- Buyer ratings
- Seller ratings
- Rating tags
- Reputation score

## Notifications

- Outbid
- Auction won
- Payment received
- Item shipped
- Questions
- Rating reminders

---

# Phase 3 - Community

Goal:
Make KeyboardSwap a place users visit every day.

## Collections

- Current collection
- Wishlist
- Dream builds
- Previously owned
- Parts bin

## Profiles

- Public collections
- Recent purchases
- Recent sales
- Favorite builds

## Verified Builds

- Community submissions
- Admin verification
- Build galleries
- Sound tests
- Typing tests

## Questions

- Public Q&A
- Seller responses
- Helpful answers

---

# Phase 4 - Builder Marketplace

Goal:
Connect enthusiasts with professional builders.

## Builder Profiles

- Portfolio
- Gallery
- Pricing
- Specialties
- Ratings
- Verification

## Build Requests

- Customer requests
- Builder quotes
- Quote comparison
- Builder selection

## Projects

- Progress tracking
- Timeline
- Progress photos
- Escrow
- Completion workflow

---

# Phase 5 - Keyboard Builder

Goal:
Create the best keyboard planning tool available.

## Compatibility

- Cases
- PCBs
- Plates
- Stabilizers
- Switches
- Keycaps

## Build Planner

- Create builds
- Save builds
- Clone builds
- Share builds

## Marketplace Integration

- Build using marketplace listings
- Suggest compatible alternatives
- Show estimated total cost
- One-click purchase

---

# Phase 6 - Market Intelligence

Goal:
Become the authority on keyboard values.

## Price History

- Historical sale prices
- Average sale price
- Highest sale
- Lowest sale
- Market trends

## Saved Searches

- Email alerts
- New listing alerts
- Price drop alerts

## Analytics

- Most watched
- Most bid
- Trending brands
- Popular layouts

---

# Phase 7 - Platform Growth

Goal:
Grow the KeyboardSwap ecosystem.

Potential future features:

- Mobile app
- API
- Discord integration
- YouTube creator pages
- Builder certification
- Marketplace insights
- Premium memberships
- International shipping tools
- Vendor partnerships

---

# Guiding Principles

Every feature should strengthen one or more of the following pillars:

- Marketplace
- Community
- Tools

Every feature should increase trust.

Every feature should improve marketplace data.

Every feature should improve compatibility knowledge.

KeyboardSwap should become the operating system for the mechanical keyboard hobby.