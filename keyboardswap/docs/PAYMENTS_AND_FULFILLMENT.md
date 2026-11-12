Winning a bid creates an order with pending_payment.
Buyer gets a limited payment window 24 hours
Buyer pays KeyboardSwap, not the seller directly.
Buyer provides/confirms their shipping address during checkout before payment is submitted.
Seller does not receive funds immediately.
Seller ships only after payment is confirmed.
Seller provides tracking.
Buyer confirms delivery, or the order automatically completes after a defined period following delivery.
Seller proceeds become eligible for transfer after carrier-confirmed delivery and a full 48-hour inspection window, with no open dispute or fraud hold.
If buyer never pays, order becomes something like payment_expired; seller can potentially offer it to the next-highest bidder later.
Platform fee should be taken from the seller's proceeds rather than added as a surprise buyer fee.
KeyboardSwap provides the only supported shipping-label purchase flow. The buyer pays the disclosed shipping charge at checkout.
Disputes/refunds remain manually administered for the MVP.
Seller gets 5 days after payment to ship and provide tracking


## Minimum listing value

- New listings must start at $50 for auctions or have a fixed purchase price of at least $50. For hybrid listings, the opening bid and Buy It Now price must each meet the minimum.
- Apply the floor to item price in USD before shipping and tax. Validate in seller submission and edit, admin approval, and authoritative database writes.
- Approval question: Does a $50 reserve ever permit an opening bid below $50? The proposed interpretation is a hard $50 opening bid. Confirm before implementing. Proposed legacy treatment is to keep existing orders and in-progress auctions intact and enforce the floor on new or re-approved listings.

## Shipping

- Start with domestic US shipments. The seller provides the ship-from address and package dimensions and weight before approval. Disclose the shipping charge before bidding and lock the terms when the auction goes live.
- Show item price or proposed bid, shipping, and the buyer total before bid confirmation and again at checkout. Label pre-bid totals as estimates where tax depends on destination, then show the exact total before payment.
- After verified payment, the seller purchases the label in KeyboardSwap. The platform submits the validated checkout address and required services to the shipping provider. Persist the provider shipment ID, label and tracking association. Seller-entered tracking and post-start shipping price changes are disallowed.
- At checkout, snapshot the agreed shipping charge and checkout address. Keep actual carrier cost separate from the buyer charge. Approval question: confirm who absorbs differences, carrier adjustments and any label void fees. The proposed MVP uses a disclosed flat buyer charge with KeyboardSwap absorbing differences during a capped pilot.
- Provide the buyer and seller with shipment status using authenticated provider updates and reconciliation. The seller has five days after payment confirmation to ship and provide a carrier acceptance scan. A purchased label alone does not establish shipment.

| Final item value | Required shipping protection |
| --- | --- |
| Below $200 | KeyboardSwap label and carrier tracking |
| $200 to below $500 | Platform label, tracking and full-value insurance |
| $500 to below $750 | Platform label, tracking, full-value insurance and signature confirmation |
| $750 or more | All of the above and additional fraud screening |

Use the winning bid or fixed item price before shipping and tax for the tier. Block label release if a required service or full insurance cannot be confirmed. For the pilot, propose manual admin clearance at $750 or more, with Stripe risk signals where available. Do not collect unnecessary identity documents.

## Delivery Confirmation and Missing Packages

- Seller payouts are not released immediately when tracking is provided.
- Shipment tracking is associated with the order.
- When tracking reports delivery, the buyer receives a limited review period before the transaction automatically completes.
- MVP review period: 48 hours after confirmed delivery.
- The buyer may confirm receipt early as evidence. Transfer eligibility still requires carrier-confirmed delivery and the full 48-hour window.
- If the buyer reports that the item was not received, the transaction enters Disputed status and seller payout is paused.
- Disputes are manually reviewed by KeyboardSwap during the MVP.

### Missing Package Disputes

KeyboardSwap may consider:
- Carrier tracking status
- Delivery location/ZIP
- Signature confirmation
- Shipping address used for the order
- Carrier loss or misdelivery information
- Buyer and seller communication
- Timing of the buyer's report

If tracking does not show successful delivery, the buyer is generally eligible for a refund.

Carrier-confirmed delivery tied to the verified checkout address generally supports the seller in an ordinary item-not-received dispute, subject to evidence review. An unsupported buyer claim does not automatically trigger a refund.

Seller payment remains on hold while a delivery dispute is under review.

Shipping insurance and/or signature confirmation may be required for transactions above a future value threshold.


## Lost Packages and Shipping Insurance

- The seller is responsible for shipping the item to the address provided through the KeyboardSwap order.
- Sellers have 5 days after buyer payment is confirmed to ship the item and provide valid tracking.
- The shipping price cannot be changed after the auction begins.

### Carrier-Lost Packages

