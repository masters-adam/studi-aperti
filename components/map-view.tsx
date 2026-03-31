"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import type { Listing } from "@/lib/types";
import { MapPin } from "./map-pin";
import { TagBadge } from "./tag-badge";

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

    mapRef.current.flyTo({
      center: [listing.lng, listing.lat],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 800,
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
          const isHovered =
            hoveredId === listing.id && selectedId !== listing.id;

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
              style={{ zIndex: isHovered ? 10 : 1 }}
            >
              <div
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative"
                style={{ cursor: "pointer" }}
              >
                {/* Hover card — grows upward from pin */}
                {isHovered && (
                  <div
                    className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-xl bg-white shadow-lg border border-cream-dark overflow-hidden animate-[fadeIn_0.15s_ease-out]"
                    style={{
                      width: 220,
                      pointerEvents: "none",
                    }}
                  >
                    {listing.images[0] && (
                      <div className="relative h-28 w-full">
                        <Image
                          src={listing.images[0]}
                          alt={listing.name}
                          fill
                          className="object-cover"
                          sizes="220px"
                        />
                      </div>
                    )}
                    <div className="p-2.5">
                      <h4 className="text-sm font-medium text-charcoal truncate">
                        {listing.name}
                      </h4>
                      {listing.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {listing.tags.slice(0, 2).map((tag) => (
                            <TagBadge key={tag} name={tag} />
                          ))}
                        </div>
                      )}
                      {listing.description && (
                        <p className="text-xs text-warm-gray mt-1 line-clamp-2">
                          {listing.description}
                        </p>
                      )}
                    </div>
                    {/* Triangle pointer */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-cream-dark rotate-45" />
                  </div>
                )}

                <MapPin
                  active={
                    listing.id === selectedId || listing.id === hoveredId
                  }
                />
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
        Show All
      </button>
    </div>
  );
}
