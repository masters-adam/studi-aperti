"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocale, useTranslations } from "next-intl";
import type { Listing } from "@/lib/types";
import { MapPin } from "./map-pin";

export function MapView({
  listings,
  selectedId,
  onSelectListing,
}: {
  listings: Listing[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
}) {
  const mapRef = useRef<MapRef>(null);
  const hasFitBounds = useRef(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const locale = useLocale() as "en" | "it";
  const t = useTranslations("Homepage");

  const getLocalizedName = (listing: Listing) =>
    listing.translations?.name?.[locale] || listing.name;
  const getLocalizedDescription = (listing: Listing) =>
    listing.translations?.description?.[locale] || listing.description;

  // Fit bounds to all listings on initial load
  useEffect(() => {
    if (hasFitBounds.current || !mapRef.current || listings.length === 0)
      return;
    hasFitBounds.current = true;

    const bounds = new mapboxgl.LngLatBounds();
    listings.forEach((l) => bounds.extend([l.lng, l.lat]));

    mapRef.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 60, right: 60 },
      maxZoom: 14,
      duration: 0,
    });
  }, [listings]);

  // Fly to selected listing
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const listing = listings.find((l) => l.id === selectedId);
    if (!listing) return;

    mapRef.current.easeTo({
      center: [listing.lng, listing.lat],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 1500,
      easing: (t) => t * (2 - t), // ease-out quadratic
    });
  }, [selectedId, listings]);

  const handleMapClick = useCallback(() => {
    setHoveredId(null);
  }, []);

  const resetZoom = useCallback(() => {
    if (!mapRef.current || listings.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    listings.forEach((l) => bounds.extend([l.lng, l.lat]));
    mapRef.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 60, right: 60 },
      maxZoom: 14,
      duration: 800,
    });
  }, [listings]);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 12.17,
          latitude: 43.47,
          zoom: 11,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        onClick={handleMapClick}
      >
        {listings.map((listing) => {
          const isHovered = listing.id === hoveredId;
          const isSelected = listing.id === selectedId;

          return (
            <Marker
              key={listing.id}
              longitude={listing.lng}
              latitude={listing.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setHoveredId(null);
                onSelectListing(listing.id);
              }}
              style={{ zIndex: isHovered ? 10 : isSelected ? 5 : 1 }}
            >
              <div
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: "pointer" }}
              >
                {isHovered ? (
                  /* Hover label: image + name card with pin tail */
                  <div className="flex flex-col items-center">
                    <div className="rounded-lg bg-white shadow-lg overflow-hidden w-[200px]">
                      {listing.images[0] && (
                        <div className="relative h-24 w-full">
                          <img
                            src={listing.images[0]}
                            alt={getLocalizedName(listing)}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="px-2.5 py-2">
                        <p className="text-xs font-medium text-charcoal truncate">{getLocalizedName(listing)}</p>
                        {listing.tags.length > 0 && (
                          <p className="text-[10px] text-warm-gray truncate mt-0.5">
                            {listing.tags.slice(0, 3).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderTop: "8px solid white",
                      }}
                    />
                  </div>
                ) : (
                  <MapPin active={isSelected} />
                )}
              </div>
            </Marker>
          );
        })}
      </Map>
      <button
        onClick={resetZoom}
        className="absolute top-3 right-3 z-10 rounded-lg bg-white px-3 py-2 text-xs font-medium text-charcoal shadow-md hover:bg-cream transition-colors"
        title="Show all studios"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="inline mr-1 -mt-0.5"
        >
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
        {t("showAll")}
      </button>
    </div>
  );
}
