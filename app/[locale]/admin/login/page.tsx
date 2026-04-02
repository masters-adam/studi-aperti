"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("AdminLogin");
  const locale = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/admin/callback`,
      },
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl text-terracotta mb-2">
          {t("title")}
        </h1>
        <p className="text-center text-warm-gray mb-8">{t("subtitle")}</p>

        {sent ? (
          <div className="rounded-xl bg-white p-6 shadow-sm text-center">
            <div className="text-3xl mb-3">&#9993;</div>
            <h2 className="text-lg text-charcoal mb-2">{t("checkEmail")}</h2>
            <p className="text-sm text-warm-gray">
              {t.rich("magicLinkSent", {
                email,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-terracotta hover:underline"
            >
              {t("tryDifferent")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white p-6 shadow-sm space-y-4"
          >
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                placeholder={t("emailPlaceholder")}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-terracotta px-6 py-3 text-sm font-medium text-white hover:bg-terracotta-dark disabled:opacity-50 transition-colors"
            >
              {loading ? t("sending") : t("sendMagicLink")}
            </button>

            <p className="text-xs text-warm-gray text-center">
              {t("onlyAuthorized")}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
