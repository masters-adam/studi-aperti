"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";
import type { Listing } from "@/lib/types";
import { useLocalizedListing } from "@/lib/use-localized-listing";
import { TagBadge } from "./tag-badge";
import { AvailabilityFull } from "./availability-display";
import { MapPin } from "./map-pin";
import { ImageLightbox } from "./image-lightbox";

function DetailCarousel({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length]
  );

  if (images.length === 0) return null;

  return (
    <>
      {/* Main large image */}
      <div className="group relative overflow-hidden rounded-xl">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={images[index]}
            alt={`${name} ${index + 1}`}
            fill
            className="object-cover cursor-pointer"
            sizes="(max-width: 768px) 100vw, 900px"
            onClick={() => setLightboxOpen(true)}
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-lg"
            >
              &#8249;
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-lg"
            >
              &#8250;
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === index ? "border-terracotta" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${name} thumb ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

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

export function ListingDetail({ listing }: { listing: Listing }) {
  const t = useTranslations("ListingDetail");
  const localized = useLocalizedListing(listing);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      {/* Images — full width, big */}
      <DetailCarousel images={listing.images} name={localized.name} />

      {/* Info below images */}
      <div className="mt-6">
        <h1 className="text-3xl md:text-4xl text-charcoal leading-tight">{localized.name}</h1>

        {listing.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <TagBadge key={tag} name={tag} />
            ))}
          </div>
        )}

        {/* Contact pills */}
        {(listing.contact_phone || listing.contact_email || listing.website || listing.instagram) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {listing.contact_phone && (
              <a
                href={`tel:${listing.contact_phone}`}
                className="flex items-center gap-2 rounded-full border border-warm-gray-light px-4 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {listing.contact_phone}
              </a>
            )}
            {listing.contact_email && (
              <a
                href={`mailto:${listing.contact_email}`}
                className="flex items-center gap-2 rounded-full border border-warm-gray-light px-4 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {t("email")}
              </a>
            )}
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-warm-gray-light px-4 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
                {t("website")}
              </a>
            )}
            {listing.instagram && (
              <a
                href={listing.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-warm-gray-light px-4 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                {t("instagram")}
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-warm-gray-light px-4 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              {t("directions")}
            </a>
          </div>
        )}

        <hr className="my-6 border-cream-dark" />

        {/* Two-column: description + map */}
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="flex-1 min-w-0">
            {localized.description && (
              <div className="mb-6">
                <h2 className="text-lg text-charcoal mb-2">{t("about")}</h2>
                <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
                  {localized.description}
                </p>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg text-charcoal mb-3">{t("hours")}</h2>
              <AvailabilityFull availability={listing.availability} />
            </div>
          </div>

          {/* Mini map */}
          <div className="w-full md:w-[320px] flex-shrink-0">
            <div className="overflow-hidden rounded-xl border border-cream-dark">
              <div className="h-48">
                <Map
                  initialViewState={{
                    longitude: listing.lng,
                    latitude: listing.lat,
                    zoom: 14,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle="mapbox://styles/mapbox/outdoors-v12"
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                  interactive={false}
                >
                  <Marker
                    longitude={listing.lng}
                    latitude={listing.lat}
                    anchor="bottom"
                  >
                    <MapPin active />
                  </Marker>
                </Map>
              </div>

              <div className="bg-white p-3">
                <p className="text-sm font-medium text-charcoal">{localized.name}</p>
                <p className="text-xs text-warm-gray mt-0.5">{listing.address}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 inline-block"
                >
                  {t("getDirections")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
