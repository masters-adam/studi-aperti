"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Admin } from "@/lib/types";

export async function getAdmins(): Promise<Admin[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admins")
    .select("*")
    .order("created_at");

  return (data as Admin[]) ?? [];
}

export async function getCurrentAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function inviteAdmin(
  email: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const serviceClient = await createServiceClient();

  // Get current admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Invite user via Supabase Auth (service role required)
  const { data: inviteData, error: inviteError } =
    await serviceClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://studi-aperti.vercel.app"}/admin/accept-invite`,
    });

  if (inviteError) {
    // If user already exists, just add them to admins
    if (inviteError.message.includes("already been registered")) {
      const { data: existingUsers } =
        await serviceClient.auth.admin.listUsers();

      const existingUser = existingUsers?.users?.find(
        (u) => u.email === email
      );

      if (existingUser) {
        const { error: insertError } = await supabase
          .from("admins")
          .insert({
            id: existingUser.id,
            email,
            invited_by: user.id,
          });

        if (insertError) {
          if (insertError.code === "23505") {
            return { error: "This person is already an admin" };
          }
          return { error: "Failed to add admin" };
        }

        revalidatePath("/admin/admins");
        return {};
      }
    }

    return { error: inviteError.message };
  }

  // Add to admins table
  if (inviteData.user) {
    await supabase.from("admins").insert({
      id: inviteData.user.id,
      email,
      invited_by: user.id,
    });
  }

  revalidatePath("/admin/admins");
  return {};
}

export async function removeAdmin(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Prevent removing yourself
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === id) {
    return { error: "You cannot remove yourself" };
  }

  const { error } = await supabase.from("admins").delete().eq("id", id);

  if (error) {
    return { error: "Failed to remove admin" };
  }

  revalidatePath("/admin/admins");
  return {};
}
