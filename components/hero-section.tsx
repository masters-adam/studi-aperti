"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <div className="px-4 pt-3 pb-1">
      <div className="relative aspect-[21/9] md:aspect-[21/9] w-full overflow-hidden rounded-xl">
        <Image
          src="/images/hero-valley.jpg"
          alt="Upper Tiber Valley, Umbria"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 45vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
          <h1 className="font-serif text-2xl md:text-4xl text-white leading-tight drop-shadow-lg">
            {t("title")}
          </h1>
        </div>
      </div>
      <p className="mt-2 text-xs md:text-sm text-warm-gray leading-relaxed">
        {t("subtitle")}
      </p>
    </div>
  );
}
