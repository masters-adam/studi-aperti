"use server";

import { createServiceClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import type { Listing } from "@/lib/types";

export async function verifyEditCode(
  nameOrEmail: string,
  code: string
): Promise<{ success: boolean; listing?: Listing; error?: string }> {
  const supabase = await createServiceClient();

  // Try matching by name first, then by email
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .or(`name.ilike.%${nameOrEmail}%,contact_email.ilike.%${nameOrEmail}%`)
    .neq("status", "removed");

  if (!listings || listings.length === 0) {
    return { success: false, error: "No listing found with that name or email" };
  }

  // Try each matching listing
  for (const listing of listings) {
    const match = await bcrypt.compare(code, listing.edit_code);
    if (match) {
      // Don't expose the edit_code hash to the client
      const { edit_code: _editCode, ...safe } = listing;
      return { success: true, listing: safe as Listing };
    }
  }

  return { success: false, error: "Incorrect edit code" };
}

export async function updateListing(
  id: string,
  editCode: string,
  data: Partial<Listing>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  // Re-verify the edit code
  const { data: listing } = await supabase
    .from("listings")
    .select("edit_code")
    .eq("id", id)
    .single();

  if (!listing) {
    return { success: false, error: "Listing not found" };
  }

  const match = await bcrypt.compare(editCode, listing.edit_code);
  if (!match) {
    return { success: false, error: "Incorrect edit code" };
  }

  // Don't allow changing status or edit_code through this endpoint
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { status, edit_code, id: listingId, ...safeData } = data as Record<string, unknown>;

  const { error } = await supabase
    .from("listings")
    .update(safeData)
    .eq("id", id);

  if (error) {
    console.error("Error updating listing:", error);
    return { success: false, error: "Failed to update listing" };
  }

  return { success: true };
}

export async function removeListing(
  id: string,
  editCode: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("edit_code")
    .eq("id", id)
    .single();

  if (!listing) {
    return { success: false, error: "Listing not found" };
  }

  const match = await bcrypt.compare(editCode, listing.edit_code);
  if (!match) {
    return { success: false, error: "Incorrect edit code" };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "removed", removed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Failed to remove listing" };
  }

  return { success: true };
}
