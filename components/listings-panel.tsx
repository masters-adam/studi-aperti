"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { Listing } from "@/lib/types";
import { ListingCard } from "./listing-card";

const PAGE_SIZE = 10;

export function ListingsPanel({
  listings,
  selectedId,
  onSelectListing,
  onOpenDetail,
}: {
  listings: Listing[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
  onOpenDetail: (listing: Listing) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [page, setPage] = useState(0);
  const isScrollingTo = useRef(false);

  useEffect(() => {
    setPage(0);
  }, [listings]);

  const totalPages = Math.ceil(listings.length / PAGE_SIZE);
  const paged = listings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const setWrapperRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        wrapperRefs.current.set(id, el);
      } else {
        wrapperRefs.current.delete(id);
      }
    },
    []
  );

  // Scroll to selected card (when pin is clicked on map)
  useEffect(() => {
    if (!selectedId) return;
    const wrapper = wrapperRefs.current.get(selectedId);
    if (!wrapper || !containerRef.current) return;

    isScrollingTo.current = true;
    const container = containerRef.current;
    const wrapperTop = wrapper.offsetTop - container.offsetTop;
    container.scrollTo({
      top: wrapperTop - 16,
      behavior: "smooth",
    });
    setTimeout(() => {
      isScrollingTo.current = false;
    }, 1000);
  }, [selectedId]);

  // IntersectionObserver: auto-select listing when card scrolls into center
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-listing-id");
            if (id) onSelectListing(id);
          }
        }
      },
      {
        root: container,
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0.1,
      }
    );

    wrapperRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [paged, onSelectListing]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto px-4 py-4">
      <p className="text-xs text-warm-gray mb-3">
        Viewing {Math.min(page * PAGE_SIZE + 1, listings.length)}–
        {Math.min((page + 1) * PAGE_SIZE, listings.length)} of {listings.length}{" "}
        {listings.length === 1 ? "studio" : "studios"}
      </p>

      {listings.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-warm-gray">
          <p>No studios found</p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {paged.map((listing) => (
              <div
                key={listing.id}
                ref={setWrapperRef(listing.id)}
                data-listing-id={listing.id}
              >
                <ListingCard
                  listing={listing}
                  isSelected={selectedId === listing.id}
                  onSelect={onSelectListing}
                  onOpenDetail={onOpenDetail}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pb-4">
              <button
                onClick={() => {
                  setPage((p) => Math.max(0, p - 1));
                  containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 0}
                className="rounded-lg px-3 py-1.5 text-xs text-charcoal hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPage(i);
                    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    i === page
                      ? "bg-terracotta text-white"
                      : "text-charcoal hover:bg-cream-dark"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages - 1, p + 1));
                  containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === totalPages - 1}
                className="rounded-lg px-3 py-1.5 text-xs text-charcoal hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
