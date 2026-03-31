"use client";

import Image from "next/image";
import type { Listing } from "@/lib/types";
import { TagBadge } from "./tag-badge";

export function MobileMapCards({
  listings,
  selectedId,
  onSelectListing,
}: {
  listings: Listing[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
}) {
  return (
    <div className="absolute bottom-14 left-0 right-0 z-10 overflow-x-auto px-3 pb-3">
      <div className="flex gap-3" style={{ width: "max-content" }}>
        {listings.map((listing) => (
          <button
            key={listing.id}
            onClick={() => onSelectListing(listing.id)}
            className={`flex w-64 items-center gap-3 rounded-xl bg-white p-3 shadow-lg border-2 transition-colors text-left ${
              selectedId === listing.id
                ? "border-terracotta"
                : "border-transparent"
            }`}
          >
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark">
              {listing.images[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-warm-gray-light">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-charcoal">
                {listing.name}
              </h4>
              {listing.tags.length > 0 && (
                <div className="mt-1 flex gap-1">
                  {listing.tags.slice(0, 2).map((tag) => (
                    <TagBadge key={tag} name={tag} />
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
