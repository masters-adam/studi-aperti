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

  const isOpen = (day: (typeof DAYS)[number]) => {
    const d = availability[day];
    return d ? d.type !== "closed" : false;
  };

  const getMode = (day: (typeof DAYS)[number]) => {
    const d = availability[day];
    if (!d || d.type === "closed") return "hours";
    return d.type;
  };

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-sm font-medium text-charcoal">
        Availability
      </label>
      <div className="space-y-2 rounded-lg border border-warm-gray-light bg-white p-4">
        {DAYS.map((day) => {
          const current = availability[day];
          const open = isOpen(day);
          const mode = getMode(day);

          return (
            <div key={day} className="space-y-2">
              <div className="flex items-center gap-3">
                {/* Day name */}
                <span className="w-24 text-sm font-medium text-charcoal">
                  {DAY_LABELS[day]}
                </span>

                {/* Open/Closed toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (open) {
                      updateDay(day, { type: "closed" });
                    } else {
                      updateDay(day, { type: "hours", open: "09:00", close: "17:00" });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                    open ? "bg-olive" : "bg-warm-gray-light"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      open ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-xs text-warm-gray w-12">
                  {open ? "Open" : "Closed"}
                </span>

                {/* Mode + inputs (only when open) */}
                {open && (
                  <>
                    <select
                      value={mode}
                      onChange={(e) => {
                        if (e.target.value === "hours") {
                          updateDay(day, { type: "hours", open: "09:00", close: "17:00" });
                        } else {
                          updateDay(day, { type: "text", value: "" });
                        }
                      }}
                      className="rounded-lg border border-warm-gray-light bg-white px-2 py-1.5 text-xs text-charcoal focus:border-terracotta focus:outline-none"
                    >
                      <option value="hours">Hours</option>
                      <option value="text">Text</option>
                    </select>

                    {mode === "hours" && current?.type === "hours" && (
                      <>
                        <input
                          type="time"
                          value={current.open}
                          onChange={(e) =>
                            updateDay(day, { ...current, open: e.target.value })
                          }
                          className="w-[110px] rounded-lg border border-warm-gray-light bg-white px-2 py-1.5 text-xs focus:border-terracotta focus:outline-none"
                        />
                        <span className="text-warm-gray text-xs">–</span>
                        <input
                          type="time"
                          value={current.close}
                          onChange={(e) =>
                            updateDay(day, { ...current, close: e.target.value })
                          }
                          className="w-[110px] rounded-lg border border-warm-gray-light bg-white px-2 py-1.5 text-xs focus:border-terracotta focus:outline-none"
                        />
                      </>
                    )}

                    {mode === "text" && current?.type === "text" && (
                      <input
                        type="text"
                        value={current.value}
                        onChange={(e) =>
                          updateDay(day, { type: "text", value: e.target.value })
                        }
                        placeholder="e.g., By appointment"
                        className="flex-1 min-w-[120px] rounded-lg border border-warm-gray-light bg-white px-2 py-1.5 text-xs placeholder:text-warm-gray focus:border-terracotta focus:outline-none"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
