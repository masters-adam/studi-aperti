"use client";

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

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function AvailabilityEditor({
  availability,
  onChange,
}: {
  availability: Availability;
  onChange: (a: Availability) => void;
}) {
  const updateDay = (day: (typeof DAYS)[number], value: AvailabilityDay) => {
    onChange({ ...availability, [day]: value });
  };

  const getType = (day: (typeof DAYS)[number]) =>
    availability[day]?.type ?? "closed";

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-sm font-medium text-charcoal">
        Availability
      </label>
      <div className="space-y-3 rounded-lg border border-warm-gray-light bg-white p-4">
        {DAYS.map((day) => {
          const current = availability[day];
          const type = getType(day);

          return (
            <div key={day} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="w-24 text-sm font-medium text-charcoal">
                {DAY_LABELS[day]}
              </span>

              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value;
                  if (newType === "closed") {
                    updateDay(day, { type: "closed" });
                  } else if (newType === "hours") {
                    updateDay(day, {
                      type: "hours",
                      open: "09:00",
                      close: "17:00",
                    });
                  } else {
                    updateDay(day, { type: "text", value: "" });
                  }
                }}
                className="rounded-lg border border-warm-gray-light bg-white px-3 py-1.5 text-sm text-charcoal focus:border-terracotta focus:outline-none"
              >
                <option value="closed">Closed</option>
                <option value="hours">Set Hours</option>
                <option value="text">Custom Text</option>
              </select>

              {type === "hours" && current?.type === "hours" && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={current.open}
                    onChange={(e) =>
                      updateDay(day, { ...current, open: e.target.value })
                    }
                    className="rounded-lg border border-warm-gray-light bg-white px-2 py-1.5 text-sm focus:border-terracotta focus:outline-none"
                  />
                  <span className="text-warm-gray">–</span>
                  <input
                    type="time"
                    value={current.close}
                    onChange={(e) =>
                      updateDay(day, { ...current, close: e.target.value })
                    }
                    className="rounded-lg border border-warm-gray-light bg-white px-2 py-1.5 text-sm focus:border-terracotta focus:outline-none"
                  />
                </div>
              )}

              {type === "text" && current?.type === "text" && (
                <input
                  type="text"
                  value={current.value}
                  onChange={(e) =>
                    updateDay(day, { type: "text", value: e.target.value })
                  }
                  placeholder="e.g., By appointment only"
                  className="flex-1 rounded-lg border border-warm-gray-light bg-white px-3 py-1.5 text-sm placeholder:text-warm-gray focus:border-terracotta focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
