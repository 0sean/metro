const BASE_URL = process.env.BUSLANE_BASE_URL || "http://localhost:3000",
  API_KEY = process.env.BUSLANE_API_KEY,
  AGENCY_ID = "OP241";

async function get<T>(url: string, tag: string): Promise<T> {
  const date = new Date().toDateString().split("T")[0];
  return await (
    await fetch(`${BASE_URL}/api${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      cache: "force-cache",
      next: { tags: [`${tag}:${date}`] },
    })
  ).json();
}

type Route = {
  id: string;
  agency_id: "OP241";
  short_name: "GRN" | "YEL";
  long_name: null;
  route_type: null;
  created_at: string;
  updated_at: string;
};

async function getRoutes(): Promise<Route[]> {
  return await get<Route[]>("/timetables/agencies/OP241/routes", "routes");
}

type Trip = {
  id: string;
  route_id: string;
  service_id: string;
  headsign: "";
  direction_id: "outbound" | "inbound";
  block_id: "";
  wheelchair_accessible: false;
  vehicle_journey_code: string; // "1"
  created_at: string;
  updated_at: string;
  shape_id: null;
  service: Service;
  frequencies: [];
  stop_times: StopTime[];
};

type TripWithLine = Trip & { line: "GRN" | "YEL" };

export type Service = {
  id: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type StopTime = {
  id: number;
  stop_id: string;
  trip_id: string;
  arrival_time: string; // "08:00:00"
  departure_time: string; // "08:00:00"
  stop_sequence: number;
  stop_headsign: "";
  pickup_type: "regularly_scheduled";
  drop_off_type: "no_drop_off";
  shape_dist_traveled: null;
  timepoint: "approximate";
  created_at: string;
  updated_at: string;
  stop: Stop;
};

type Stop = {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
  wheelchair_boarding: false;
  location_type: "stop";
  platform_code: string;
  created_at: string;
  updated_at: string;
  parent_station_id: string;
};

export async function getTrips(): Promise<TripWithLine[]> {
  const routes = await getRoutes();

  return await routes.reduce<Promise<TripWithLine[]>>(async (acc, route) => {
    const trips = await get<Trip[]>(
      `/timetables/routes/${route.id}/trips`,
      `trips:${route.id}`,
    );

    return [
      ...(await acc),
      ...trips.map((trip) => ({ ...trip, line: route.short_name })),
    ];
  }, Promise.resolve([]));
}

export function formatStopName(name: string): string {
  return name.replace(" (Tyne and Wear Metro Station)", "");
}
