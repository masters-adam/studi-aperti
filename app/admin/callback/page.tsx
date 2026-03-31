"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
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

          // Full page navigation so middleware picks up the new cookies
          window.location.href = "/admin";
        }
      }
    );

    // Fallback: if onAuthStateChange doesn't fire (e.g., already signed in)
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = "/admin";
      } else {
        setError("Login failed or link expired. Please try again.");
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

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
