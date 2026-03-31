"use client";

import { useState } from "react";
import type { Listing, Availability } from "@/lib/types";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { AddressPicker } from "./address-picker";
import { ImageUpload } from "./image-upload";
import { GoogleMapsImport } from "./google-maps-import";
import { AvailabilityEditor } from "./availability-editor";
import { TagSelector } from "./tag-selector";

type FormData = {
  name: string;
  description: string;
  address: string;
  lat: number | null;
  lng: number | null;
  contact_email: string;
  contact_phone: string;
  website: string;
  availability: Availability;
  tags: string[];
  images: string[];
  edit_code: string;
  edit_code_confirm: string;
};

function emptyForm(): FormData {
  return {
    name: "",
    description: "",
    address: "",
    lat: null,
    lng: null,
    contact_email: "",
    contact_phone: "",
    website: "",
    availability: {},
    tags: [],
    images: [],
    edit_code: "",
    edit_code_confirm: "",
  };
}

function fromListing(listing: Listing): FormData {
  return {
    name: listing.name,
    description: listing.description,
    address: listing.address,
    lat: listing.lat,
    lng: listing.lng,
    contact_email: listing.contact_email,
    contact_phone: listing.contact_phone,
    website: listing.website,
    availability: listing.availability,
    tags: listing.tags,
    images: listing.images,
    edit_code: "",
    edit_code_confirm: "",
  };
}

export function ListingForm({
  listing,
  onSubmit,
  submitLabel = "Submit Listing",
  showEditCode = true,
  loading = false,
}: {
  listing?: Listing;
  onSubmit: (data: FormData) => Promise<void>;
  submitLabel?: string;
  showEditCode?: boolean;
  loading?: boolean;
}) {
  const [form, setForm] = useState<FormData>(
    listing ? fromListing(listing) : emptyForm()
  );
  const [errors, setErrors] = useState<string[]>([]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Name is required");
    if (!form.description.trim()) errs.push("Description is required");
    if (!form.address.trim() || form.lat == null || form.lng == null)
      errs.push("Address with map location is required");
    if (form.images.length === 0) errs.push("At least one image is required");
    if (!form.contact_email.trim() && !form.contact_phone.trim())
      errs.push("At least an email or phone number is required");
    if (showEditCode) {
      if (!/^\d{4}$/.test(form.edit_code))
        errs.push("Edit code must be exactly 4 digits");
      if (form.edit_code !== form.edit_code_confirm)
        errs.push("Edit codes do not match");
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Google Maps import */}
      {showEditCode && (
        <GoogleMapsImport
          onImport={(data) => {
            setForm((prev) => ({
              ...prev,
              name: data.name || prev.name,
              description: data.description || prev.description,
              address: data.address || prev.address,
              lat: data.lat,
              lng: data.lng,
              contact_phone: data.contact_phone || prev.contact_phone,
              website: data.website || prev.website,
              images: data.images.length > 0 ? data.images : prev.images,
              availability: Object.keys(data.availability).length > 0
                ? data.availability
                : prev.availability,
            }));
          }}
        />
      )}

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal">
          Studio / Artist Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-warm-gray focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
          placeholder="e.g., Maria's Ceramics Studio"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal">
          Description *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-warm-gray focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
          placeholder="Tell visitors about your studio, your art, and what they can expect..."
        />
      </div>

      {/* Address */}
      <AddressPicker
        address={form.address}
        lat={form.lat}
        lng={form.lng}
        onChange={({ address, lat, lng }) => {
          update("address", address);
          setForm((prev) => ({ ...prev, lat, lng }));
        }}
      />

      {/* Images */}
      <ImageUpload
        images={form.images}
        onChange={(urls) => update("images", urls)}
      />

      {/* Tags */}
      <TagSelector
        selectedTags={form.tags}
        onChange={(tags) => update("tags", tags)}
      />

      {/* Availability */}
      <AvailabilityEditor
        availability={form.availability}
        onChange={(a) => update("availability", a)}
      />

      {/* Contact info */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-charcoal">
          Contact Information * <span className="text-warm-gray font-normal">(email or phone required)</span>
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-warm-gray">Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
              className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-warm-gray focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-warm-gray">Phone</label>
            <PhoneInput
              international
              defaultCountry="IT"
              value={form.contact_phone}
              onChange={(val) => update("contact_phone", val || "")}
              className="phone-input-wrapper"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-warm-gray">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-warm-gray focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            placeholder="https://..."
          />
        </div>
      </fieldset>

      {/* Edit Code */}
      {showEditCode && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-charcoal">
            Edit Code *
          </legend>
          <p className="text-xs text-warm-gray">
            Choose a 4-digit code to edit your listing later. Keep it safe!
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-warm-gray">
                4-Digit Code
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={form.edit_code}
                onChange={(e) =>
                  update("edit_code", e.target.value.replace(/\D/g, ""))
                }
                className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                placeholder="e.g., 1234"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-warm-gray">
                Confirm Code
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={form.edit_code_confirm}
                onChange={(e) =>
                  update("edit_code_confirm", e.target.value.replace(/\D/g, ""))
                }
                className="w-full rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                placeholder="Confirm code"
              />
            </div>
          </div>
        </fieldset>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-terracotta px-6 py-3 text-sm font-medium text-white hover:bg-terracotta-dark disabled:opacity-50 transition-colors"
      >
        {loading ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}

export type { FormData };
