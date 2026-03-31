"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TagBadge } from "./tag-badge";

export function TagSelector({
  selectedTags,
  onChange,
}: {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("tags")
      .select("name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setAvailableTags((data ?? []).map((t) => t.name));
      });
  }, []);

  const toggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  if (availableTags.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-sm font-medium text-charcoal">
        Art Type / Medium
      </label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <TagBadge
            key={tag}
            name={tag}
            active={selectedTags.includes(tag)}
            onClick={() => toggle(tag)}
          />
        ))}
      </div>
    </div>
  );
}
