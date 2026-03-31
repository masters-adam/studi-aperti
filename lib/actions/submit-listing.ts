"use server";

import { createServiceClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

type SubmitData = {
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  contact_email: string;
  contact_phone: string;
  website: string;
  availability: Record<string, unknown>;
  tags: string[];
  images: string[];
  edit_code: string;
};

export async function submitListing(
  data: SubmitData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const hashedCode = await bcrypt.hash(data.edit_code, 10);

  const { error } = await supabase.from("listings").insert({
    name: data.name,
    description: data.description,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    contact_email: data.contact_email,
    contact_phone: data.contact_phone,
    website: data.website,
    availability: data.availability,
    tags: data.tags,
    images: data.images,
    edit_code: hashedCode,
    status: "pending",
  });

  if (error) {
    console.error("Error submitting listing:", error);
    return { success: false, error: "Failed to submit listing. Please try again." };
  }

  // TODO: Send email notification to admins

  return { success: true };
}
