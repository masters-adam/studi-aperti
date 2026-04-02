import { useLocale } from "next-intl";
import type { Listing } from "./types";

/**
 * Returns localized name and description for a listing.
 * Falls back to the original fields if translations aren't available.
 */
export function useLocalizedListing(listing: Listing) {
  const locale = useLocale() as "en" | "it";

  const name =
    listing.translations?.name?.[locale] || listing.name;
  const description =
    listing.translations?.description?.[locale] || listing.description;

  return { ...listing, name, description };
}
