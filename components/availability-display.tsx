"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Availability, AvailabilityDay } from "@/lib/types";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_SHORT_KEYS: Record<string, string> = {
  monday: "mondayShort",
  tuesday: "tuesdayShort",
  wednesday: "wednesdayShort",
  thursday: "thursdayShort",
  friday: "fridayShort",
  saturday: "saturdayShort",
  sunday: "sundayShort",
};

function formatDay(day: AvailabilityDay | undefined, closedLabel: string): string {
  if (!day) return closedLabel;
  switch (day.type) {
    case "closed":
      return closedLabel;
    case "hours":
      return `${day.open} – ${day.close}`;
    case "text":
      return day.value;
  }
}

function isOpenDay(day: AvailabilityDay | undefined): boolean {
  return !!day && day.type !== "closed";
}

function getTodayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1; // Convert Sun=0 to index 6
}

export function AvailabilitySummary({
  availability,
}: {
  availability: Availability;
}) {
  const tDays = useTranslations("Days");
  const tAvail = useTranslations("Availability");
  const todayIdx = getTodayIndex();
  const today = DAYS[todayIdx];
  const todayInfo = availability[today];
  const hasAny = DAYS.some((d) => availability[d]);

  if (!hasAny) return null;

  // If open today, show today's info
  if (isOpenDay(todayInfo)) {
    return (
      <span className="text-xs text-olive font-medium">
        {tAvail("openToday", { hours: formatDay(todayInfo, tAvail("closed")) })}
      </span>
    );
  }

  // If closed today, find next open day
  for (let offset = 1; offset <= 7; offset++) {
    const nextIdx = (todayIdx + offset) % 7;
    const nextDay = DAYS[nextIdx];
    const nextInfo = availability[nextDay];
    if (isOpenDay(nextInfo)) {
      const fullDayName = tDays(nextDay);
      const timeStr =
        nextInfo?.type === "hours" ? ` ${tAvail("opensAt", { time: nextInfo.open })}` : "";
      return (
        <span className="text-xs text-warm-gray">
          {tAvail("opensDay", { day: fullDayName })}
          {timeStr}
        </span>
      );
    }
  }

  return <span className="text-xs text-warm-gray">{tAvail("closed")}</span>;
}

export function AvailabilityCompact({
  availability,
}: {
  availability: Availability;
}) {
  const tDays = useTranslations("Days");
  const tAvail = useTranslations("Availability");
  const [expanded, setExpanded] = useState(false);
  const todayIdx = getTodayIndex();
  const today = DAYS[todayIdx];
  const todayInfo = availability[today];
  const hasAny = DAYS.some((d) => availability[d]);

  if (!hasAny) return null;

  const isOpen = isOpenDay(todayInfo);

  // Find next open day if closed
  let nextOpenStr = "";
  if (!isOpen) {
    for (let offset = 1; offset <= 7; offset++) {
      const nextIdx = (todayIdx + offset) % 7;
      const nextDay = DAYS[nextIdx];
      const nextInfo = availability[nextDay];
      if (isOpenDay(nextInfo)) {
        const fullDayName = tDays(nextDay);
        const timeStr =
          nextInfo?.type === "hours" ? ` ${tAvail("opensAt", { time: nextInfo.open })}` : "";
        nextOpenStr = `${tAvail("opensDay", { day: fullDayName })}${timeStr}`;
        break;
      }
    }
  }

  return (
    <div className="text-sm">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="flex items-center gap-2 text-left"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${isOpen ? "bg-olive" : "bg-warm-gray-light"}`}
        />
        <span className={isOpen ? "text-olive font-medium" : "text-warm-gray"}>
          {isOpen ? tAvail("openNow", { hours: formatDay(todayInfo, tAvail("closed")) }) : nextOpenStr || tAvail("closed")}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-warm-gray transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 ml-4 space-y-0.5">
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`flex gap-3 text-xs ${i === todayIdx ? "font-medium text-charcoal" : "text-warm-gray"}`}
            >
              <span className="w-8">{tDays(DAY_SHORT_KEYS[day])}</span>
              <span>{formatDay(availability[day], tAvail("closed"))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AvailabilityFull({
  availability,
}: {
  availability: Availability;
}) {
  const tDays = useTranslations("Days");
  const tAvail = useTranslations("Availability");
  const hasAny = DAYS.some((d) => availability[d]);
  if (!hasAny) return null;

  const todayIdx = getTodayIndex();

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {DAYS.map((day, i) => (
        <div
          key={day}
          className={`contents ${i === todayIdx ? "font-medium" : ""}`}
        >
          <span className="text-charcoal">{tDays(DAY_SHORT_KEYS[day])}</span>
          <span className="text-warm-gray">{formatDay(availability[day], tAvail("closed"))}</span>
        </div>
      ))}
    </div>
  );
}
