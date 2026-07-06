# KeyboardSwap Database Model

This document describes the major data objects in KeyboardSwap.
This is not final SQL. It is the product-level data model.

---

## 1. Core Users

### users
Purpose:
Represents the authenticated account.

Examples:
- buyer
- seller
- admin
- builder

Important fields:
- id
- email
- created_at

Relationships:
- has one profile
- has many listings
- has many bids
- has many ratings
- may have builder profile

---

### profiles
Purpose:
Public-facing user identity.

Important fields:
- user_id
- display_name
- avatar_url
- bio
- location
- created_at

Relationships:
- belongs to user
- shown on listings, ratings, builder pages

---

### roles
Purpose:
Controls permissions.

Examples:
- user
- admin
- verified_builder
- banned

---

## 2. Marketplace Listings

### listings
Purpose:
Represents an item listed for sale or auction.

Important fields:
- id
- seller_id
- category_id
- title
- description
- status
- listing_type
- starting_bid
- reserve_price
- buy_it_now_price
- current_price
- bid_increment
- scheduled_start_time
- end_time
- created_at
- updated_at

Relationships:
- belongs to seller
- has many images
- has many bids
- has many questions
- may become order

---

### listing_images
Purpose:
Stores listing photos.

Important fields:
- id
- listing_id
- url
- sort_order
- is_primary
- created_at

---

### categories
Purpose:
Defines listing category.

Examples:
- Keyboard
- Keycaps
- Components
- Accessories

---

### listing_attributes
Purpose:
Stores dynamic category-specific fields.

Examples:
- layout
- mount_style
- switch_type
- keycap_profile
- material
- color
- hot_swap

---

## 3. Auctions & Bidding

### bids
Purpose:
Represents a public bid event.

Important fields:
- id
- listing_id
- bidder_id
- amount
- created_at

Relationships:
- belongs to listing
- belongs to bidder

Notes:
Bidder identity is hidden publicly.

---

### proxy_bids
Purpose:
Stores a bidder's private maximum bid.

Important fields:
- id
- listing_id
- bidder_id
- max_amount
- created_at
- updated_at

Notes:
Never visible to sellers or other bidders.

---

### watchlists
Purpose:
Tracks users watching auctions/listings.

Important fields:
- user_id
- listing_id
- created_at

---

## 4. Questions & Comments

### listing_questions
Purpose:
Public Q&A on a listing.

Important fields:
- id
- listing_id
- asker_id
- question
- seller_answer
- answered_at
- created_at

---

### comments
Purpose:
Future community/listing comments.

Important fields:
- id
- user_id
- target_type
- target_id
- body
- created_at

---

## 5. Orders, Payments, Shipping

### orders
Purpose:
Represents a completed sale.

Important fields:
- id
- listing_id
- buyer_id
- seller_id
- final_price
- status
- created_at

Statuses:
- pending_payment
- paid
- shipped
- completed
- canceled
- refunded
- disputed
- resolved

---

### payments
Purpose:
Tracks payment provider records.

Important fields:
- id
- order_id
- provider
- provider_payment_id
- amount
- platform_fee
- status
- created_at

---

### shipments
Purpose:
Tracks shipping after sale.

Important fields:
- id
- order_id
- carrier
- tracking_number
- shipped_at
- delivered_at

---

## 6. Ratings & Reputation

### ratings
Purpose:
Stores buyer/seller/builder ratings tied to transactions.

Important fields:
- id
- transaction_id
- reviewer_id
- reviewee_id
- rating_type
- stars
- written_feedback
- created_at

Rating types:
- buyer_to_seller
- seller_to_buyer
- customer_to_builder
- builder_to_customer

---

### rating_tags
Purpose:
Reusable rating tags.

Examples:
- Great Communication
- Fast Shipping
- Item As Described
- Poor Communication

---

### rating_tag_assignments
Purpose:
Connects ratings to tags.

---

## 7. Builder Marketplace

### builder_profiles
Purpose:
Public builder profile.

