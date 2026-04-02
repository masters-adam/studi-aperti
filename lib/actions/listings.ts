"use server";

import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";

export async function getApprovedListings(): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, name, description, address, lat, lng, contact_email, contact_phone, website, availability, tags, images, translations, status, created_at, updated_at, removed_at"
    )
    .eq("status", "approved")
    .order("name");

  if (error) {
    console.error("Error fetching listings:", error.message, error.code, error.details);
    return [];
  }

  return (data as Listing[]) ?? [];
}
