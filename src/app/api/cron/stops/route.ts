import {
  PrismaClient,
  Day,
  Line,
  Stop,
  Prisma,
  Direction,
} from "@prisma/client";
import { NextRequest } from "next/server";
import * as cheerio from "cheerio";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // TODO: Auth check
  // Make terminates into a reference?
  const platforms = await prisma.platform.findMany();

  await prisma.stop.deleteMany({});

  const mtw = await prisma.station.findFirstOrThrow({ where: { code: "MTW" } });

  const newStops = (
    await Promise.all(
      (await prisma.station.findMany({ where: { code: { not: "MTW" } } })).map(
        async (s) => {
          const stationStops: Prisma.StopCreateManyInput[] = [];
          let slug = s.name.toLowerCase().split(" ").join("-");
          if (slug === "central") slug = "central-station";
          if (slug === "stadium-of-light") slug = "stadium-light";
          if (slug === "monument-n-s") slug = "monument";

          const r = await fetch(
              `https://www.nexus.org.uk/metro/timetables-and-stations/${slug}/timetable`,
            ),
            html = await r.text(),
            $ = cheerio.load(html);

          if (!r.ok) return [];

          $("#system_main_block > .bs-container-fluid")
            .children("h2")
            .each(function () {
              if (!$(this).text().trim().startsWith("Platform")) return;
              const platformNumber =
                Number($(this).text().trim().split(" ")[1]) +
                (s.code === "SUN" ? 1 : 0);
              if (isNaN(platformNumber)) return;
              if (platformNumber > 2 && s.code != "SUN") s = mtw;
              const platform = platforms.find(
                (p) => p.number === platformNumber && p.stationId === s.id,
              );
              if (!platform) return;

              $(this)
                .nextUntil("h2")
                .filter(function () {
                  return $(this).hasClass("tbl-container");
                })
                .each(function () {
                  const line = $(this).hasClass("g") ? Line.GRN : Line.YEL,
                    terminates = $(this)
                      .find(".additional-info")
                      .find(".tbl-item-content-row")
                      .map(function () {
                        return [
                          [
                            $(this).find(".tbl-info-item-main").text(),
                            $(this)
                              .find(".tbl-info-item")
                              .text()
                              .replace("Terminates at ", "")
                              .trim(),
                          ],
                        ];
                      })
                      .get();
                  $(this)
                    .find(".tbl-item")
                    .each(function () {
                      const day =
                        $(this).find(".tbl-item-header").text().trim() ==
                        "Monday to Friday"
                          ? Day.Weekday
                          : Day[
                              $(this).find(".tbl-item-header").text().trim() as
                                | "Saturday"
                                | "Sunday"
                            ];
                      $(this)
                        .find(".tbl-item-content-row")
                        .each(function () {
                          const hour = $(this).children().first().text().trim(),
                            data = $(this)
                              .children()
                              .filter(function () {
                                return !$(this).is(":first-of-type");
                              })
                              .map(function () {
                                return [
                                  [
                                    $(this).text().split(" ")[0].trim(),
                                    $(this)
                                      .text()
                                      .split(" ")
                                      .splice(1)
                                      .join(" ")
                                      .trim(),
                                  ],
                                ];
                              })
                              .get()
                              .map((m) => ({
                                line,
                                time: Number(`${hour}${m[0]}`),
                                day,
                                platformId: platform.id,
                                terminates: terminates.find(
                                  (t) => t[0] === m[1],
                                )
                                  ? terminates.find((t) => t[0] === m[1])![1]
                                  : undefined,
                              }));

                          stationStops.push(...data);
                        });
                    });
                });
            });

          return stationStops;
        },
      ),
    )
  ).flat();

  const stopsCreated = await prisma.stop.createMany({
    data: newStops,
  });

  console.log(stopsCreated);

  ["SHL", "SSS"].forEach(async (station) => {
    const previousStops = await prisma.stop.findMany({
        where: {
          platform: {
            station: {
              code: station == "SHL" ? "PAL" : "CHI",
            },
            direction: Direction.IN,
          },
        },
      }),
      eolPlatform = await prisma.platform.findFirstOrThrow({
        where: {
          station: {
            code: station,
          },
          number: 0,
        },
      });

    await prisma.stop.createMany({
      data: previousStops.map((s: Optional<Stop, "id">) => {
        delete s["id"];
        return {
          ...s,
          platformId: eolPlatform.id,
          time: s.time + (station == "SHL" ? 5 : 7),
        };
      }),
    });
  });

  ["APT", "SJM"].forEach(async (station) => {
    const previousStops = await prisma.stop.findMany({
        where: {
          platform: {
            station: {
              code: station == "APT" ? "CAL" : "MTW",
            },
            direction: Direction.OUT,
          },
        },
      }),
      eolPlatform = await prisma.platform.findFirstOrThrow({
        where: {
          station: {
            code: station,
          },
          number: 0,
        },
      });

    await prisma.stop.createMany({
      data: previousStops.map((s: Optional<Stop, "id">) => {
        delete s["id"];
        return {
          ...s,
          platformId: eolPlatform.id,
          time: s.time + (station == "APT" ? 3 : 2),
        };
      }),
    });
  });

  // For some reason some stops are missing from the Nexus website - it is only one stop per station so it is updated to terminate where data stops
  const rgc = await prisma.stop.findFirst({
    where: {
      line: "GRN",
      time: 1839,
      day: Day.Weekday,
      platform: {
        station: {
          code: "RGC",
        },
        direction: Direction.IN,
      },
    },
  });
  if (rgc) {
    const sgfPlatform = await prisma.platform.findFirstOrThrow({
        where: {
          station: {
            code: "SGF",
          },
          direction: Direction.IN,
        },
      }),
      sgf = await prisma.stop.findFirst({
        where: {
          line: "GRN",
          time: 1842,
          day: Day.Weekday,
          platformId: sgfPlatform.id,
        },
      });

    if (!sgf) {
      const rgcStops = await prisma.stop.findMany({
        where: {
          line: "GRN",
          time: 1839,
          platform: {
            station: {
              code: "RGC",
            },
            direction: Direction.IN,
          },
        },
      });
      await prisma.stop.deleteMany({
        where: {
          id: { in: rgcStops.map((s) => s.id) },
        },
      });
      [
        ["WBR", 1837],
        ["FAW", 1835],
        ["KSP", 1833],
        ["BFT", 1831],
        ["CAL", 1828],
        ["APT", 1826],
      ].forEach(async ([station, time]) => {
        const platform = await prisma.platform.findFirstOrThrow({
            where: {
              station: {
                code: station as string,
              },
              direction: Direction.IN,
            },
          }),
          stops = await prisma.stop.findMany({
            where: {
              line: "GRN",
              time: time as number,
              platformId: platform.id,
            },
          });

        if (stops.length > 0) {
          await prisma.stop.updateMany({
            where: {
              id: { in: stops.map((s) => s.id) },
            },
            data: {
              terminates: "Regent Centre",
            },
          });
        }
      });
    }
  }

  // code was here

  return Response.json({ success: true });
}
