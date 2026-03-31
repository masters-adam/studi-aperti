"use client";

import { useState, useMemo } from "react";
import type { Listing } from "@/lib/types";
import { ListingsPanel } from "./listings-panel";
import { MapView } from "./map-view";
import { TagFilter } from "./tag-filter";
import { MobileToggle } from "./mobile-toggle";
import { MobileMapCards } from "./mobile-map-cards";

export function Homepage({ listings }: { listings: Listing[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    listings.forEach((l) => l.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [listings]);

  // Filter listings by tag
  const filtered = useMemo(() => {
    if (!selectedTag) return listings;
    return listings.filter((l) => l.tags.includes(selectedTag));
  }, [listings, selectedTag]);

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="border-b border-cream-dark bg-white px-4 py-2">
          <TagFilter
            tags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </div>
      )}

      {/* Desktop: side by side */}
      <div className="hidden flex-1 md:flex">
        <div className="w-[45%] border-r border-cream-dark">
          <ListingsPanel
            listings={filtered}
            selectedId={selectedId}
            onSelectListing={setSelectedId}
          />
        </div>
        <div className="w-[55%]">
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
    </div>
  );
}
