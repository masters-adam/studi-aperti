"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, next, prev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors"
      >
        &times;
      </button>

      {/* Image */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: "92vw", height: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`Image ${index + 1}`}
          fill
          className="object-contain"
          sizes="92vw"
        />
      </div>

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-lg hover:bg-white/20 transition-colors"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-lg hover:bg-white/20 transition-colors"
          >
            &#8250;
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

export function ClickableImage({
  src,
  alt,
  images,
  index,
  className,
  sizes,
  fill,
  width,
  height,
}: {
  src: string;
  alt: string;
  images: string[];
  index: number;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={`${className} cursor-pointer`}
        sizes={sizes}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ImageLightbox
          images={images}
          initialIndex={index}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
