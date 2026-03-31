"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Map, { Marker, type MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "./map-pin";

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
  const mapRef = useRef<MapRef>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const geocode = useCallback(
    async (text: string) => {
      if (text.length < 3 || !token) return;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${token}&country=IT&limit=5`
      );
      const data = await res.json();
      setSuggestions(
        (data.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
          place_name: f.place_name,
          center: f.center,
        }))
      );
      setShowSuggestions(true);
    },
    [token]
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
    onChange({ address: s.place_name, lat: s.center[1], lng: s.center[0] });
    mapRef.current?.flyTo({
      center: s.center,
      zoom: 15,
      duration: 800,
    });
  };

  const handleMarkerDragEnd = useCallback(
    async (e: { lngLat: { lng: number; lat: number } }) => {
      const { lng: newLng, lat: newLat } = e.lngLat;
      onChange({ address: query, lat: newLat, lng: newLng });

      // Reverse geocode
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
    [token, query, onChange]
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
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

      <div className="h-64 overflow-hidden rounded-lg border border-warm-gray-light">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: lng ?? 12.17,
            latitude: lat ?? 43.47,
            zoom: lat ? 15 : 10,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/outdoors-v12"
          mapboxAccessToken={token}
        >
          {lat != null && lng != null && (
            <Marker
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <MapPin active />
            </Marker>
          )}
        </Map>
      </div>
      <p className="text-xs text-warm-gray">
        Drag the pin to adjust the exact location
      </p>
    </div>
  );
}
