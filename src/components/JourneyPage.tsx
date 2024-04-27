"use client";

import JourneyCard from "@/components/JourneyCard";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Journey, RTIJourney, getJourneys } from "@/utils/data";
import useSWR from "swr";

import {
  FiChevronRight,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Station } from "@prisma/client";

export default function JourneyPage({
  from,
  to,
  stops,
}: {
  from: Station;
  to: Station;
  stops: Journey[];
}) {
  const [slide, setSlide] = useState(0),
    [selected, setSelected] = useState(false),
    [currentTime, setCurrentTime] = useState(new Date()),
    journeys = useMemo(
      //   () => [
      //     { id: 1, departs: "22:50", arrives: "22:57", stops: 1, line: "GRN" },
      //     { id: 2, departs: "22:58", arrives: "23:00", stops: 1, line: "GRN" },
      //     { id: 3, departs: "23:09", arrives: "23:14", stops: 1, line: "GRN" },
      //     { id: 4, departs: "23:15", arrives: "23:23", stops: 1, line: "GRN" },
      //     { id: 5, departs: "23:17", arrives: "23:19", stops: 1, line: "YEL" },
      //   ],
      () =>
        stops.map((s) => ({
          id: s[0]?.id,
          departs: `${s[0]?.time.toString().substring(0, 2)}:${s[0]?.time.toString().substring(2, 4)}`,
          arrives: `${s[1]?.time.toString().substring(0, 2)}:${s[1]?.time.toString().substring(2, 4)}`,
          stops: s[2],
          line: s[1]?.line,
          platform: s[2],
        })),
      [stops],
    ),
    filteredJourneys = useMemo(
      () =>
        journeys
          .filter((j) => {
            return (
              new Date(
                `${new Date().toISOString().split("T")[0]}T${j.departs}`,
              ) >= currentTime
            );
          })
          .sort(
            (a, b) =>
              new Date(
                `${new Date().toISOString().split("T")[0]}T${a.departs}`,
              ).getTime() -
              new Date(
                `${new Date().toISOString().split("T")[0]}T${b.departs}`,
              ).getTime(),
          )
          .slice(0, 5),
      [journeys, currentTime],
    ),
    router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      if (selected) return;
      const date = new Date();
      date.setSeconds(0, 0);
      setCurrentTime(date);
    }, 1000);
    return () => clearInterval(interval);
  }, [selected]);

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="absolute top-4 max-w-96 w-full flex flex-col items-center gap-3">
        <div className="px-4 py-3 bg-gradient-to-b from-neutral-400/10 to-neutral-900/10 w-full ring-2 ring-neutral-400/5 ring-inset flex justify-center items-center gap-2 rounded-xl shadow-xl">
          <button
            onClick={() => {
              router.push("/");
            }}
            className="absolute left-4 p-2 font-medium text-neutral-50 rounded-full hover:scale-110 transition-[transform,opacity] duration-500"
          >
            <FiArrowLeft />
          </button>
          <h1 className="font-semibold">{from.name}</h1>
          <FiChevronRight />
          <h1 className="font-semibold">{to.name}</h1>
        </div>
        <div className="px-4 py-2 bg-gradient-to-b from-neutral-400/10 to-neutral-900/10 w-fit ring-2 ring-neutral-400/5 ring-inset flex justify-center items-center gap-2 rounded-full shadow">
          <h2 className="font-medium text-2xs text-neutral-400">
            Platform {(journeys[slide || 0] || {}).platform}
          </h2>
        </div>
      </div>

      <motion.div
        className="flex flex-col w-full max-w-96"
        style={{ height: 111 }}
        animate={{ y: slide * -55 }}
      >
        <AnimatePresence mode="popLayout">
          {filteredJourneys.map((j, i) => (
            <JourneyCard
              key={j.id}
              relativeSlide={i - slide}
              selected={selected}
              departs={j.departs}
              arrives={j.arrives}
              stops={j.stops}
              line={j.line as "GRN" | "YEL"}
              currentTime={currentTime}
              rti={undefined}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      <div className="absolute bottom-8 w-full flex justify-center">
        <motion.div
          initial={{ width: 160 }}
          animate={{ width: selected ? 64 : 160 }}
          className="rounded-full overflow-hidden bg-gradient-to-tr from-neutral-400/10 to-neutral-900/10 ring-2 ring-neutral-400/5 ring-inset p-3 flex justify-center gap-2 shadow-xl"
        >
          <AnimatePresence>
            {!selected && (
              <motion.button
                key="left"
                exit={{ opacity: 0 }}
                className="p-3 bg-gradient-to-bl from-neutral-400/10 to-neutral-900/10 ring-1 ring-neutral-300/5 ring-inset font-medium text-neutral-50 rounded-full hover:scale-110 hover:shadow-md transition-[transform,box-shadow,opacity] duration-500 disabled:opacity-50"
                disabled={slide == 0}
                onClick={() => {
                  if (slide > 0) setSlide(slide - 1);
                }}
              >
                <FiArrowLeft />
              </motion.button>
            )}
            <button
              className="p-3 h-10 w-10 bg-white font-medium text-black rounded-full hover:scale-110 hover:shadow-md transition-[transform,box-shadow] duration-500 flex"
              onClick={() => {
                setSelected(!selected);
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {!selected && (
                  <motion.div
                    initial={{ x: -32, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key="check"
                    exit={{ x: 32, opacity: 0 }}
                  >
                    <FiCheck />
                  </motion.div>
                )}
                {selected && (
                  <motion.div
                    initial={{ x: -32, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key="left"
                    exit={{ x: 32, opacity: 0 }}
                  >
                    <FiArrowLeft />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            {!selected && (
              <motion.button
                key="right"
                exit={{ opacity: 0 }}
                className="p-3 bg-gradient-to-bl from-neutral-400/10 to-neutral-900/10 ring-1 ring-neutral-300/5 ring-inset font-medium text-neutral-50 rounded-full hover:scale-110 hover:shadow-md transition-[transform,box-shadow,opacity] duration-500 disabled:opacity-50"
                disabled={slide == 4 || slide == filteredJourneys.length - 1}
                onClick={() => {
                  if (slide < 4) setSlide(slide + 1);
                }}
              >
                <FiArrowRight />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
