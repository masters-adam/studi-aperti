"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { Listing } from "@/lib/types";
import { useLocalizedListing } from "@/lib/use-localized-listing";
import { TagBadge } from "./tag-badge";
import { AvailabilitySummary } from "./availability-display";
import { ImageLightbox } from "./image-lightbox";

function ImageCarousel({ images, name }: { images: string[]; name: string }) {
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
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 45vw"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              &#8249;
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              &#8250;
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`block h-2 w-2 rounded-full transition-colors ${
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
  onOpenDetail,
  cardRef,
}: {
  listing: Listing;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpenDetail: (listing: Listing) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const t = useTranslations("ListingCard");
  const localized = useLocalizedListing(listing);

  const description =
    localized.description.length > 180
      ? localized.description.slice(0, 180) + "..."
      : localized.description;

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
        onOpenDetail(listing);
      }}
    >
      {/* Hero image carousel */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl">
        <ImageCarousel images={listing.images} name={localized.name} />
      </div>

      {/* Info below */}
      <div className="p-4">
        <h3 className="text-xl leading-tight text-charcoal">{localized.name}</h3>

        {/* Address */}
        <p className="mt-1 text-sm text-warm-gray flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="line-clamp-1">{listing.address}</span>
        </p>

        {/* Tags */}
        {listing.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <TagBadge key={tag} name={tag} />
            ))}
          </div>
        )}

        {/* Description */}
        {localized.description && (
          <p className="mt-3 text-sm text-charcoal/80 leading-relaxed">
            {description}
          </p>
        )}

        {/* Contact + availability footer */}
        <div className="mt-3 flex items-center justify-between border-t border-cream-dark pt-3">
          <AvailabilitySummary availability={listing.availability} />

          <div className="flex items-center gap-3">
            {listing.contact_phone && (
              <a
                href={`tel:${listing.contact_phone}`}
                className="text-warm-gray hover:text-terracotta transition-colors"
                onClick={(e) => e.stopPropagation()}
                title={listing.contact_phone}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </a>
            )}
            {listing.contact_email && (
              <a
                href={`mailto:${listing.contact_email}`}
                className="text-warm-gray hover:text-terracotta transition-colors"
                onClick={(e) => e.stopPropagation()}
                title={listing.contact_email}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            )}
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-gray hover:text-terracotta transition-colors"
                onClick={(e) => e.stopPropagation()}
                title={t("website")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
              </a>
            )}
            {listing.instagram && (
              <a
                href={listing.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-gray hover:text-terracotta transition-colors"
                onClick={(e) => e.stopPropagation()}
                title={t("instagram")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-warm-gray hover:text-terracotta transition-colors"
              onClick={(e) => e.stopPropagation()}
              title={t("directions")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
