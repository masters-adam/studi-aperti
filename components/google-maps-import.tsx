"use client";

import { useState } from "react";
import { importFromGoogleMaps } from "@/lib/actions/google-import";
import type { Availability } from "@/lib/types";

type ImportedData = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  contact_phone: string;
  website: string;
  description: string;
  images: string[];
  availability: Availability;
};

export function GoogleMapsImport({
  onImport,
}: {
  onImport: (data: ImportedData) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setLoading(true);

    const result = await importFromGoogleMaps(url);

    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.error || "Import failed. Try copying the full URL from your browser.");
      return;
    }

    setUrl("");
    onImport(result.data as ImportedData);
  };

  return (
    <div className="rounded-lg border border-dashed border-warm-gray-light bg-cream/50 p-4">
      <div className="flex items-center gap-2 mb-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-terracotta">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
        <p className="text-sm font-medium text-charcoal">
          Import from Google Maps
        </p>
      </div>
      <p className="text-xs text-warm-gray mb-3">
        Paste a Google Maps link to auto-fill name, address, phone, website, hours, description, and photos.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://www.google.com/maps/place/..."
          className="flex-1 rounded-lg border border-warm-gray-light bg-white px-3 py-2 text-sm text-charcoal placeholder:text-warm-gray focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={!url.trim() || loading}
          className="rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark disabled:opacity-50 transition-colors flex-shrink-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Importing...
            </span>
          ) : (
            "Import"
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
