"use client";

import { useState, useMemo, useCallback } from "react";
import type { Listing } from "@/lib/types";
import { ListingsPanel } from "./listings-panel";
import { MapView } from "./map-view";
import { TagFilter } from "./tag-filter";
import { MobileToggle } from "./mobile-toggle";
import { MobileMapCards } from "./mobile-map-cards";
import { ListingModal } from "./listing-modal";

export function Homepage({ listings }: { listings: Listing[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [modalListing, setModalListing] = useState<Listing | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    listings.forEach((l) => l.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [listings]);

  const filtered = useMemo(() => {
    let result = listings;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q)
      );
    }
    if (selectedTag) {
      result = result.filter((l) => l.tags.includes(selectedTag));
    }
    return result;
  }, [listings, search, selectedTag]);

  const hasFilters = search.trim() || selectedTag;

  const handleOpenDetail = useCallback((listing: Listing) => {
    setModalListing(listing);
  }, []);

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      {/* Search + filter bar */}
      <div className="border-b border-cream-dark bg-white px-4 py-2 space-y-2">
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search studios..."
            className="w-full rounded-lg border border-warm-gray-light bg-cream/50 pl-9 pr-8 py-2 text-sm text-charcoal placeholder:text-warm-gray focus:border-terracotta focus:bg-white focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal text-sm"
            >
              &times;
            </button>
          )}
        </div>
        {allTags.length > 0 && (
          <TagFilter
            tags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        )}
      </div>

      {hasFilters && (
        <div className="bg-cream-dark/50 px-4 py-1.5 text-xs text-warm-gray flex items-center justify-between">
          <span>
            {filtered.length} {filtered.length === 1 ? "studio" : "studios"} found
          </span>
          <button
            onClick={() => {
              setSearch("");
              setSelectedTag(null);
            }}
            className="text-terracotta hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Desktop: side by side */}
      <div className="hidden flex-1 md:flex overflow-hidden">
        <div className="w-[45%] border-r border-cream-dark">
          <ListingsPanel
            listings={filtered}
            selectedId={selectedId}
            onSelectListing={setSelectedId}
            onOpenDetail={handleOpenDetail}
          />
        </div>
        <div className="w-[55%] sticky top-0 h-full">
          <MapView
            listings={filtered}
            selectedId={selectedId}
            onSelectListing={setSelectedId}
          />
        </div>
      </div>

      {/* Mobile: toggled views */}
      <div className="relative flex-1 md:hidden">
        {mobileView === "list" ? (
          <div className="h-full pb-12">
            <ListingsPanel
              listings={filtered}
              selectedId={selectedId}
              onSelectListing={setSelectedId}
              onOpenDetail={handleOpenDetail}
            />
          </div>
        ) : (
          <div className="relative h-full pb-12">
            <MapView
              listings={filtered}
              selectedId={selectedId}
              onSelectListing={setSelectedId}
            />
            <MobileMapCards
              listings={filtered}
              selectedId={selectedId}
              onSelectListing={setSelectedId}
            />
          </div>
        )}
      </div>

      <MobileToggle view={mobileView} onChangeView={setMobileView} />

      {/* Listing detail modal */}
      {modalListing && (
        <ListingModal
          listing={modalListing}
          onClose={() => setModalListing(null)}
        />
      )}
    </div>
  );
}
