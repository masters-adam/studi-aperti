"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");

    const processAuth = async () => {
      // If there's a code param (PKCE flow), exchange it for a session
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("Login failed: " + exchangeError.message);
          return;
        }
      }

      // Check if we have a session now
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
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

        window.location.href = "/admin";
        return;
      }

      // Fallback: listen for hash token (implicit flow)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, sess) => {
        if (event === "SIGNED_IN" && sess) {
          window.location.href = "/admin";
        }
      });

      setTimeout(() => {
        subscription.unsubscribe();
        setError("Login failed or link expired. Please try again.");
      }, 5000);
    };

    processAuth();
  }, [searchParams]);

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm text-center max-w-sm">
        <p className="text-red-600 mb-4">{error}</p>
        <a href="/admin/login" className="text-sm text-terracotta hover:underline">
          Back to login
        </a>
      </div>
    );
  }

  return <p className="text-warm-gray">Signing you in...</p>;
}

export default function AdminCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <Suspense fallback={<p className="text-warm-gray">Loading...</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
