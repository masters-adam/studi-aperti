"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { ListingForm, type FormData } from "@/components/listing-form";
import { submitListing } from "@/lib/actions/submit-listing";

export default function AddListingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FormData) => {
    if (data.lat == null || data.lng == null) return;

    setLoading(true);
    setError(null);

    const result = await submitListing({
      name: data.name,
      description: data.description,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      website: data.website,
      availability: data.availability,
      tags: data.tags,
      images: data.images,
      edit_code: data.edit_code,
    });

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "Something went wrong");
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {submitted ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-4xl">✨</div>
            <h1 className="text-3xl text-terracotta mb-3">
              Listing Submitted!
            </h1>
            <p className="text-warm-gray">
              Your listing has been submitted for review. An admin will approve
              it shortly, and it will then appear on the map.
            </p>
            <p className="mt-4 text-sm text-warm-gray">
              Remember your 4-digit edit code to make changes later.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl text-terracotta mb-2">Add Your Studio</h1>
            <p className="text-warm-gray mb-6">
              List your studio or workshop on the Studi Aperti map. Your
              listing will be reviewed before going live.
            </p>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <ListingForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </>
        )}
      </main>
    </>
  );
}
