"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const t = useTranslations("Header");

  return (
    <header className="border-b border-cream-dark bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-1.5 md:px-6 md:py-2">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Studi Aperti"
            width={120}
            height={48}
            className="h-10 md:h-12 w-auto"
            priority
          />
        </Link>
        <nav className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
          <Link
            href="/add-listing"
            className="hidden sm:inline-flex rounded-lg bg-terracotta px-3 py-1.5 md:px-4 md:py-2 text-white hover:bg-terracotta-dark transition-colors"
          >
            {t("addListing")}
          </Link>
          <Link
            href="/add-listing"
            className="sm:hidden rounded-lg bg-terracotta px-2.5 py-1.5 text-white hover:bg-terracotta-dark transition-colors"
          >
            +
          </Link>
          <Link
            href="/manage-listing"
            className="text-warm-gray hover:text-charcoal transition-colors"
          >
            {t("manage")}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
