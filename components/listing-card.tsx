"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { Listing } from "@/lib/types";
import { TagBadge } from "./tag-badge";
import {
  AvailabilitySummary,
  AvailabilityFull,
} from "./availability-display";

export function ListingCard({
  listing,
  isSelected,
  onSelect,
  cardRef,
}: {
  listing: Listing;
  isSelected: boolean;
  onSelect: (id: string) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-expand when selected from map
  useEffect(() => {
    if (isSelected && !expanded) {
      setExpanded(true);
    }
  }, [isSelected, expanded]);

  const thumbnail = listing.images[0];
  const description =
    listing.description.length > 120
      ? listing.description.slice(0, 120) + "..."
      : listing.description;

  return (
    <div
      ref={cardRef}
      className={`rounded-xl bg-white shadow-sm border-2 transition-all duration-300 overflow-hidden cursor-pointer ${
        isSelected
          ? "border-terracotta shadow-md"
          : "border-transparent hover:shadow-md hover:border-terracotta-light"
      }`}
      onClick={() => {
        onSelect(listing.id);
        setExpanded(!expanded);
      }}
    >
      {/* Collapsed view */}
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={listing.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-warm-gray-light">
              <svg
                width="32"
                height="32"
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

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h3 className="text-lg leading-tight text-charcoal">
              {listing.name}
            </h3>
            {listing.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {listing.tags.map((tag) => (
                  <TagBadge key={tag} name={tag} />
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {listing.description && (
              <p className="text-sm text-warm-gray leading-snug">
                {description}
              </p>
            )}
            <AvailabilitySummary availability={listing.availability} />
          </div>
        </div>
      </div>

      {/* Expanded view */}
      <div
        ref={contentRef}
        className={`grid transition-all duration-300 ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-cream-dark px-4 pb-4 pt-3 space-y-4">
            {/* Full description */}
            {listing.description && (
              <p className="text-sm text-charcoal leading-relaxed">
                {listing.description}
              </p>
            )}

            {/* All images */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-32 w-44 flex-shrink-0 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={src}
                      alt={`${listing.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="176px"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Availability */}
            <AvailabilityFull availability={listing.availability} />

            {/* Contact info */}
            <div className="space-y-1 text-sm">
              <p className="text-warm-gray">{listing.address}</p>
              {listing.contact_email && (
                <p>
                  <a
                    href={`mailto:${listing.contact_email}`}
                    className="text-terracotta hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {listing.contact_email}
                  </a>
                </p>
              )}
              {listing.contact_phone && (
                <p>
                  <a
                    href={`tel:${listing.contact_phone}`}
                    className="text-terracotta hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {listing.contact_phone}
                  </a>
                </p>
              )}
              {listing.website && (
                <p>
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {listing.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
