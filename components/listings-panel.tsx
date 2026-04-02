"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Listing } from "@/lib/types";
import { ListingCard } from "./listing-card";
import { HeroSection } from "./hero-section";
import { TagFilter } from "./tag-filter";

const PAGE_SIZE = 10;

export function ListingsPanel({
  listings,
  selectedId,
  onSelectListing,
  onOpenDetail,
  search,
  onSearchChange,
  allTags,
  selectedTag,
  onSelectTag,
  hasFilters,
  filteredCount,
  onClearFilters,
}: {
  listings: Listing[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
  onOpenDetail: (listing: Listing) => void;
  search: string;
  onSearchChange: (value: string) => void;
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  hasFilters: boolean;
  filteredCount: number;
  onClearFilters: () => void;
}) {
  const t = useTranslations("Homepage");
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
    <div ref={containerRef} className="h-full overflow-y-auto">
      {/* Hero */}
      <HeroSection />

      {/* Search + Tags */}
      <div className="px-4 py-2 space-y-2 border-b border-cream-dark">
        <div className="relative">
          <svg
            width="14"
            height="14"
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
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg border border-warm-gray-light bg-cream/50 pl-8 pr-8 py-1.5 text-sm text-charcoal placeholder:text-warm-gray focus:border-terracotta focus:bg-white focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
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
            onSelectTag={onSelectTag}
          />
        )}
      </div>

      {/* Filter results bar */}
      {hasFilters && (
        <div className="bg-cream-dark/50 px-4 py-1.5 text-xs text-warm-gray flex items-center justify-between">
          <span>{t("studiosFound", { count: filteredCount })}</span>
          <button
            onClick={onClearFilters}
            className="text-terracotta hover:underline"
          >
            {t("clearFilters")}
          </button>
        </div>
      )}

      {/* Listings */}
      <div className="px-4 py-3">
        <p className="text-xs text-warm-gray mb-3">
          {t("viewing", {
            start: Math.min(page * PAGE_SIZE + 1, listings.length),
            end: Math.min((page + 1) * PAGE_SIZE, listings.length),
            total: listings.length,
          })}
        </p>

        {listings.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-warm-gray">
            <p>{t("noStudios")}</p>
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
    </div>
  );
}
