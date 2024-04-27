import { PrismaClient, Direction } from "@prisma/client";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface RTIPlatform {
  platformNumber: number;
  direction: Direction;
  helperText: string;
}

export async function GET(request: NextRequest) {
  // TODO: Auth check
  const prisma = new PrismaClient(),
    stations: Record<string, string> = await (
      await fetch("https://metro-rti.nexus.org.uk/api/stations")
    ).json(),
    platforms: Record<string, RTIPlatform[]> = await (
      await fetch("https://metro-rti.nexus.org.uk/api/stations/platforms")
    ).json(),
    currentStations = (await prisma.station.findMany()).map((s) => s.code);

  Object.entries(stations)
    .filter(([code, name]) => !currentStations.includes(code))
    .forEach(async ([code, name]) => {
      const station = await prisma.station.create({
        data: {
          code,
          name,
        },
      });

      await prisma.platform.createMany({
        data: platforms[code].map((p) => ({
          number: p.platformNumber,
          direction: p.direction,
          text: p.helperText,
          stationId: station.id,
        })),
      });

      if (code == "SHL" || code == "SSS") {
        await prisma.platform.create({
          data: {
            number: 0,
            direction: Direction.IN,
            text: "End of line",
            stationId: station.id,
          },
        });
      }

      if (code == "APT" || code == "SJM") {
        await prisma.platform.create({
          data: {
            number: 0,
            direction: Direction.OUT,
            text: "End of line",
            stationId: station.id,
          },
        });
      }
    });

  return Response.json({ success: true });
}
