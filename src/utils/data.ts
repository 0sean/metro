import { cache } from "react";

import { formatStopName, getTrips, Service, StopTime } from "./buslaneClient";

export type Line = "GRN" | "YEL";

export type Station = { label: string; value: string; lines: Line[] };

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export const getStations = cache(async (): Promise<Station[]> => {
  const trips = await getTrips();

  const stationMap = new Map<string, Set<Line>>();

  trips.forEach((trip) => {
    trip.stop_times.forEach((stopTime) => {
      const name = formatStopName(stopTime.stop.name);
      const line = trip.line;
      if (!stationMap.has(name)) {
        stationMap.set(name, new Set());
      }
      stationMap.get(name)!.add(line);
    });
  });

  return Array.from(stationMap.entries()).map(([name, linesSet]) => ({
    label: name,
    value: toSlug(name),
    lines: Array.from(linesSet),
  }));
});

export const getStation = cache(
  async (slug: string): Promise<Station | null> => {
    const stations = await getStations();
    return stations.find((s) => toSlug(s.label) === slug) || null;
  },
);

type Day = "weekday" | "saturday" | "sunday";

export type Journey = {
  from: StopTime;
  to: StopTime;
  line: Line;
  day: Day;
};

function getDay(service: Service) {
  if (service.saturday) return "saturday";
  if (service.sunday) return "sunday";
  return "weekday";
}

export const getJourneys = cache(async (from: string, to: string) => {
  const trips = await getTrips(),
    validTrips = trips.filter((t) => {
      const fromStop = t.stop_times.find(
          (st) => toSlug(formatStopName(st.stop.name)) === from,
        ),
        toStop = t.stop_times.find(
          (st) => toSlug(formatStopName(st.stop.name)) === to,
        );

      return (
        fromStop && toStop && fromStop.stop_sequence < toStop.stop_sequence
      );
    });

  return validTrips.map((trip) => {
    const fromStop = trip.stop_times.find(
        (st) => toSlug(formatStopName(st.stop.name)) === from,
      )!,
      toStop = trip.stop_times.find(
        (st) => toSlug(formatStopName(st.stop.name)) === to,
      )!;

    if (!trip.service) {
      throw new Error(
        `Trip ${trip.id} on route ${trip.route_id} has no service (vehicle_journey_code: ${trip.vehicle_journey_code})`,
      );
    }

    return {
      from: fromStop,
      to: toStop,
      line: trip.line,
      day: getDay(trip.service),
    } as Journey;
  });
});
