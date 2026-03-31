import { getPendingListings, approveListing, rejectListing } from "@/lib/actions/admin";
import Image from "next/image";
import { TagBadge } from "@/components/tag-badge";

export const dynamic = "force-dynamic";

export default async function AdminPendingPage() {
  const listings = await getPendingListings();

  return (
    <div>
      <h1 className="text-2xl text-charcoal mb-6">
        Pending Listings
        {listings.length > 0 && (
          <span className="ml-2 text-lg text-warm-gray">
            ({listings.length})
          </span>
        )}
      </h1>

      {listings.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-warm-gray">No pending listings to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="flex gap-4">
                {/* Images */}
                {listing.images.length > 0 && (
                  <div className="flex gap-2 flex-shrink-0">
                    {listing.images.slice(0, 3).map((src, i) => (
                      <div
                        key={i}
                        className="relative h-20 w-20 overflow-hidden rounded-lg"
                      >
                        <Image
                          src={src}
                          alt={`${listing.name} ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg text-charcoal">{listing.name}</h3>
                  <p className="text-sm text-warm-gray mt-1">
                    {listing.address}
                  </p>
                  {listing.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {listing.tags.map((tag) => (
                        <TagBadge key={tag} name={tag} />
                      ))}
                    </div>
                  )}
                  {listing.description && (
                    <p className="text-sm text-charcoal mt-2">
                      {listing.description}
                    </p>
                  )}
                  {listing.contact_email && (
                    <p className="text-xs text-warm-gray mt-2">
                      Contact: {listing.contact_email}
                    </p>
                  )}
                  <p className="text-xs text-warm-gray mt-1">
                    Submitted:{" "}
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-cream-dark">
                <form action={approveListing.bind(null, listing.id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive-dark transition-colors"
                  >
                    Approve
                  </button>
                </form>
                <form action={rejectListing.bind(null, listing.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
