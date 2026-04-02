"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/header";
import { ListingForm, type FormData } from "@/components/listing-form";
import {
  verifyEditCode,
  updateListing,
  removeListing,
} from "@/lib/actions/manage-listing";
import type { Listing } from "@/lib/types";

export default function ManageListingPage() {
  const t = useTranslations("ManageListing");
  const [step, setStep] = useState<"verify" | "edit" | "done">("verify");
  const [listing, setListing] = useState<Listing | null>(null);
  const [editCode, setEditCode] = useState("");
  const [nameOrEmail, setNameOrEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await verifyEditCode(nameOrEmail, code);
    setLoading(false);

    if (result.success && result.listing) {
      setListing(result.listing);
      setEditCode(code);
      setStep("edit");
    } else {
      setError(result.error ?? t("verificationFailed"));
    }
  };

  const handleUpdate = async (data: FormData) => {
    if (!listing) return;
    setLoading(true);
    setError(null);

    const result = await updateListing(listing.id, editCode, {
      name: data.name,
      description: data.description,
      address: data.address,
      lat: data.lat!,
      lng: data.lng!,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      website: data.website,
      availability: data.availability,
      tags: data.tags,
      images: data.images,
    } as Partial<Listing>);

    setLoading(false);

    if (result.success) {
      setMessage(t("updateSuccess"));
    } else {
      setError(result.error ?? t("updateFailed"));
    }
  };

  const handleRemove = async () => {
    if (!listing || !confirm(t("removeConfirm")))
      return;
    setLoading(true);

    const result = await removeListing(listing.id, editCode);
    setLoading(false);

    if (result.success) {
      setStep("done");
    } else {
      setError(result.error ?? t("removeFailed"));
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl text-terracotta mb-2">{t("title")}</h1>

        {step === "verify" && (
          <>
            <p className="text-warm-gray mb-6">
              {t("verifyDescription")}
            </p>
            <form
              onSubmit={handleVerify}
              className="rounded-xl bg-white p-6 shadow-sm space-y-4"
            >
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal">
                  {t("nameOrEmail")}
                </label>
                <input
                  type="text"
                  value={nameOrEmail}
                  onChange={(e) => setNameOrEmail(e.target.value)}
                  className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal">
                  {t("editCode")}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-terracotta px-6 py-3 text-sm font-medium text-white hover:bg-terracotta-dark disabled:opacity-50 transition-colors"
              >
                {loading ? t("verifying") : t("accessListing")}
              </button>
            </form>
          </>
        )}

        {step === "edit" && listing && (
          <>
            <p className="text-warm-gray mb-6">
              {t("editDescription")}
            </p>
            {message && (
              <div className="mb-4 rounded-lg bg-olive-light/20 border border-olive-light p-4 text-sm text-olive-dark">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <ListingForm
                listing={listing}
                onSubmit={handleUpdate}
                submitLabel={t("saveChanges")}
                showEditCode={false}
                loading={loading}
              />
            </div>
            <button
              onClick={handleRemove}
              disabled={loading}
              className="mt-4 w-full rounded-lg border border-red-300 px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {t("removeListing")}
            </button>
          </>
        )}

        {step === "done" && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl text-charcoal mb-3">{t("removedTitle")}</h2>
            <p className="text-warm-gray">
              {t("removedMessage")}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
