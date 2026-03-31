import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-cream-dark bg-white md:block">
        <div className="p-4">
          <Link
            href="/admin"
            className="text-xl text-terracotta"
          >
            Studi Aperti
          </Link>
          <p className="text-xs text-warm-gray mt-1">Admin Dashboard</p>
        </div>

        <nav className="mt-4 space-y-1 px-2">
          <Link
            href="/admin"
            className="block rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
          >
            Pending Listings
          </Link>
          <Link
            href="/admin/listings"
            className="block rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
          >
            All Listings
          </Link>
          <Link
            href="/admin/tags"
            className="block rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
          >
            Tags
          </Link>
          <Link
            href="/admin/admins"
            className="block rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
          >
            Admins
          </Link>
        </nav>

        <div className="mt-auto p-4">
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-warm-gray hover:text-terracotta transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-cream-dark bg-white px-4 py-3 md:hidden">
          <Link href="/admin" className="text-lg text-terracotta">
            Studi Aperti Admin
          </Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link href="/admin" className="text-charcoal">
              Pending
            </Link>
            <Link href="/admin/listings" className="text-charcoal">
              Listings
            </Link>
            <Link href="/admin/tags" className="text-charcoal">
              Tags
            </Link>
            <Link href="/admin/admins" className="text-charcoal">
              Admins
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-warm-gray">
                Out
              </button>
            </form>
          </nav>
        </header>

        <main className="flex-1 bg-cream p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
