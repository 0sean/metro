import { NextRequest } from "next/server";
import {
  PrismaClient,
  Day,
  Line,
  Stop,
  Prisma,
  Direction,
} from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  await prisma.service.deleteMany({});
  for (var day in Day) {
    for (var line in Line) {
      for (var direction in Direction) {
        const staticStops = {
            // prettier-ignore
            GRN: ["APT", "CAL", "BFT", "KSP", "FAW", "WBR", "RGC", "SGF", "ILF", "WJS", "JES", "HAY", "MTS", "CEN", "GHD", "GST", "FEL", "HTH", "PLW", "FGT", "BYW", "EBO", "SBN", "SFC", "MSP", "SUN", "PLI", "UNI", "MLF", "PAL", "SHL"],
            // prettier-ignore
            YEL: ["SJM", "MTW", "MAN", "BYK", "CRD", "WKG", "WSD", "HDR", "HOW", "PCM", "MWL", "NSH", "TYN", "CUL", "WTL", "MSN", "WMN", "SMR", "NPK", "PMV", "BTN", "FLE", "LBN", "SGF", "ILF", "WJS", "JES", "HAY", "MTS", "CEN", "GHD", "GST", "FEL", "HTH", "PLW", "HEB", "JAR", "BDE", "SMD", "TDK", "CHI", "SSS"],
          },
          lineStops =
            direction == Direction.IN
              ? staticStops[line as Line]
              : staticStops[line as Line].toReversed();

        let stops = await prisma.stop.findMany({
          where: {
            day: day as Day,
            line: line as Line,
            platform: {
              direction: direction as Direction,
            },
          },
          orderBy: {
            time: "asc",
          },
          include: {
            platform: {
              include: {
                station: true,
              },
            },
          },
        });

        const firstStops = stops
          .filter((s) => s.platform.station.code == lineStops[0])
          .sort((a, b) => a.time - b.time);

        new Promise<void>((resolve, reject) => {
          firstStops.forEach((s, i, a) => {
            let foundStops: Stop[] = [];
            lineStops.slice(1).forEach((ls) => {
              let foundStop = stops
                .filter(
                  (lss) =>
                    lss.platform.station.code == ls &&
                    lss.terminates == s.terminates &&
                    (foundStops.length > 0
                      ? lss.time >= foundStops[foundStops.length - 1].time
                      : lss.time >= s.time),
                )
                .sort(
                  (a, b) =>
                    (foundStops.length > 0
                      ? a.time - foundStops[foundStops.length - 1].time
                      : a.time - s.time) -
                    (foundStops.length > 0
                      ? b.time - foundStops[foundStops.length - 1].time
                      : b.time - s.time),
                )[0];
              if (
                foundStops.length > 0 &&
                foundStops[foundStops.length - 1].time >= 2350 &&
                !foundStop
              ) {
                foundStop = stops
                  .filter(
                    (lss) =>
                      lss.platform.station.code == ls &&
                      lss.terminates == s.terminates &&
                      lss.time < 200,
                  )
                  .sort((a, b) => a.time - b.time)[0];
              }
              if (
                foundStops.length > 0 &&
                foundStops[foundStops.length - 1].time >= 2350 &&
                !foundStop &&
                !s.terminates
              )
                debugger;
              // if (!foundStop && !s.terminates) debugger;
              if (!foundStop) return;
              if (
                foundStops.length > 0 &&
                Number(
                  foundStop.time.toString().padStart(4, "0").substring(0, 2),
                ) *
                  60 +
                  Number(
                    foundStop.time.toString().padStart(4, "0").substring(2, 4),
                  ) -
                  (Number(
                    foundStops[foundStops.length - 1].time
                      .toString()
                      .padStart(4, "0")
                      .substring(0, 2),
                  ) *
                    60 +
                    Number(
                      foundStops[foundStops.length - 1].time
                        .toString()
                        .padStart(4, "0")
                        .substring(2, 4),
                    )) >
                  10
              )
                debugger;
              foundStops.push(foundStop);
            });

            stops = stops.filter(
              (ss) =>
                ss.id != s.id && !foundStops.map((fs) => fs.id).includes(ss.id),
            );
            prisma.service
              .create({
                data: {
                  stops: {
                    connect: [s, ...foundStops],
                  },
                },
              })
              .then(() => {
                console.log(
                  `Service created - ${[s, ...foundStops].length} stops`,
                );
              });
            if (i == a.length - 1) resolve();
          });
        }).then(() => {
          new Promise<void>((resolve, reject) => {
            if (stops.length > 0) {
              console.log("checking stop length");
              lineStops.forEach((lls) => {
                const leftStops = stops.filter(
                  (s) => s.platform.station.code == lls,
                );
                leftStops.forEach((s, i, a) => {
                  let foundStops: Stop[] = [];
                  lineStops
                    .filter((ls) => ls != lls)
                    .forEach((ls) => {
                      let foundStop = stops
                        .filter(
                          (lss) =>
                            lss.platform.station.code == ls &&
                            lss.terminates == s.terminates &&
                            (foundStops.length > 0
                              ? lss.time >=
                                foundStops[foundStops.length - 1].time
                              : lss.time >= s.time),
                        )
                        .sort(
                          (a, b) =>
                            (foundStops.length > 0
                              ? a.time - foundStops[foundStops.length - 1].time
                              : a.time - s.time) -
                            (foundStops.length > 0
                              ? b.time - foundStops[foundStops.length - 1].time
                              : b.time - s.time),
                        )[0];
                      if (
                        foundStops.length > 0 &&
                        foundStops[foundStops.length - 1].time >= 2350 &&
                        !foundStop
                      ) {
                        foundStop = stops
                          .filter(
                            (lss) =>
                              lss.platform.station.code == ls &&
                              lss.terminates == s.terminates &&
                              lss.time < 200,
                          )
                          .sort((a, b) => a.time - b.time)[0];
                      }
                      if (
                        foundStops.length > 0 &&
                        foundStops[foundStops.length - 1].time >= 2350 &&
                        !foundStop &&
                        !s.terminates
                      )
                        debugger;
                      // if (!foundStop && !s.terminates) debugger;
                      if (!foundStop) return;
                      if (
                        foundStops.length > 0 &&
                        Number(
                          foundStop.time
                            .toString()
                            .padStart(4, "0")
                            .substring(0, 2),
                        ) *
                          60 +
                          Number(
                            foundStop.time
                              .toString()
                              .padStart(4, "0")
                              .substring(2, 4),
                          ) -
                          (Number(
                            foundStops[foundStops.length - 1].time
                              .toString()
                              .padStart(4, "0")
                              .substring(0, 2),
                          ) *
                            60 +
                            Number(
                              foundStops[foundStops.length - 1].time
                                .toString()
                                .padStart(4, "0")
                                .substring(2, 4),
                            )) >
                          10
                      )
                        debugger;
                      foundStops.push(foundStop);
                    });

                  stops = stops.filter(
                    (ss) =>
                      ss.id != s.id &&
                      !foundStops.map((fs) => fs.id).includes(ss.id),
                  );
                  if (i == a.length - 1) resolve();
                  prisma.service
                    .create({
                      data: {
                        stops: {
                          connect: [s, ...foundStops],
                        },
                      },
                    })
                    .then(() => {
                      console.log(
                        `Left service created - ${[s, ...foundStops].length} stops`,
                      );
                    });
                });
              });
            }
          }).then(() => {
            if (stops.length > 0) debugger;
          });
        });
      }
    }
  }

  return Response.json({ success: true });
}
