"use client";

import { useRef, useCallback, useEffect } from "react";
import Map, { Marker, type MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Listing } from "@/lib/types";
import { MapPin } from "./map-pin";

// Upper Tiber Valley center
const INITIAL_VIEW = {
  longitude: 12.17,
  latitude: 43.47,
  zoom: 11,
};

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
    // Deselect when clicking empty map area
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={INITIAL_VIEW}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      onClick={handleMapClick}
    >
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          longitude={listing.lng}
          latitude={listing.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onSelectListing(listing.id);
          }}
        >
          <MapPin active={listing.id === selectedId} />
        </Marker>
      ))}
    </Map>
  );
}
