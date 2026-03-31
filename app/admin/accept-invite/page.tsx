"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const processInvite = async () => {
      // Give Supabase a moment to process the token from the URL hash
      await new Promise((r) => setTimeout(r, 500));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Try once more
        await new Promise((r) => setTimeout(r, 1500));
        const { data: { session: retry } } = await supabase.auth.getSession();
        if (!retry) {
          setError("Invalid or expired invite link. Please request a new invite.");
          return;
        }
      }

      // Invite accepted — redirect to admin
      router.push("/admin");
    };

    processInvite();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="rounded-xl bg-white p-6 shadow-sm text-center max-w-sm">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/admin/login" className="text-sm text-terracotta hover:underline">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="text-center">
        <p className="text-warm-gray mb-2">Setting up your account...</p>
        <p className="text-xs text-warm-gray">You&apos;ll be redirected to the admin dashboard.</p>
      </div>
    </div>
  );
}