A package may be considered lost when:
- The carrier officially declares the shipment lost, or
- Tracking fails to show delivery within a reasonable period and a carrier investigation confirms or strongly indicates loss.

If a shipment is determined to be lost in transit:
- The buyer receives a full refund, including the purchase price and shipping charge.
- The seller does not receive the buyer's payment through the normal transaction payout.
- Any available shipping insurance claim is pursued for the lost shipment.
- Insurance reimbursement is paid to the party that purchased/holds the shipping insurance.
- KeyboardSwap does not guarantee reimbursement beyond the amount recoverable through shipping insurance or the carrier.

### Seller Protection

- Sellers are strongly encouraged to purchase shipping insurance covering the full transaction value.
- The shipping protection table specifies mandatory insurance and signature confirmation.
- Failure to purchase recommended or required insurance may leave the seller responsible for a carrier loss that exceeds the carrier's included coverage.

### Buyer Protection

- Buyers are not responsible for items genuinely lost before successful delivery.
- A buyer must cooperate with reasonable carrier or KeyboardSwap investigations.
- A buyer may not receive both the item and a refund for the same transaction.
- If a refunded shipment is subsequently delivered, the buyer must notify KeyboardSwap so the transaction can be resolved appropriately.

### Claims

- Seller should initiate the carrier/insurance claim when the seller purchased the shipping label.
- KeyboardSwap may request documentation related to the shipment or insurance claim.
- Seller payout remains on hold while a lost-package claim or related dispute is unresolved.



## Damaged Items and Items Not as Described

Buyers are expected to receive the item in substantially the same condition and configuration represented in the listing.

Sellers are responsible for accurately describing the item, including known defects, damage, missing components, modifications, and other material issues.

### Buyer Review Period

- Buyers have 48 hours after confirmed delivery to inspect the item and report a significant problem.
- The buyer may confirm that the item was received as expected before the review period expires.
- If no issue is reported during the review period, the transaction may complete and become eligible for transfer.
- Problems that could not reasonably have been discovered during the initial inspection may be reviewed individually by KeyboardSwap.

### Item Not as Described

An item may be considered materially not as described when there is a significant difference between the received item and the listing.

Examples include:
- Undisclosed physical damage
- Undisclosed functional problems
- Incorrect keyboard, keycaps, switches, components, or accessories
- Missing items that the listing stated were included
- Significant differences in condition
- Counterfeit or misrepresented products
- Undisclosed modifications that materially affect the item
- A keyboard or component that does not function as represented

Minor cosmetic differences, normal wear consistent with the listed condition, or buyer dissatisfaction alone are generally not considered "not as described."

### Required Listing Disclosure

- Sellers must disclose all known significant flaws before the auction begins.
- The listing's Known Flaws section must be completed.
- Sellers should provide photographs showing significant cosmetic damage when reasonably possible.
- Information disclosed in the listing cannot later be used by the buyer as the sole basis for a "not as described" claim.

### Reporting a Problem

If an item arrives damaged or materially not as described:

- The buyer must report the issue through the order within the review period.
- The transaction enters Disputed status.
- Seller payout is paused.
- The buyer should provide photographs and a description of the problem.
- KeyboardSwap may request additional photographs, video, packaging photographs, shipping information, or communication between the parties.
- The seller may respond and provide supporting information from the original listing or shipment.

### Shipping Damage

If the item was accurately described when shipped but was damaged in transit:

- The buyer is generally eligible for a resolution if the damage materially affects the item.
- Seller payout remains on hold while the issue is investigated.
- The seller may be required to pursue a shipping insurance or carrier claim.
- KeyboardSwap may require the buyer to retain the item and original packaging while a carrier claim is pending.
- Responsibility for carrier damage may depend on packaging, insurance coverage, and carrier findings.

### Seller Misrepresentation

If KeyboardSwap determines that the seller materially misrepresented the item or failed to disclose a significant known issue:

- The buyer may receive a full or partial refund depending on the circumstances.
- The seller may be responsible for return shipping.
- Seller payout may be canceled or reversed where possible.
- The transaction may be marked as resolved in favor of the buyer.
- Repeated or intentional misrepresentation may result in account restrictions.

### Returns

When a return is required:

- KeyboardSwap must approve the return before the buyer ships the item back.
- The buyer must return the item in substantially the same condition in which it was received.
- The return should use tracked shipping.
- KeyboardSwap may require insurance or signature confirmation for high-value returns.
- Refund timing may depend on confirmed return delivery.
- The buyer should not independently return an item to an address provided outside the KeyboardSwap transaction workflow.

### Possible Resolutions

KeyboardSwap may resolve a dispute with:

- Full refund and return
- Full refund without return when appropriate
- Partial refund agreed upon by both parties
- Transaction completed with seller payout
- Another mutually agreed resolution approved by KeyboardSwap

