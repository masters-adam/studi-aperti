"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/callback`,
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
          Studi Aperti
        </h1>
        <p className="text-center text-warm-gray mb-8">Admin Login</p>

        {sent ? (
          <div className="rounded-xl bg-white p-6 shadow-sm text-center">
            <div className="text-3xl mb-3">&#9993;</div>
            <h2 className="text-lg text-charcoal mb-2">Check your email</h2>
            <p className="text-sm text-warm-gray">
              We sent a magic link to <strong>{email}</strong>. Click the link in your email to sign in.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-terracotta hover:underline"
            >
              Try a different email
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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-terracotta px-6 py-3 text-sm font-medium text-white hover:bg-terracotta-dark disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>

            <p className="text-xs text-warm-gray text-center">
              Only authorized admins can sign in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
