"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/types";
import { TagBadge } from "./tag-badge";
import { AvailabilitySummary } from "./availability-display";
import { ImageLightbox } from "./image-lightbox";

function ImageCarousel({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIndex((i) => (i - 1 + images.length) % images.length);
    },
    [images.length]
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIndex((i) => (i + 1) % images.length);
    },
    [images.length]
  );

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-cream-dark text-warm-gray-light">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="group relative h-full w-full overflow-hidden">
        <Image
          src={images[index]}
          alt={`${name} ${index + 1}`}
          fill
          className="object-cover"
          sizes="200px"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-charcoal text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              &#8249;
            </button>
            <button
              onClick={next}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-charcoal text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              &#8250;
            </button>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`block h-1.5 w-1.5 rounded-full transition-colors ${
                    i === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          initialIndex={index}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

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
  const description =
    listing.description.length > 90
      ? listing.description.slice(0, 90) + "..."
      : listing.description;

  return (
    <div
      ref={cardRef}
      className={`rounded-xl bg-white shadow-sm border-2 transition-all duration-300 overflow-hidden ${
        isSelected
          ? "border-terracotta shadow-md"
          : "border-transparent hover:shadow-md hover:border-terracotta-light"
      }`}
      onClick={() => onSelect(listing.id)}
    >
      <Link href={`/listing/${listing.id}`} className="flex">
        {/* Image carousel */}
        <div className="relative w-40 flex-shrink-0 min-h-[160px]">
          <ImageCarousel images={listing.images} name={listing.name} />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-3 min-w-0">
          <h3 className="text-base font-medium leading-tight text-charcoal">
            {listing.name}
          </h3>

          {listing.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {listing.tags.map((tag) => (
                <TagBadge key={tag} name={tag} />
              ))}
            </div>
          )}

          {listing.description && (
            <p className="mt-1 text-xs text-warm-gray leading-snug">
              {description}
            </p>
          )}

          {/* Address */}
          <div className="mt-1.5 flex items-start gap-1.5 text-xs text-warm-gray">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="line-clamp-1">{listing.address}</span>
          </div>

          {/* Contact icons */}
          <div className="mt-1.5 flex items-center gap-2">
            {listing.contact_phone && (
              <span className="flex items-center gap-1 text-xs text-warm-gray">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {listing.contact_phone}
              </span>
            )}
            {listing.contact_email && (
              <span className="flex items-center gap-1 text-xs text-warm-gray">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span className="line-clamp-1">{listing.contact_email}</span>
              </span>
            )}
          </div>

          <div className="mt-auto pt-1">
            <AvailabilitySummary availability={listing.availability} />
          </div>
        </div>
      </Link>
    </div>
  );
}
