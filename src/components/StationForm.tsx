"use client";

import { useState } from "react";
import StationSelect from "./StationSelect";
import type { getStations } from "@/utils/data";
import { useRouter } from "next/navigation";
import { Line } from "@prisma/client";
import { SingleValue } from "react-select";

export default function StationForm({
  stations,
}: {
  stations: Awaited<ReturnType<typeof getStations>>;
}) {
  const [from, setFrom] = useState<
      SingleValue<{ label: string; value: string; lines: Line[] }> | undefined
    >(undefined),
    [to, setTo] = useState<
      SingleValue<{ label: string; value: string; lines: Line[] }> | undefined
    >(undefined),
    router = useRouter();
  return (
    <>
      <div className="flex gap-2">
        <StationSelect
          value={from}
          setValue={setFrom}
          stations={stations}
          placeholder="From"
        />
        <StationSelect
          value={to}
          setValue={setTo}
          stations={stations}
          placeholder="To"
        />
      </div>
      <button
        disabled={!from || !to}
        onClick={() => {
          router.push(`/${from?.value}/${to?.value}`);
        }}
        className="py-2 px-4 inline-flex justify-center items-center w-fit text-sm h-10 bg-gradient-to-bl from-neutral-400/10 to-neutral-900/10 ring-1 ring-neutral-300/5 ring-inset font-medium text-neutral-50 rounded-lg hover:scale-110 shadow-sm hover:shadow-md transition-[transform,box-shadow,opacity] duration-500 disabled:opacity-50"
      >
        Find
      </button>
    </>
  );
}
