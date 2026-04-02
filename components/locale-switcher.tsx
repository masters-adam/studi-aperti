"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (newLocale: "en" | "it") => {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div
      className={`flex rounded-full border border-warm-gray-light text-xs font-medium overflow-hidden transition-opacity ${isPending ? "opacity-50" : ""}`}
    >
      <button
        onClick={() => switchTo("en")}
        className={`px-2.5 py-1 transition-colors ${
          locale === "en"
            ? "bg-terracotta text-white"
            : "text-warm-gray hover:text-charcoal"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("it")}
        className={`px-2.5 py-1 transition-colors ${
          locale === "it"
            ? "bg-terracotta text-white"
            : "text-warm-gray hover:text-charcoal"
        }`}
      >
        IT
      </button>
    </div>
  );
}
