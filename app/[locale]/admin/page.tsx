import { getPendingListings } from "@/lib/actions/admin";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminPendingPage() {
  const listings = await getPendingListings();
  const t = await getTranslations("Admin");

  return (
    <div>
      <h1 className="text-2xl text-charcoal mb-6">
        {t("pendingListings")}
        {listings.length > 0 && (
          <span className="ml-2 text-lg text-warm-gray">
            ({listings.length})
          </span>
        )}
      </h1>

      {listings.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-warm-gray">{t("noPending")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/admin/listings/${listing.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-base text-charcoal">{listing.name}</h3>
                <p className="text-sm text-warm-gray">{listing.address}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <span className="inline-block rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  {t("pending")}
                </span>
                <p className="text-xs text-warm-gray mt-1">
                  {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
