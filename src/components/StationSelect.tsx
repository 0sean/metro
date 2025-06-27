"use client";

import { Line, Station } from "@/utils/data";
import Select, {
  OptionProps,
  SingleValueProps,
  components,
  SingleValue as SingleValueType,
} from "react-select";

function Option(props: OptionProps<Station>) {
  return (
    <components.Option {...props}>
      {props.children}{" "}
      <div className="inline-flex gap-1 flex-col">
        {(props.data as Station).lines.map((l: Line) => (
          <div
            key={l}
            className={`w-2 h-2 rounded-full bg-gradient-to-b ${l == "GRN" ? "from-green-400/75 to-green-900/75 ring-1 ring-green-400/60 ring-inset" : "from-yellow-400/75 to-yellow-900/75 ring-1 ring-yellow-400/40 ring-inset"}`}
          ></div>
        ))}
      </div>
    </components.Option>
  );
}

function SingleValue(props: SingleValueProps<Station>) {
  return (
    <components.SingleValue {...props}>
      {props.children}{" "}
      <div className="inline-flex gap-1 flex-col">
        {props.data.lines.map((l: Line) => (
          <div
            key={l}
            className={`w-2 h-2 rounded-full bg-gradient-to-b ${l == "GRN" ? "from-green-400/75 to-green-900/75 ring-1 ring-green-400/60 ring-inset" : "from-yellow-400/75 to-yellow-900/75 ring-1 ring-yellow-400/40 ring-inset"}`}
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
  stations: Station[];
  placeholder: string;
  value: SingleValueType<Station> | undefined;
  setValue: (value: SingleValueType<Station> | undefined) => void;
}) {
  return (
    <Select
      isClearable={true}
      value={value}
      onChange={(option) => setValue(option as SingleValueType<Station>)}
      className="w-1/2"
      placeholder={placeholder}
      options={stations}
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
