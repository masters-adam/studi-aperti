"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ListingForm, type FormData } from "@/components/listing-form";
import {
  getListingById,
  adminUpdateListing,
  adminRemoveListing,
  adminRestoreListing,
} from "@/lib/actions/admin";
import type { Listing } from "@/lib/types";

export default function AdminEditListingPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getListingById(params.id as string).then((data) => {
      setListing(data);
      setLoading(false);
    });
  }, [params.id]);

  const handleUpdate = async (data: FormData) => {
    if (!listing) return;
    setSaving(true);
    setMessage(null);

    await adminUpdateListing(listing.id, {
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

    setSaving(false);
    setMessage("Listing updated successfully!");
  };

  const handleRemove = async () => {
    if (!listing || !confirm("Remove this listing?")) return;
    await adminRemoveListing(listing.id);
    router.push("/admin/listings");
  };

  const handleRestore = async () => {
    if (!listing) return;
    await adminRestoreListing(listing.id);
    router.push("/admin/listings");
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-warm-gray">
        Loading...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-warm-gray">Listing not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/listings"
          className="text-sm text-warm-gray hover:text-terracotta"
        >
          &larr; Back
        </Link>
        <h1 className="text-2xl text-charcoal">Edit: {listing.name}</h1>
        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${
            listing.status === "approved"
              ? "bg-olive-light/30 text-olive-dark"
              : listing.status === "removed"
                ? "bg-warm-gray-light/30 text-warm-gray"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {listing.status}
        </span>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-olive-light/20 border border-olive-light p-4 text-sm text-olive-dark">
          {message}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <ListingForm
          listing={listing}
          onSubmit={handleUpdate}
          submitLabel="Save Changes"
          showEditCode={false}
          loading={saving}
        />
      </div>

      <div className="flex gap-3 mt-4">
        {listing.status !== "removed" && (
          <button
            onClick={handleRemove}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Remove Listing
          </button>
        )}
        {listing.status === "removed" && (
          <button
            onClick={handleRestore}
            className="rounded-lg bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive-dark transition-colors"
          >
            Restore Listing
          </button>
        )}
      </div>
    </div>
  );
}
