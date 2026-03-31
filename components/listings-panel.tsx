"use client";

import { useRef, useCallback, useEffect } from "react";
import type { Listing } from "@/lib/types";
import { ListingCard } from "./listing-card";

export function ListingsPanel({
  listings,
  selectedId,
  onSelectListing,
}: {
  listings: Listing[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
}) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const setCardRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefs.current.set(id, el);
      } else {
        cardRefs.current.delete(id);
      }
    },
    []
  );

  // Scroll to selected card
  useEffect(() => {
    if (!selectedId) return;
    const card = cardRefs.current.get(selectedId);
    if (!card || !containerRef.current) return;

    const container = containerRef.current;
    const cardTop = card.offsetTop - container.offsetTop;
    container.scrollTo({
      top: cardTop - 16,
      behavior: "smooth",
    });
  }, [selectedId]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto px-4 py-4 space-y-3">
      {listings.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-warm-gray">
          <p>No studios found</p>
        </div>
      ) : (
        listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isSelected={selectedId === listing.id}
            onSelect={onSelectListing}
            cardRef={setCardRef(listing.id)}
          />
        ))
      )}
    </div>
  );
}
