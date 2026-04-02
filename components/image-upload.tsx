"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const MAX_IMAGES = 5;
const MAX_SIZE_PX = 1200;

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_SIZE_PX) {
        height = (height * MAX_SIZE_PX) / width;
        width = MAX_SIZE_PX;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob!),
        "image/jpeg",
        0.8
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

export function ImageUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const t = useTranslations("Images");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (images.length + files.length > MAX_IMAGES) {
      alert(t("maxAllowed", { max: MAX_IMAGES }));
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const resized = await resizeImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

      const { error } = await supabase.storage
        .from("listing-images")
        .upload(fileName, resized, {
          contentType: "image/jpeg",
        });

      if (!error) {
        const { data } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }
    }

    onChange([...images, ...newUrls]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-sm font-medium text-charcoal">
        {t("label")} <span className="text-warm-gray font-normal">{t("limit", { max: MAX_IMAGES })}</span>
      </label>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-lg">
              <Image
                src={url}
                alt={`Upload ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {images.length < MAX_IMAGES && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) {
              handleUpload(e.dataTransfer.files);
            }
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-warm-gray-light py-8 text-sm text-warm-gray hover:border-terracotta hover:text-terracotta transition-colors"
        >
          {uploading ? (
            <span>{t("uploading")}</span>
          ) : (
            <>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mb-2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{t("clickOrDrag")}</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />
    </div>
  );
}