MVP disputes are reviewed manually by KeyboardSwap.

### Buyer Remorse

KeyboardSwap marketplace transactions are generally final.

The following are not normally grounds for a refund:
- Buyer changed their mind
- Buyer found the item cheaper elsewhere
- Buyer no longer wants the item
- Buyer dislikes the sound, feel, appearance, or other subjective characteristics that were accurately represented
- Compatibility problems when the listing accurately disclosed the relevant specifications

This does not limit claims involving an item that is materially damaged, defective, counterfeit, or not as described.


pending_payment
    ↓
paid
    ↓
awaiting_shipment
    ↓
shipped
    ↓
delivered
    ↓
completed




pending_payment → payment_expired

paid/awaiting_shipment → canceled → refunded

shipped/delivered → disputed → resolved
                         ↓
                       refunded






## Payment Deadline

- Winning a binding auction creates an order in Pending Payment status.
- The winning buyer has 24 hours to complete payment.
- If payment is not completed within 24 hours, the order becomes Payment Expired.
- The seller is not required to fulfill an unpaid order.
- Repeated failure to pay for won auctions may result in buyer account restrictions.
- MVP: an expired auction may be relisted by the seller.
- Second-chance offers to other bidders may be added later.


## Seller Shipping Deadline

- Sellers have 5 days after payment is confirmed to ship the item and provide valid tracking.
- If tracking is not provided within the required period, the buyer may request cancellation.
- KeyboardSwap may provide a short grace period before canceling the transaction.
- If the seller fails to fulfill the transaction, the buyer receives a full refund.
- Repeated seller fulfillment failures may result in account restrictions.


## Cancellations

Marketplace bids and completed purchases are generally binding.

Before payment:
- A winning buyer who refuses to pay may have the transaction recorded as Payment Expired.
- Repeated non-payment may affect the buyer's account standing.

After payment:
- Buyers and sellers cannot automatically cancel a transaction once payment has been completed.
- Either party may request cancellation.
- A mutually agreed cancellation may be approved and refunded by KeyboardSwap.
- If the seller cannot fulfill the order, the buyer receives a full refund.
- KeyboardSwap may determine responsibility for a cancellation for ratings/account-standing purposes.

MVP cancellation and refund requests are reviewed manually.


## Marketplace Fees

- KeyboardSwap charges a marketplace fee to the seller when a transaction is successfully completed.
- The marketplace fee is deducted from the seller's proceeds rather than added to the buyer's winning bid.
- Applicable shipping charges and taxes remain the buyer's responsibility.
- Seller fees must be disclosed before the listing goes live.
- The fee applicable when the auction begins cannot be changed during that auction.
- The exact marketplace fee percentage may be adjusted before launch.
- Payment-processing fees and refund-related fees will follow the rules of the payment provider and will be disclosed before launch.


## Stripe payments, transfers and disputes

- Use Stripe Checkout with separate charges and transfers. Start with test-mode USD card payments. Create checkout server-side for the winning buyer using the immutable order amount and disclosed shipping charge. Use verified Stripe webhooks to record payment. Keep the 24-hour payment deadline and handle expiration, duplicate events, and payment/expiration races.
- After carrier-confirmed delivery and a full 48-hour inspection window, seller proceeds are eligible for transfer only if no dispute, refund, or fraud hold is active. Record the Stripe charge and transfer IDs and reconcile separately from the seller's bank payout.
- Pause pending transfers on internal disputes and Stripe payment disputes. Give admins an evidence view, communications log, decision history, and controls to record refunds, submit or track Stripe dispute evidence, and resolve the hold. Handle refunds and disputes manually for the MVP. A dispute after transfer requires reconciliation and may require a transfer reversal.
- Retain the normalized checkout address, Stripe payment references, order and shipping disclosures, carrier tracking history and delivery timestamps, signature proof where required, and relevant communications. Restrict access, audit evidence access, and set retention based on payment dispute and legal requirements. Do not store full card numbers or security codes.
- Carrier evidence supports review. It does not guarantee a favorable payment dispute outcome. The 48-hour internal inspection window does not limit later card chargebacks.
- Before implementing delayed transfers, verify the applicable Stripe platform balance and payout configuration, source-charge transfer requirements, and maximum time from charge to transfer for the actual US Connect account, including long disputes. Stripe's published US two-year manual bank-payout limit is a different mechanism. Obtain qualified US legal review of the funds flow, federal and state money-transmission obligations, seller agreements, and tax responsibilities before accepting live payments.

## Taxes

- Applicable taxes will be calculated and collected as required by the payment implementation and applicable law.
- Tax obligations and marketplace-facilitator requirements must be reviewed before public launch.
- Buyers will be shown applicable taxes before completing payment.
- KeyboardSwap will not manually estimate taxes as part of the auction bid amount.