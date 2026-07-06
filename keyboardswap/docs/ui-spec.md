# KeyboardSwap UI Specification

This document defines the overall layout and user experience of the primary pages in KeyboardSwap.

The goal is consistency, simplicity, and trust.

Visual polish can change over time.

The structure of each page should remain stable.

---

# Design Philosophy

KeyboardSwap should feel:

- Premium
- Focused
- Fast
- Clean
- Trustworthy

Inspiration:

- Cars & Bids
- Apple
- GitHub

Avoid:

- Clutter
- Popups
- Long discussion threads
- Social media feeds
- Forum-style layouts

The marketplace should always be the primary focus.

---

# Global Navigation

Header contains:

KeyboardSwap logo

Navigation

- Browse
- Sell
- Builders (future)
- Collections (future)

Search

Account

Desktop layout:

Logo | Navigation | Search | Account

Mobile:

Hamburger
Logo
Search
Profile

---

# Homepage

The homepage IS the marketplace.

There is no separate Listings page.

Default sort:

Ending Soon

Structure:

------------------------------------------------

Header

------------------------------------------------

Featured Auction

Large hero image

4 thumbnail images

Current bid

Countdown

Reserve status

------------------------------------------------

Categories

- Full Builds
- Keycaps
- Components
- Accessories

Each category displays the current listing count.

------------------------------------------------

Sort options

- Ending Soon
- Newly Listed
- Lowest Price
- Highest Price
- No Reserve

------------------------------------------------

Auction Grid

Infinite scrolling

Each card contains:

- Primary image
- Countdown
- Current bid
- Title
- Condition
- Category
- Live / Scheduled badge

Minimal text.

Cards should be easy to scan quickly.

---

# Listing Page

The listing page is the centerpiece of KeyboardSwap.

Desktop layout:

------------------------------------------------

Images

Auction Card (sticky)

------------------------------------------------

Tabs

- Details
- Bid History
- Questions

------------------------------------------------

Specifications

Two-column specification grid

Only populated fields are displayed.

------------------------------------------------

Description

------------------------------------------------

Known Flaws / Defects

Required section.

Sellers should disclose:

- Scratches
- Missing accessories
- Broken LEDs
- Damaged packaging
- Modifications

Empty state:

"No known flaws."

------------------------------------------------

Included Items

Examples:

- Carrying case
- Extra keycaps
- Cable
- Switch puller

------------------------------------------------

Seller Information

Avatar

Username

Rating

Completed sales

Member since

Other listings

------------------------------------------------

Questions

Public questions only.

Seller answers publicly.

No private questions.

------------------------------------------------

Auction Card

Sticky while scrolling.

Contains:

Current Bid

Reserve Status

Auction Status

Countdown

Auction Start

Auction End

Bid Increment

Number of Bids

Number of Watchers

Large Bid Button

When bidding is unavailable:

"Bidding Opens Soon"

When auction has ended:

"Auction Ended"

Reserve price is never displayed.

Only:

- No Reserve
- Reserve Not Met
- Reserve Met

---

# Bid History

Displays:

Bid Amount

Relative Time

Anonymous Bidder Number

Example:

$420

3 minutes ago

Bidder #18

Bidder identities remain anonymous.

---

# Submit Listing

Simple wizard.

Top:

Category selection.

Selecting a category dynamically changes the form.

Bottom:

Large Submit Listing button.

No unnecessary steps.

---

# My Listings

Shows all listings owned by the seller.

Cards display:

Thumbnail

Title

Status

Auction Status

Scheduled Start

Current Bid

Edit

Delete

Sold listings remain visible.

---

# Admin

Purpose:

Review and curate listings.

Main queue:

Pending Review

For each listing:

Approve

Reject

Request Changes

Schedule Auction

Feature Listing

Brand Approval

Product Approval

---

# Builder Marketplace

Future.

Builder profile contains:

Gallery

Specialties

Pricing

Turnaround

Ratings

Completed Builds

Verified badge

Request Build button

---

# Collections

Collections showcase keyboards.

Collections are not forums.

Users may create:

Current Collection

Wishlist

Dream Builds

Previously Owned

Parts Bin

Collections support:

Photos

Short descriptions

Parts lists

Likes

Collections do not support:

Discussion threads

Memes

General social posting

---

# Search

Search should be available from every page.

Search supports:

Title

Brand

Category

Switches

Keycaps

Layouts

Materials

Colors

Future:

Compatibility search

---

# Responsive Design

Desktop

Multi-column layouts.

Sticky auction sidebar.

Mobile

Single column.

Images

Auction card

Tabs

Content

Large tap targets.

---

# Future UI Features

- Dark mode
- Price history charts
- Watchlist
- Saved searches
- Compatibility viewer
- Build planner
- Verified Build pages

---

# UI Principles

Every page should answer one question immediately.

Homepage

"What should I bid on?"

Listing

"Should I bid on this?"

Submit

"How do I sell?"

Builder

"Who should build my keyboard?"

Collections

"What inspires me?"

Every screen should make the next action obvious.

Users should rarely wonder what to do next.