"use client";

import { Line } from "@prisma/client";
import Select, {
  OptionProps,
  SingleValueProps,
  components,
  SingleValue as SingleValueType,
} from "react-select";
import type { getStations } from "@/utils/data";

function Option(
  props: OptionProps<{ label: string; value: string; lines: Line[] }>,
) {
  return (
    <components.Option {...props}>
      {props.children}{" "}
      <div className="inline-flex gap-1 flex-col">
        {(
          props.data as { value: string; label: string; lines: Line[] }
        ).lines.map((l: Line) => (
          <div
            key={l}
            className={`w-2 h-2 rounded-full bg-gradient-to-b ${l == Line.GRN ? "from-green-400/75 to-green-900/75 ring-1 ring-green-400/60 ring-inset" : "from-yellow-400/75 to-yellow-900/75 ring-1 ring-yellow-400/40 ring-inset"}`}
          ></div>
        ))}
      </div>
    </components.Option>
  );
}

function SingleValue(
  props: SingleValueProps<{ label: string; value: string; lines: Line[] }>,
) {
  return (
    <components.SingleValue {...props}>
      {props.children}{" "}
      <div className="inline-flex gap-1 flex-col">
        {props.data.lines.map((l: Line) => (
          <div
            key={l}
            className={`w-2 h-2 rounded-full bg-gradient-to-b ${l == Line.GRN ? "from-green-400/75 to-green-900/75 ring-1 ring-green-400/60 ring-inset" : "from-yellow-400/75 to-yellow-900/75 ring-1 ring-yellow-400/40 ring-inset"}`}
          ></div>
        ))}
      </div>
    </components.SingleValue>
  );
}

export default function StationSelect({
  stations,
  placeholder,
  value,
  setValue,
}: {
  stations: Awaited<ReturnType<typeof getStations>>;
  placeholder: string;
  value:
    | SingleValueType<{ label: string; value: string; lines: Line[] }>
    | undefined;
  setValue: (
    value:
      | SingleValueType<{ label: string; value: string; lines: Line[] }>
      | undefined,
  ) => void;
}) {
  return (
    <Select
      isClearable={true}
      value={value}
      onChange={(option) =>
        setValue(
          option as SingleValueType<{
            label: string;
            value: string;
            lines: Line[];
          }>,
        )
      }
      className="w-1/2"
      placeholder={placeholder}
      options={stations.map((s) => ({
        value: s.code,
        label: s.name,
        lines: s.platforms
          .flatMap((p) => p.stops.map((st) => st.line))
          .filter((value, index, self) => self.indexOf(value) === index),
      }))}
      components={{ Option, SingleValue }}
      styles={{
        control: (styles) => ({
          ...styles,
          backgroundColor: "#17171780",
          borderColor: "#404040",
        }),
        singleValue: (styles) => ({
          ...styles,
          color: "#fafafa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }),
        menu: (styles) => ({
          ...styles,
          backgroundColor: "#171717",
        }),
        option: (styles, state) => ({
          ...styles,
          backgroundColor: state.isFocused ? "#404040" : "#171717",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }),
        input: (styles) => ({ ...styles, color: "#d4d4d4" }),
      }}
    />
  );
}
