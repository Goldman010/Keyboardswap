"use client";

import { useState } from "react";
import { LISTING_TYPE_LABELS } from "@/lib/auction";
import { formatListedDate, formatPrice, formatSellerLabel } from "@/lib/formatListing";
import type { Listing } from "@/lib/types/listing";

type ListingDetailTabsProps = {
  listing: Listing;
};

type Tab = "details" | "bid_history" | "questions";

const TABS: { id: Tab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "bid_history", label: "Bid History" },
  { id: "questions", label: "Questions" },
];

const CATEGORY_LABELS: Record<string, string> = {
  full_build: "Full Build",
  keycaps: "Keycaps",
  components: "Components",
  accessories: "Accessories",
};

export function ListingDetailTabs({ listing }: ListingDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("details");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Tab bar */}
      <div className="border-b border-zinc-200">
        <nav className="flex px-6" aria-label="Listing tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab panels */}
      <div className="p-6">
        {activeTab === "details" && <DetailsTab listing={listing} />}
        {activeTab === "bid_history" && <BidHistoryTab />}
        {activeTab === "questions" && <QuestionsTab />}
      </div>
    </div>
  );
}

function DetailsTab({ listing }: { listing: Listing }) {
  return (
    <div className="flex flex-col gap-10">
      {/* Specifications grid */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Specifications
        </h3>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <SpecRow label="Condition" value={listing.condition} />
          {listing.category && (
            <SpecRow
              label="Category"
              value={CATEGORY_LABELS[listing.category] ?? listing.category}
            />
          )}
          <SpecRow
            label="Listing Type"
            value={LISTING_TYPE_LABELS[listing.listing_type ?? "auction"]}
          />
          <SpecRow
            label="Starting Bid"
            value={formatPrice(listing.starting_bid ?? listing.starting_price)}
          />
          {listing.buy_it_now_price != null && (
            <SpecRow
              label="Buy It Now"
              value={formatPrice(listing.buy_it_now_price)}
            />
          )}
          <SpecRow label="Seller" value={formatSellerLabel(listing.seller_username)} />
          <SpecRow label="Listed" value={formatListedDate(listing.created_at)} />
        </dl>
      </section>

      {/* Description */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Description
        </h3>
        <p className="whitespace-pre-wrap text-base leading-7 text-zinc-700">
          {listing.description}
        </p>
      </section>

      {/* Known Flaws / Defects — required section */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Known Flaws / Defects
        </h3>
        {listing.known_flaws ? (
          <p className="whitespace-pre-wrap text-base leading-7 text-zinc-700">
            {listing.known_flaws}
          </p>
        ) : (
          <p className="text-base text-zinc-400">No known flaws.</p>
        )}
      </section>

      {/* Included Items — only shown if populated */}
      {listing.included_items && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Included Items
          </h3>
          <p className="whitespace-pre-wrap text-base leading-7 text-zinc-700">
            {listing.included_items}
          </p>
        </section>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 text-base text-zinc-900">{value}</dd>
    </div>
  );
}

function BidHistoryTab() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
      <p className="text-base font-medium text-zinc-500">Bid History</p>
      <p className="mt-1 text-sm text-zinc-400">
        Bid history will appear here once bidding opens.
      </p>
    </div>
  );
}

function QuestionsTab() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
      <p className="text-base font-medium text-zinc-500">Questions</p>
      <p className="mt-1 text-sm text-zinc-400">
        Questions will appear here once Q&amp;A is enabled.
      </p>
    </div>
  );
}
