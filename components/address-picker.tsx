"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Map, { NavigationControl, type MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "./map-pin";

// Default: center of Upper Tiber Valley
const DEFAULT_LAT = 43.47;
const DEFAULT_LNG = 12.17;
const DEFAULT_ZOOM = 11;

type Suggestion = {
  place_name: string;
  center: [number, number];
};

export function AddressPicker({
  address,
  lat,
  lng,
  onChange,
}: {
  address: string;
  lat: number | null;
  lng: number | null;
  onChange: (data: { address: string; lat: number; lng: number }) => void;
}) {
  const [query, setQuery] = useState(address);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const reverseGeocodeRef = useRef<NodeJS.Timeout>(undefined);
  const flyToRef = useRef(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Initialize with default location if none set
  const currentLat = lat ?? DEFAULT_LAT;
  const currentLng = lng ?? DEFAULT_LNG;
  const hasLocation = lat != null && lng != null;

  // Sync when parent address changes (e.g., from Google import)
  useEffect(() => {
    if (address && address !== query) {
      setQuery(address);
      flyToRef.current = true;
    }
  }, [address]);

  // Fly to location only when triggered by search/import (not map drag)
  useEffect(() => {
    if (flyToRef.current && lat != null && lng != null && mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 800 });
      flyToRef.current = false;
    }
  }, [lat, lng]);

  const geocode = useCallback(
    async (text: string) => {
      if (text.length < 3 || !token) return;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${token}&country=IT&limit=5`
      );
      const data = await res.json();
      setSuggestions(
        (data.features ?? []).map(
          (f: { place_name: string; center: [number, number] }) => ({
            place_name: f.place_name,
            center: f.center,
          })
        )
      );
      setShowSuggestions(true);
    },
    [token]
  );

  const reverseGeocode = useCallback(
    async (newLat: number, newLng: number) => {
      if (!token) return;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${newLng},${newLat}.json?access_token=${token}&limit=1`
      );
      const data = await res.json();
      if (data.features?.[0]) {
        const newAddress = data.features[0].place_name;
        setQuery(newAddress);
        onChange({ address: newAddress, lat: newLat, lng: newLng });
      }
    },
    [token, onChange]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => geocode(value), 300);
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(s.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    flyToRef.current = true;
    onChange({ address: s.place_name, lat: s.center[1], lng: s.center[0] });
  };

  // When map stops moving, update location from center
  const handleMoveEnd = useCallback(
    (e: { type: string; originalEvent?: unknown }) => {
      // Only react to user-initiated moves (has originalEvent), not programmatic ones
      if (!e.originalEvent) {
        setIsDragging(false);
        return;
      }

      const map = mapRef.current?.getMap();
      if (!map) return;
      const center = map.getCenter();
      const newLat = center.lat;
      const newLng = center.lng;

      // Update coordinates immediately
      onChange({ address: query, lat: newLat, lng: newLng });

      // Debounce reverse geocode
      clearTimeout(reverseGeocodeRef.current);
      reverseGeocodeRef.current = setTimeout(() => {
        reverseGeocode(newLat, newLng);
      }, 500);

      setIsDragging(false);
    },
    [query, onChange, reverseGeocode]
  );

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      clearTimeout(reverseGeocodeRef.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-charcoal">
          Address *
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Start typing an address in Italy..."
          className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-warm-gray focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-30 mt-1 w-full rounded-lg border border-warm-gray-light bg-white shadow-lg">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(s)}
                  className="w-full px-4 py-2.5 text-left text-sm text-charcoal hover:bg-cream transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {s.place_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map with fixed center pin */}
      <div className="relative h-80 sm:h-96 overflow-hidden rounded-lg border border-warm-gray-light">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: currentLng,
            latitude: currentLat,
            zoom: hasLocation ? 15 : DEFAULT_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/outdoors-v12"
          mapboxAccessToken={token}
          onMoveStart={() => setIsDragging(true)}
          onMoveEnd={handleMoveEnd}
        >
          <NavigationControl position="top-right" showCompass={false} />
        </Map>
        {/* Fixed pin in center of map */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-10">
          <div
            className={`transition-transform ${isDragging ? "scale-110 -translate-y-1" : ""}`}
          >
            <MapPin active />
          </div>
        </div>
      </div>
      <p className="text-xs text-warm-gray">
        Drag the map to position the pin on your studio
      </p>
    </div>
  );
}