Important fields:
- user_id
- display_name
- specialties
- starting_price
- turnaround_days
- verified
- bio

---

### build_requests
Purpose:
Customer request for a custom build.

Important fields:
- id
- customer_id
- preferred_builder_id
- budget
- desired_layout
- desired_sound
- description
- status
- created_at

---

### builder_quotes
Purpose:
Builder response to a build request.

Important fields:
- id
- build_request_id
- builder_id
- labor_estimate
- parts_estimate
- timeline_days
- build_plan
- notes
- status

---

### build_projects
Purpose:
Accepted builder job.

Important fields:
- id
- build_request_id
- builder_id
- customer_id
- status
- labor_fee
- escrow_status
- created_at

Statuses:
- planning
- waiting_on_parts
- building
- testing
- shipping
- completed
- canceled

---

### build_project_updates
Purpose:
Progress updates and photos from builder.

Important fields:
- id
- project_id
- title
- body
- image_urls
- created_at

---

## 8. Community & Builds

### verified_builds
Purpose:
Reusable, reviewed keyboard build templates.

Important fields:
- id
- creator_id
- title
- description
- difficulty
- sound_profile
- estimated_value
- verified_by_admin
- created_at

---

### verified_build_parts
Purpose:
Parts used in a verified build.

Important fields:
- verified_build_id
- product_id
- category
- notes

---

### collections
Purpose:
User-owned keyboard collections.

Important fields:
- id
- user_id
- name
- visibility
- created_at

Examples:
- Current Collection
- Wishlist
- Previously Owned
- Dream Builds
- Parts Bin

---

### collection_items
Purpose:
Items inside a collection.

Important fields:
- id
- collection_id
- listing_id
- product_id
- notes
- created_at

---

## 9. Reference Data

### brands
Purpose:
Curated brand/manufacturer list.

Examples:
- Mode
- Keycult
- GMK
- NovelKeys
- Keychron

---

### products
Purpose:
Canonical product records used across listings, builds, and compatibility.

Examples:
- Mode Sonnet
- GMK Botanical
- HMX Hyacinth
- TX AP Stabilizers

---

### compatibility_rules
Purpose:
Stores known compatibility between products.

Examples:
- Case compatible with PCB
- PCB compatible with plate
- Keycap set compatible with layout

---

## 10. Notifications

### notifications
Purpose:
In-app alerts.

Examples:
- Outbid
- Auction ending soon
- Auction won
- Question answered
- Build status updated
- Rating received

Important fields:
- id
- user_id
- type
- message
- read_at
- created_at



## Brand Suggestions

If a seller cannot find the correct brand, they may suggest a new brand during listing submission.

Suggested brands should not become public immediately.

Suggested brand flow:
- Seller enters suggested brand name.
- Listing can still be submitted.
- Admin reviews the suggested brand during listing review.
- Admin may approve, merge, rename, or reject the suggested brand.
- Approved brands become part of the official brand database.

This keeps the database clean while still allowing the marketplace to grow naturally.



## Product and Compatibility Growth

Brands should be connected to products.

Products should be connected to categories and compatible items whenever possible.

Example:
- Brand: Mode
- Product: Mode Sonnet
- Category: Keyboard / Case
- Compatible products:
  - Sonnet PCB
  - Sonnet plates
  - Sonnet foams
  - Sonnet weights

Compatibility does not need to be perfect at launch.

The goal is to slowly build a rough compatibility database from:
- Listings
- Verified Builds
- Admin review
- Community suggestions
- Builder feedback

Over time, this becomes the foundation for the Keyboard Builder and compatibility checker.


## Collections Philosophy

Collections should be focused showcases, not forum threads.

Users may showcase:
- Completed Builds
- Current Collection
- Wishlist
- Dream Builds
- Parts Bin

Collections should support:
- Photos
- Parts list
- Short notes
- Links to listings or products
- Likes/saves

Collections should avoid:
- Long comment threads
- Memes
- Off-topic discussion
- General forum behavior

KeyboardSwap community features should stay centered around keyboards, builds, listings, compatibility, and market knowledge.

