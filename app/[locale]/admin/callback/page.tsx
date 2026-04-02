"use client";

import { Suspense, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";

function CallbackHandler() {
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("AdminCallback");
  const locale = useLocale();

  useEffect(() => {
    const supabase = createClient();

    const processAuth = async () => {
      // The hash fragment contains the access token from the magic link.
      // Supabase client auto-detects and sets the session from the URL hash.
      // We just need to wait for it.

      // First check if session already exists (e.g., from hash auto-detection)
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
          setError(t("notAuthorized"));
          return;
        }

        window.location.href = `/${locale}/admin`;
        return;
      }

      // Listen for auth state change (hash token gets picked up async)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, sess) => {
        if (event === "SIGNED_IN" && sess) {
          const { data: admin } = await supabase
            .from("admins")
            .select("id")
            .eq("id", sess.user.id)
            .single();

          if (!admin) {
            await supabase.auth.signOut();
            setError(t("notAuthorized"));
            return;
          }

          window.location.href = `/${locale}/admin`;
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        setError(t("linkExpired"));
      }, 10000);
    };

    processAuth();
  }, [locale, t]);

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm text-center max-w-sm">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          href="/admin/login"
          className="text-sm text-terracotta hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return <p className="text-warm-gray">{t("signingIn")}</p>;
}

export default function AdminCallbackPage() {
  const t = useTranslations("AdminCallback");

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <Suspense fallback={<p className="text-warm-gray">{t("loading")}</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
