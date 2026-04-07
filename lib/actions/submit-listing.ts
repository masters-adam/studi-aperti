"use server";

import { createServiceClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { sendNewListingNotification } from "@/lib/email";
import { translateListing } from "@/lib/translate";

type SubmitData = {
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  contact_email: string;
  contact_phone: string;
  website: string;
  instagram: string;
  availability: Record<string, unknown>;
  tags: string[];
  images: string[];
  edit_code: string;
};

export async function submitListing(
  data: SubmitData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const [hashedCode, translations] = await Promise.all([
    bcrypt.hash(data.edit_code, 10),
    translateListing(data.name, data.description),
  ]);

  const { error } = await supabase.from("listings").insert({
    name: data.name,
    description: data.description,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    contact_email: data.contact_email,
    contact_phone: data.contact_phone,
    website: data.website,
    instagram: data.instagram,
    availability: data.availability,
    tags: data.tags,
    images: data.images,
    edit_code: hashedCode,
    translations,
    status: "pending",
  });

  if (error) {
    console.error("Error submitting listing:", error);
    return { success: false, error: "Failed to submit listing. Please try again." };
  }

  // Notify admins
  const { data: admins } = await supabase.from("admins").select("email");
  if (admins && admins.length > 0) {
    await sendNewListingNotification(
      data.name,
      admins.map((a) => a.email)
    );
  }

  return { success: true };
}
