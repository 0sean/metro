"use client";

import JourneyCard from "@/components/JourneyCard";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  FiChevronRight,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Journey } from "@/utils/data";
import { formatStopName } from "@/utils/buslaneClient";
import { getJourneyKey, getUpcomingJourneys } from "@/utils/journeys";

export default function JourneyPage({ journeys }: { journeys: Journey[] }) {
  const [slide, setSlide] = useState(0),
    [selected, setSelected] = useState(false),
    [currentTime, setCurrentTime] = useState(new Date()),
    [filterTime, setFilterTime] = useState(new Date()),
    filteredJourneys = useMemo(
      () => getUpcomingJourneys(journeys, filterTime),
      [journeys, filterTime],
    ),
    router = useRouter(),
    activeSlide = Math.min(slide, Math.max(0, filteredJourneys.length - 1));

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      date.setSeconds(0, 0);
      setCurrentTime(date);
      if (selected) return;
      setFilterTime(date);
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
          <h1 className="font-semibold">
            {journeys[0] && formatStopName(journeys[0].from.stop.name)}
          </h1>
          <FiChevronRight />
          <h1 className="font-semibold">
            {journeys[0] && formatStopName(journeys[0].to.stop.name)}
          </h1>
        </div>
        <div className="px-4 py-2 bg-gradient-to-b from-neutral-400/10 to-neutral-900/10 w-fit ring-2 ring-neutral-400/5 ring-inset flex justify-center items-center gap-2 rounded-full shadow">
          <h2 className="font-medium text-2xs text-neutral-400">
            Platform{" "}
            {filteredJourneys[activeSlide]?.from.stop.platform_code ?? "—"}
          </h2>
        </div>
      </div>

      <motion.div
        className="flex flex-col w-full max-w-96"
        style={{ height: 111 }}
        animate={{ y: activeSlide * -55 }}
      >
        {filteredJourneys.length === 0 && (
          <p className="text-center text-neutral-400">
            No more scheduled departures today.
          </p>
        )}
        <AnimatePresence mode="popLayout">
          {filteredJourneys.map((j, i) => (
            <JourneyCard
              key={getJourneyKey(j)}
              relativeSlide={i - activeSlide}
              selected={selected}
              departs={j.from.departure_time.split(":").slice(0, 2).join(":")}
              arrives={j.to.arrival_time.split(":").slice(0, 2).join(":")}
              stops={j.to.stop_sequence - j.from.stop_sequence}
              line={j.line as "GRN" | "YEL"}
              currentTime={currentTime}
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
                disabled={activeSlide === 0}
                onClick={() => {
                  if (activeSlide > 0) setSlide(activeSlide - 1);
                }}
              >
                <FiArrowLeft />
              </motion.button>
            )}
            <button
              disabled={filteredJourneys.length === 0}
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
                disabled={activeSlide >= filteredJourneys.length - 1}
                onClick={() => {
                  if (activeSlide < filteredJourneys.length - 1)
                    setSlide(activeSlide + 1);
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
