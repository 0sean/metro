import type { Journey } from "./data";

const serviceClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function timeInSeconds(time: string): number {
  const [hours, minutes, seconds = 0] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// API trip IDs differ between timetable versions. Identify the actual journey
// using its line, platforms, exact times and number of stops instead.
export function getJourneyKey(journey: Journey): string {
  return JSON.stringify([
    journey.line,
    journey.from.stop_id,
    journey.to.stop_id,
    journey.from.departure_time,
    journey.to.arrival_time,
    journey.to.stop_sequence - journey.from.stop_sequence,
  ]);
}

export function getUpcomingJourneys(
  journeys: Journey[],
  time: Date,
  limit = 5,
): Journey[] {
  const parts = Object.fromEntries(
    serviceClock.formatToParts(time).map(({ type, value }) => [type, value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const weekday = parts.weekday.toLowerCase() as
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  const now = timeInSeconds(`${parts.hour}:${parts.minute}:${parts.second}`);
  const seen = new Set<string>();

  return journeys
    .filter((journey) => {
      const { service } = journey;
      if (
        !service[weekday] ||
        date < service.start_date ||
        date > service.end_date ||
        timeInSeconds(journey.from.departure_time) < now
      ) {
        return false;
      }

      // Filter by calendar before deduplicating: an inactive version must not
      // hide an identical departure from an active timetable.
      const key = getJourneyKey(journey);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        timeInSeconds(a.from.departure_time) -
        timeInSeconds(b.from.departure_time),
    )
    .slice(0, limit);
}
