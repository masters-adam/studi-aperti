"use server";

import { createClient } from "@supabase/supabase-js";

type ImportResult = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  contact_phone: string;
  website: string;
  description: string;
  images: string[];
  availability: Record<string, { type: string; open?: string; close?: string; value?: string }>;
};

async function resolveUrl(url: string): Promise<string> {
  // Resolve short links (maps.app.goo.gl, goo.gl/maps) by following redirects
  if (url.includes("goo.gl") || url.includes("maps.app")) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      const location = res.headers.get("location");
      if (location) return location;
    } catch { /* fall through */ }
  }
  return url;
}

function parseGoogleMapsUrl(url: string): { name: string; lat: number; lng: number; placeId?: string } | null {
  try {
    const placeMatch = url.match(/\/place\/([^/@?]+)/);
    const name = placeMatch
      ? decodeURIComponent(placeMatch[1]).replace(/\+/g, " ")
      : "";

    // Extract place ID — try multiple patterns
    let placeId: string | undefined;

    // Pattern 1: ChIJ... style place ID
    const chiMatch = url.match(/(ChIJ[\w-]+)/);
    if (chiMatch) placeId = chiMatch[1];

    // Pattern 2: ftid= parameter
    if (!placeId) {
      const ftidMatch = url.match(/ftid=([\w:]+)/);
      if (ftidMatch) placeId = ftidMatch[1];
    }

    // Pattern 3: !1s with hex ID (0x...:0x...)
    if (!placeId) {
      const hexMatch = url.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/);
      if (hexMatch) placeId = hexMatch[1];
    }

    // If we have a place ID, coords are optional — we can get them from the API
    if (placeId) {
      // Try to get coords if available
      const coordMatch = url.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/);
      if (coordMatch) {
        return { name, lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]), placeId };
      }
      const atMatch = url.match(/@(-?[\d.]+),(-?[\d.]+)/);
      if (atMatch) {
        return { name, lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]), placeId };
      }
      // No coords but we have place ID — use 0,0 as placeholder, API will give real coords
      return { name, lat: 0, lng: 0, placeId };
    }

    // No place ID — need coords
    const coordMatch = url.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/);
    if (coordMatch) {
      return { name, lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
    }
    const atMatch = url.match(/@(-?[\d.]+),(-?[\d.]+)/);
    if (atMatch) {
      return { name, lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    return null;
  } catch {
    return null;
  }
}

const DAYS_MAP: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

function formatTime(time: string): string {
  return time.slice(0, 2) + ":" + time.slice(2);
}

async function findPlaceId(name: string, lat: number, lng: number, apiKey: string): Promise<string | null> {
  // Strategy 1: Find Place from Text with location bias (works best when we have a name)
  if (name) {
    const query = encodeURIComponent(name);
    const biasParam = lat !== 0 ? `&locationbias=point:${lat},${lng}` : "";
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery${biasParam}&fields=place_id&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.candidates?.[0]?.place_id) return data.candidates[0].place_id;
  }

  // Strategy 2: Nearby search at the coordinates
  if (lat !== 0 && lng !== 0) {
    const keyword = name ? `&keyword=${encodeURIComponent(name)}` : "";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50${keyword}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results?.[0]?.place_id) return data.results[0].place_id;
  }

  return null;
}

export async function importFromGoogleMaps(
  rawUrl: string
): Promise<{ success: boolean; data?: ImportResult; error?: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Resolve short URLs first
  const url = await resolveUrl(rawUrl);

  const parsed = parseGoogleMapsUrl(url);
  if (!parsed) {
    return { success: false, error: "Could not parse that Google Maps link. Try copying the full URL from the browser address bar." };
  }

  const result: ImportResult = {
    name: parsed.name,
    address: "",
    lat: parsed.lat,
    lng: parsed.lng,
    contact_phone: "",
    website: "",
    description: "",
    images: [],
    availability: {},
  };

  if (!apiKey) {
    // Fallback: just reverse geocode for address
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (token) {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${parsed.lng},${parsed.lat}.json?access_token=${token}&limit=1`
        );
        const data = await res.json();
        if (data.features?.[0]) result.address = data.features[0].place_name;
      } catch { /* continue */ }
    }
    return { success: true, data: result };
  }

  try {
    // Resolve place ID
    let placeId: string | undefined = parsed.placeId;

    // If we got a hex-style ID or no ID, search for it
    if (!placeId || placeId.startsWith("0x")) {
      placeId = (await findPlaceId(parsed.name, parsed.lat, parsed.lng, apiKey)) ?? undefined;
    }

    if (!placeId) {
      return { success: true, data: result };
    }

    // Get full place details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,editorial_summary,opening_hours,photos,geometry&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();
    const details = detailsData.result;

    if (!details) {
      return { success: true, data: result };
    }

    // Populate all fields
    result.name = details.name || result.name;
    result.address = details.formatted_address || result.address;
    const rawPhone = details.international_phone_number || details.formatted_phone_number || "";
    result.contact_phone = rawPhone.replace(/[\s\-()]/g, "");
    result.website = details.website || "";
    result.description = details.editorial_summary?.overview || "";

    if (details.geometry?.location) {
      result.lat = details.geometry.location.lat;
      result.lng = details.geometry.location.lng;
    }

    // Parse hours
    if (details.opening_hours?.periods && details.opening_hours.periods.length > 0) {
      for (const period of details.opening_hours.periods) {
        const dayName = DAYS_MAP[period.open?.day];
        if (!dayName) continue;

        if (!period.close) {
          result.availability[dayName] = { type: "text", value: "Open 24 hours" };
        } else {
          result.availability[dayName] = {
            type: "hours",
            open: formatTime(period.open.time),
            close: formatTime(period.close.time),
          };
        }
      }
      // Mark missing days as closed
      for (const day of Object.values(DAYS_MAP)) {
        if (!result.availability[day]) {
          result.availability[day] = { type: "closed" };
        }
      }
    }

    // Download and upload ALL photos (up to 5)
    if (details.photos && details.photos.length > 0) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const photoUrls: string[] = [];

      for (const photo of details.photos.slice(0, 5)) {
        try {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${apiKey}`;
          const photoRes = await fetch(photoUrl, { redirect: "follow" });

          if (!photoRes.ok) continue;

          const arrayBuffer = await photoRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const fileName = `import-${Date.now()}-${photoUrls.length}.jpg`;

          const { error } = await supabase.storage
            .from("listing-images")
            .upload(fileName, buffer, { contentType: "image/jpeg" });

          if (!error) {
            const { data } = supabase.storage
              .from("listing-images")
              .getPublicUrl(fileName);
            photoUrls.push(data.publicUrl);
          }
        } catch {
          // Skip failed photo
        }
      }

      result.images = photoUrls;
    }
  } catch (err) {
    console.error("Google Places import error:", err);
  }

  return { success: true, data: result };
}
