"use client";

import { useTranslations } from "next-intl";
import { TagBadge } from "./tag-badge";

export function TagFilter({
  tags,
  selectedTag,
  onSelectTag,
}: {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}) {
  const t = useTranslations("Homepage");

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <TagBadge
        name={t("all")}
        active={selectedTag === null}
        onClick={() => onSelectTag(null)}
      />
      {tags.map((tag) => (
        <TagBadge
          key={tag}
          name={tag}
          active={selectedTag === tag}
          onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
        />
      ))}
    </div>
  );
}
