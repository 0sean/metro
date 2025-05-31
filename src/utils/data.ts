import { Day, PrismaClient, Stop } from "@prisma/client";
import { cache } from "react";
import { toZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();

export const getStations = cache(async () => {
  const stations = await prisma.station.findMany({
    include: {
      platforms: {
        include: {
          stops: {
            distinct: ["line"],
            select: {
              line: true,
            },
          },
        },
      },
    },
  });

  return stations;
});

export const getStation = cache(async (code: string) => {
  const station = await prisma.station.findFirstOrThrow({
    where: {
      code,
    },
  });

  return station;
});

export const getJourneys = cache(
  async (from: number, to: number): Promise<Journey[]> => {
    const now = new Date();
    const londonDate =
      now.getTimezoneOffset() != 0 ? now : toZonedTime(now, "Europe/London");
    const londonDay = londonDate.getDay();

    const stops = await prisma.stop.findMany({
      where: {
        platform: {
          stationId: from,
        },
        day:
          londonDay == 6
            ? Day.Saturday
            : londonDay == 0
              ? Day.Sunday
              : Day.Weekday,
      },
      include: {
        service: {
          include: {
            stops: {
              include: {
                platform: true,
              },
            },
          },
        },
      },
    });

    return stops
      .map(
        (s) =>
          [
            s,

            s.service?.stops
              .sort((a, b) => a.time - b.time)
              .find((ss) => ss.platform.stationId == to && ss.time > s.time),

            s.service?.stops
              .sort((a, b) => a.time - b.time)
              .findIndex(
                (ss) => ss.platform.stationId == to && ss.time > s.time,
              )! -
              s.service?.stops
                .sort((a, b) => a.time - b.time)
                .findIndex((ss) => ss.id == s.id)!,

            s.service?.stops.find((ss) => ss.id == s.id)?.platform.number,
          ] as Journey,
      )
      .filter((s) => s[1] != null);
  },
);

export type Journey = [Stop, Stop, number, number];

export type RTIJourney = {
  trn: string;
  lastEvent: string;
  lastEventLocation: string;
  lastEventTime: string;
  destination: string;
  dueIn: number;
  line: "GREEN" | "YELLOW";
};
