import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-cream-dark bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-2xl text-terracotta hover:text-terracotta-dark transition-colors">
          Studi Aperti
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/add-listing"
            className="rounded-lg bg-terracotta px-4 py-2 text-white hover:bg-terracotta-dark transition-colors"
          >
            Add Listing
          </Link>
          <Link
            href="/manage-listing"
            className="text-warm-gray hover:text-charcoal transition-colors"
          >
            Manage
          </Link>
        </nav>
      </div>
    </header>
  );
}
