"use client";

import { motion } from "framer-motion";
import { Ref, forwardRef, useMemo } from "react";

function calculateY(relativeSlide: number) {
  switch (relativeSlide) {
    case -4:
      return 62;
    case -3:
      return 29;
    case -2:
      return 6;
    case -1:
      return -1;
    case 1:
      return 1;
    case 2:
      return -6;
    case 3:
      return -29;
    case 4:
      return -62;
    default:
      return 0;
  }
}

const JourneyCard = (
  {
    relativeSlide,
    selected,
    departs,
    arrives,
    stops,
    line,
    currentTime,
  }: {
    relativeSlide: number;
    selected: boolean;
    departs: string;
    arrives: string;
    stops: number;
    line: "GRN" | "YEL";
    currentTime: Date;
  },
  ref: Ref<HTMLDivElement>,
) => {
  const arrivalTime = useMemo(() => {
      return new Date(`${new Date().toISOString().split("T")[0]}T${arrives}`);
    }, [arrives]),
    departingTime = useMemo(() => {
      return new Date(`${new Date().toISOString().split("T")[0]}T${departs}`);
    }, [departs]),
    duration = useMemo(() => {
      return Math.floor(
        (arrivalTime.getTime() - departingTime.getTime()) / (1000 * 60),
      );
    }, [arrivalTime, departingTime]),
    timeUntilDeparting = useMemo(() => {
      return Math.floor(
        (departingTime.getTime() - currentTime.getTime()) / (1000 * 60),
      );
    }, [departingTime, currentTime]);

  return (
    <motion.div
      ref={ref}
      layout
      style={{ borderRadius: 12, filter: `blur(${Math.abs(relativeSlide)}px)` }}
      initial={{
        scale: 1 - Math.abs(relativeSlide) * 0.2,
        y: calculateY(relativeSlide),
        opacity: 1 - Math.abs(relativeSlide) * 0.2,
      }}
      animate={{
        scale:
          1 -
          Math.abs(relativeSlide) *
            (selected && relativeSlide != 0 ? 0.3 : 0.2),
        y: calculateY(relativeSlide) * (selected && relativeSlide != 0 ? 2 : 1),
        opacity:
          1 -
          Math.abs(relativeSlide) *
            (selected && relativeSlide != 0 ? 0.4 : 0.2),
      }}
      exit={{ scale: 0.3, y: -96, opacity: 0 }}
      className="px-4 py-3 bg-gradient-to-b from-neutral-400/10 to-neutral-900/10 w-full ring-2 ring-neutral-400/5 ring-inset flex flex-col gap-4 shadow-xl"
    >
      <motion.div layout className="flex justify-between items-center">
        <div
          className={
            line == "GRN"
              ? "bg-gradient-to-b from-green-400/25 to-green-900/25 px-3.5 py-1 rounded-xl ring-2 ring-green-400/20 ring-inset"
              : "bg-gradient-to-b from-yellow-400/25 to-yellow-900/25 px-3.5 py-1 rounded-xl ring-2 ring-yellow-400/20 ring-inset"
          }
        >
          <h1 className="font-semibold">{line}</h1>
        </div>
        <div>
          <h2 className="font-semibold">
            {timeUntilDeparting > 0
              ? `in ${timeUntilDeparting} minutes`
              : timeUntilDeparting == 0
                ? "Now"
                : `${timeUntilDeparting} minutes ago`}
          </h2>
        </div>
      </motion.div>
      {relativeSlide == 0 && (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between items-center"
        >
          <div>
            <h4 className="font-semibold text-xl leading-none mb-1">
              {departs}
            </h4>
            <h3 className="font-medium text-2xs text-neutral-400">DEPARTS</h3>
          </div>
          <div>
            <h4 className="font-semibold text-xl leading-none mb-1">
              {arrives}
            </h4>
            <h3 className="font-medium text-2xs text-neutral-400">ARRIVES</h3>
          </div>
          <div>
            <h4 className="font-semibold text-xl leading-none mb-1">
              {duration} min{duration > 1 && "s"}
            </h4>
            <h3 className="font-medium text-2xs text-neutral-400">DURATION</h3>
          </div>
          <div>
            <h4 className="font-semibold text-xl leading-none mb-1">
              {stops} stop{stops > 1 && "s"}
            </h4>
            <h3 className="font-medium text-2xs text-neutral-400">STAY ON</h3>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const ForwardedJourneyCard = forwardRef(JourneyCard);
export default ForwardedJourneyCard;
