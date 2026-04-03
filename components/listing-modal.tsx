"use client";

import { useEffect } from "react";
import type { Listing } from "@/lib/types";
import { ListingDetail } from "./listing-detail";

export function ListingModal({
  listing,
  onClose,
}: {
  listing: Listing;
  onClose: () => void;
}) {
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-4 mx-4 max-h-[calc(100vh-2rem)] rounded-2xl bg-cream shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-3 float-right mr-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm hover:bg-white transition-colors text-lg"
        >
          &times;
        </button>

        <ListingDetail listing={listing} />
      </div>
    </div>
  );
}
