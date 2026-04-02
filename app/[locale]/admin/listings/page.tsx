import { Link } from "@/i18n/navigation";
import {
  getAllListings,
  adminRemoveListing,
  adminRestoreListing,
} from "@/lib/actions/admin";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-olive-light/30 text-olive-dark",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-700",
  removed: "bg-warm-gray-light/30 text-warm-gray",
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const listings = await getAllListings(statusFilter || "all");
  const t = await getTranslations("AdminListings");

  const statusKeys = ["all", "approved", "pending", "rejected", "removed"] as const;

  return (
    <div>
      <h1 className="text-2xl text-charcoal mb-4">{t("title")}</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {statusKeys.map((s) => (
          <Link
            key={s}
            href={`/admin/listings${s === "all" ? "" : `?status=${s}`}`}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
              (statusFilter || "all") === s
                ? "bg-terracotta text-white"
                : "bg-white text-charcoal hover:bg-cream-dark"
            }`}
          >
            {t(s)}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-warm-gray">{t("noListings")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark text-left">
                <th className="px-4 py-3 font-medium text-warm-gray">{t("nameHeader")}</th>
                <th className="px-4 py-3 font-medium text-warm-gray">
                  {t("statusHeader")}
                </th>
                <th className="px-4 py-3 font-medium text-warm-gray">
                  {t("createdHeader")}
                </th>
                <th className="px-4 py-3 font-medium text-warm-gray">
                  {t("actionsHeader")}
                </th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-cream-dark last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="text-terracotta hover:underline"
                    >
                      {listing.name}
                    </Link>
                    <p className="text-xs text-warm-gray truncate max-w-xs">
                      {listing.address}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[listing.status] ?? ""}`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-warm-gray">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/listings/${listing.id}`}
                        className="text-xs text-terracotta hover:underline"
                      >
                        {t("edit")}
                      </Link>
                      {listing.status === "approved" && (
                        <form
                          action={adminRemoveListing.bind(null, listing.id)}
                        >
                          <button
                            type="submit"
                            className="text-xs text-red-600 hover:underline"
                          >
                            {t("remove")}
                          </button>
                        </form>
                      )}
                      {listing.status === "removed" && (
                        <form
                          action={adminRestoreListing.bind(null, listing.id)}
                        >
                          <button
                            type="submit"
                            className="text-xs text-olive hover:underline"
                          >
                            {t("restore")}
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
