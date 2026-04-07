export type ListingStatus = "pending" | "approved" | "rejected" | "removed";

export type AvailabilityDay =
  | { type: "closed" }
  | { type: "hours"; open: string; close: string }
  | { type: "text"; value: string };

export type Availability = {
  monday?: AvailabilityDay;
  tuesday?: AvailabilityDay;
  wednesday?: AvailabilityDay;
  thursday?: AvailabilityDay;
  friday?: AvailabilityDay;
  saturday?: AvailabilityDay;
  sunday?: AvailabilityDay;
};

export type ListingTranslations = {
  name: { en: string; it: string };
  description: { en: string; it: string };
};

export type Listing = {
  id: string;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  contact_email: string;
  contact_phone: string;
  website: string;
  instagram: string;
  availability: Availability;
  tags: string[];
  images: string[];
  translations: ListingTranslations | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  removed_at: string | null;
};

export type Tag = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type Admin = {
  id: string;
  email: string;
  invited_by: string | null;
  created_at: string;
};
