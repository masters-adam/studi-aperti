"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Supabase processes the hash fragment automatically
    const checkSession = async () => {
      // Small delay to let Supabase process the token from the URL hash
      await new Promise((r) => setTimeout(r, 500));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Login failed. Please try again.");
        return;
      }

      // Verify user is an admin
      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!admin) {
        await supabase.auth.signOut();
        setError("You are not authorized as an admin.");
        return;
      }

      router.push("/admin");
    };

    checkSession();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="rounded-xl bg-white p-6 shadow-sm text-center max-w-sm">
          <p className="text-red-600 mb-4">{error}</p>
          <a
            href="/admin/login"
            className="text-sm text-terracotta hover:underline"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <p className="text-warm-gray">Signing you in...</p>
    </div>
  );
}
