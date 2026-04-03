"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import type { Listing } from "@/lib/types";
import { MapPin } from "./map-pin";

function MapPopupCarousel({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="relative h-48 w-full">
      <Image
        src={images[index]}
        alt={`${name} ${index + 1}`}
        fill
        className="object-cover"
        sizes="280px"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-charcoal shadow hover:bg-white transition-colors text-sm"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % images.length);
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-charcoal shadow hover:bg-white transition-colors text-sm"
          >
            &#8250;
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function MapView({
  listings,
  selectedId,
  onSelectListing,
  onOpenDetail,
}: {
  listings: Listing[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
  onOpenDetail?: (listing: Listing) => void;
}) {
  const mapRef = useRef<MapRef>(null);
  const hasFitBounds = useRef(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
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

  const goToMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setUserLocation({ lng: longitude, lat: latitude });
        setLocatingUser(false);
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 13, duration: 1000 });
      },
      () => {
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 12.17,
          latitude: 43.47,
          zoom: 9,
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
                if (onOpenDetail) onOpenDetail(listing);
              }}
              style={{ zIndex: isHovered ? 10 : isSelected ? 5 : 1 }}
            >
              <div
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: "pointer" }}
              >
                <MapPin active={isSelected || isHovered} />
              </div>
            </Marker>
          );
        })}

        {/* Hover popup — rendered as separate marker above the pin */}
        {hoveredId && (() => {
          const listing = listings.find((l) => l.id === hoveredId);
          if (!listing) return null;
          return (
            <Marker
              key={`popup-${listing.id}`}
              longitude={listing.lng}
              latitude={listing.lat}
              anchor="bottom"
              style={{ zIndex: 20 }}
            >
              <div
                className="mb-10 flex flex-col items-center pointer-events-auto"
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredId(null);
                  onSelectListing(listing.id);
                  if (onOpenDetail) onOpenDetail(listing);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="rounded-xl bg-white shadow-xl overflow-hidden w-[280px]">
                  <MapPopupCarousel images={listing.images} name={getLocalizedName(listing)} />
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-medium text-charcoal truncate">{getLocalizedName(listing)}</p>
                    {listing.tags.length > 0 && (
                      <p className="text-xs text-warm-gray truncate mt-0.5">
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
            </Marker>
          );
        })()}
        {/* User location marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="center"
            style={{ zIndex: 3 }}
          >
            <div className="relative">
              <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
              <div className="absolute inset-0 h-4 w-4 rounded-full bg-blue-500 animate-ping opacity-30" />
            </div>
          </Marker>
        )}
      </Map>

      {/* Map controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={resetZoom}
          className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-charcoal shadow-md hover:bg-cream transition-colors"
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
        <button
          onClick={goToMyLocation}
          disabled={locatingUser}
          className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-charcoal shadow-md hover:bg-cream transition-colors disabled:opacity-50"
          title="My location"
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
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          {locatingUser ? "..." : t("myLocation")}
        </button>
      </div>
    </div>
  );
}
