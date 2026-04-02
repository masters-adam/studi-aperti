"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ListingForm, type FormData } from "@/components/listing-form";
import { ClickableImage } from "@/components/image-lightbox";
import {
  getListingById,
  approveListing,
  rejectListing,
  adminUpdateListing,
  adminRemoveListing,
  adminRestoreListing,
} from "@/lib/actions/admin";
import { TagBadge } from "@/components/tag-badge";
import { AvailabilityFull } from "@/components/availability-display";
import type { Listing } from "@/lib/types";

export default function AdminListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("AdminListings");
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"preview" | "edit">("preview");

  useEffect(() => {
    getListingById(params.id as string).then((data) => {
      setListing(data);
      setLoading(false);
    });
  }, [params.id]);

  const handleApprove = async () => {
    if (!listing) return;
    setSaving(true);
    await approveListing(listing.id);
    setSaving(false);
    router.push("/admin");
  };

  const handleReject = async () => {
    if (!listing || !confirm(t("rejectConfirm"))) return;
    setSaving(true);
    await rejectListing(listing.id);
    setSaving(false);
    router.push("/admin");
  };

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
    setMessage(t("updateSuccess"));
    // Refresh listing data
    const updated = await getListingById(listing.id);
    if (updated) setListing(updated);
    setMode("preview");
  };

  const handleRemove = async () => {
    if (!listing || !confirm(t("removeConfirm"))) return;
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
        {t("loading")}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-warm-gray">{t("notFound")}</p>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    approved: "bg-olive-light/30 text-olive-dark",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-700",
    removed: "bg-warm-gray-light/30 text-warm-gray",
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={listing.status === "pending" ? "/admin" : "/admin/listings"}
          className="text-sm text-warm-gray hover:text-terracotta"
        >
          &larr; {t("back")}
        </Link>
        <h1 className="text-2xl text-charcoal">{listing.name}</h1>
        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[listing.status] ?? ""}`}
        >
          {listing.status}
        </span>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-olive-light/20 border border-olive-light p-4 text-sm text-olive-dark">
          {message}
        </div>
      )}

      {mode === "preview" ? (
        <>
          {/* Preview / review view */}
          <div className="rounded-xl bg-white shadow-sm overflow-hidden">
            {/* Images */}
            {listing.images.length > 0 && (
              <div className="flex gap-1 overflow-x-auto">
                {listing.images.map((src, i) => (
                  <div
                    key={i}
                    className={`relative flex-shrink-0 overflow-hidden ${
                      listing.images.length === 1 ? "w-full h-64" : "w-72 h-52"
                    }`}
                  >
                    <ClickableImage
                      src={src}
                      alt={`${listing.name} ${i + 1}`}
                      images={listing.images}
                      index={i}
                      fill
                      className="object-cover"
                      sizes={listing.images.length === 1 ? "640px" : "288px"}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 space-y-4">
              {/* Title + tags */}
              <div>
                <h2 className="text-2xl text-charcoal">{listing.name}</h2>
                {listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {listing.tags.map((tag) => (
                      <TagBadge key={tag} name={tag} />
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {listing.description && (
                <p className="text-sm text-charcoal leading-relaxed">
                  {listing.description}
                </p>
              )}

              {/* Address */}
              <div className="text-sm">
                <h4 className="font-medium text-charcoal mb-1">{t("address")}</h4>
                <p className="text-warm-gray">{listing.address}</p>
                <p className="text-xs text-warm-gray mt-0.5">
                  {listing.lat.toFixed(5)}, {listing.lng.toFixed(5)}
                </p>
              </div>

              {/* Availability */}
              <div>
                <h4 className="text-sm font-medium text-charcoal mb-2">{t("availability")}</h4>
                <AvailabilityFull availability={listing.availability} />
              </div>

              {/* Contact */}
              <div className="text-sm">
                <h4 className="font-medium text-charcoal mb-1">{t("contact")}</h4>
                <div className="space-y-0.5 text-warm-gray">
                  {listing.contact_email && <p>{listing.contact_email}</p>}
                  {listing.contact_phone && <p>{listing.contact_phone}</p>}
                  {listing.website && (
                    <p>
                      <a
                        href={listing.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terracotta hover:underline"
                      >
                        {listing.website}
                      </a>
                    </p>
                  )}
                  {!listing.contact_email && !listing.contact_phone && !listing.website && (
                    <p className="italic">{t("noContact")}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-warm-gray pt-2 border-t border-cream-dark">
                {t("submitted", { date: new Date(listing.created_at).toLocaleDateString() })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            {listing.status === "pending" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className="rounded-lg bg-olive px-5 py-2.5 text-sm font-medium text-white hover:bg-olive-dark disabled:opacity-50 transition-colors"
                >
                  {saving ? t("saving") : t("approve")}
                </button>
                <button
                  onClick={handleReject}
                  disabled={saving}
                  className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {t("reject")}
                </button>
              </>
            )}
            <button
              onClick={() => setMode("edit")}
              className="rounded-lg bg-terracotta px-5 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark transition-colors"
            >
              {t("editListing")}
            </button>
            {listing.status === "approved" && (
              <button
                onClick={handleRemove}
                className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                {t("remove")}
              </button>
            )}
            {listing.status === "removed" && (
              <button
                onClick={handleRestore}
                className="rounded-lg bg-olive px-5 py-2.5 text-sm font-medium text-white hover:bg-olive-dark transition-colors"
              >
                {t("restore")}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Edit mode */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setMode("preview")}
              className="text-sm text-warm-gray hover:text-terracotta"
            >
              &larr; {t("backToPreview")}
            </button>
            <h2 className="text-lg text-charcoal">{t("editing")}</h2>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <ListingForm
              listing={listing}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
              showEditCode={false}
              loading={saving}
            />
          </div>
        </>
      )}
    </div>
  );
}
