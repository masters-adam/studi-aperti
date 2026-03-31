"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Listing } from "@/lib/types";

export async function getPendingListings(): Promise<Listing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, name, description, address, lat, lng, contact_email, contact_phone, website, availability, tags, images, status, created_at, updated_at, removed_at"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (data as Listing[]) ?? [];
}

export async function getAllListings(
  statusFilter?: string
): Promise<Listing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      "id, name, description, address, lat, lng, contact_email, contact_phone, website, availability, tags, images, status, created_at, updated_at, removed_at"
    )
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data } = await query;
  return (data as Listing[]) ?? [];
}

export async function getListingById(
  id: string
): Promise<Listing | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, name, description, address, lat, lng, contact_email, contact_phone, website, availability, tags, images, status, created_at, updated_at, removed_at"
    )
    .eq("id", id)
    .single();

  return (data as Listing) ?? null;
}

export async function approveListing(id: string) {
  const supabase = await createClient();
  await supabase
    .from("listings")
    .update({ status: "approved" })
    .eq("id", id);

  // TODO: Send approval email to artist

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectListing(id: string) {
  const supabase = await createClient();
  await supabase
    .from("listings")
    .update({ status: "rejected" })
    .eq("id", id);

  revalidatePath("/admin");
}

export async function adminUpdateListing(
  id: string,
  data: Partial<Listing>
) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at, updated_at, removed_at, ...safeData } =
    data as Record<string, unknown>;

  await supabase.from("listings").update(safeData).eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/");
}

export async function adminRemoveListing(id: string) {
  const supabase = await createClient();
  await supabase
    .from("listings")
    .update({ status: "removed", removed_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/");
}

export async function adminRestoreListing(id: string) {
  const supabase = await createClient();
  await supabase
    .from("listings")
    .update({ status: "approved", removed_at: null })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/");
}
