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
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function formatDay(day: AvailabilityDay | undefined): string {
  if (!day) return "—";
  switch (day.type) {
    case "closed":
      return "Closed";
    case "hours":
      return `${day.open} – ${day.close}`;
    case "text":
      return day.value;
  }
}

export function AvailabilitySummary({
  availability,
}: {
  availability: Availability;
}) {
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayInfo = availability[today];

  if (!todayInfo) return null;

  const isOpen = todayInfo.type !== "closed";
  return (
    <span className={`text-xs ${isOpen ? "text-olive" : "text-warm-gray"}`}>
      {isOpen ? `Open today: ${formatDay(todayInfo)}` : "Closed today"}
    </span>
  );
}

export function AvailabilityFull({
  availability,
}: {
  availability: Availability;
}) {
  const hasAny = DAYS.some((d) => availability[d]);
  if (!hasAny) return null;

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {DAYS.map((day) => (
        <div key={day} className="contents">
          <span className="font-medium text-charcoal">{DAY_LABELS[day]}</span>
          <span className="text-warm-gray">{formatDay(availability[day])}</span>
        </div>
      ))}
    </div>
  );
}
