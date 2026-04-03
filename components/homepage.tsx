"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Listing } from "@/lib/types";
import { ListingsPanel } from "./listings-panel";
import { MapView } from "./map-view";
import { TagFilter } from "./tag-filter";
import { MobileToggle } from "./mobile-toggle";
import { MobileMapCards } from "./mobile-map-cards";
import { ListingModal } from "./listing-modal";

export function Homepage({ listings }: { listings: Listing[] }) {
  const t = useTranslations("Homepage");
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
    <div className="flex h-[calc(100vh-49px)] md:h-[calc(100vh-57px)] flex-col">
      {/* Desktop: side by side */}
      <div className="hidden flex-1 md:flex overflow-hidden">
        <div className="w-[45%] border-r border-cream-dark">
          <ListingsPanel
            listings={filtered}
            selectedId={selectedId}
            onSelectListing={setSelectedId}
            onOpenDetail={handleOpenDetail}
            search={search}
            onSearchChange={setSearch}
            allTags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            hasFilters={!!hasFilters}
            filteredCount={filtered.length}
            onClearFilters={() => { setSearch(""); setSelectedTag(null); }}
          />
        </div>
        <div className="w-[55%] sticky top-0 h-full">
          <MapView
            listings={filtered}
            selectedId={selectedId}
            onSelectListing={setSelectedId}
            onOpenDetail={handleOpenDetail}
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
              search={search}
              onSearchChange={setSearch}
              allTags={allTags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              hasFilters={!!hasFilters}
              filteredCount={filtered.length}
              onClearFilters={() => { setSearch(""); setSelectedTag(null); }}
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
