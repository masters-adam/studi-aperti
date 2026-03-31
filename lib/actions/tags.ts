"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tag } from "@/lib/types";

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  return (data as Tag[]) ?? [];
}

export async function createTag(name: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({ name: name.trim() });

  if (error) {
    if (error.code === "23505") {
      return { error: "A tag with this name already exists" };
    }
    return { error: "Failed to create tag" };
  }

  revalidatePath("/admin/tags");
  return {};
}

export async function toggleTag(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("tags").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/tags");
}

export async function deleteTag(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Check if any listings use this tag
  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .contains("tags", [id]);

  if (listings && listings.length > 0) {
    // Deactivate instead of delete
    await supabase.from("tags").update({ is_active: false }).eq("id", id);
    revalidatePath("/admin/tags");
    return {
      error:
        "Tag is in use by listings — it has been deactivated instead of deleted",
    };
  }

  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/admin/tags");
  return {};
}
