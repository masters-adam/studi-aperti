"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { ListingForm, type FormData } from "@/components/listing-form";
import {
  verifyEditCode,
  updateListing,
  removeListing,
} from "@/lib/actions/manage-listing";
import type { Listing } from "@/lib/types";

export default function ManageListingPage() {
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
      setError(result.error ?? "Verification failed");
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
      setMessage("Listing updated successfully!");
    } else {
      setError(result.error ?? "Failed to update");
    }
  };

  const handleRemove = async () => {
    if (!listing || !confirm("Are you sure you want to remove your listing?"))
      return;
    setLoading(true);

    const result = await removeListing(listing.id, editCode);
    setLoading(false);

    if (result.success) {
      setStep("done");
    } else {
      setError(result.error ?? "Failed to remove listing");
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl text-terracotta mb-2">Manage Your Listing</h1>

        {step === "verify" && (
          <>
            <p className="text-warm-gray mb-6">
              Enter your studio name or email and your 4-digit edit code to
              access your listing.
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
                  Studio Name or Email
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
                  4-Digit Edit Code
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
                {loading ? "Verifying..." : "Access Listing"}
              </button>
            </form>
          </>
        )}

        {step === "edit" && listing && (
          <>
            <p className="text-warm-gray mb-6">
              Edit your listing below. Changes go live immediately.
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
                submitLabel="Save Changes"
                showEditCode={false}
                loading={loading}
              />
            </div>
            <button
              onClick={handleRemove}
              disabled={loading}
              className="mt-4 w-full rounded-lg border border-red-300 px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              Remove My Listing
            </button>
          </>
        )}

        {step === "done" && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl text-charcoal mb-3">Listing Removed</h2>
            <p className="text-warm-gray">
              Your listing has been removed from the map.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
