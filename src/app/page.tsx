import StationForm from "@/components/StationForm";
import { getStations } from "@/utils/data";

export const revalidate = 86400; // 1 day, could even be more.

export default async function Home() {
  const stations = await getStations();
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="max-w-full w-96 flex flex-col gap-2">
        <h1 className="font-semibold text-3xl">Metro</h1>
        <h2 className="font-medium text-sm text-neutral-400 pb-2">
          An unofficial Tyne & Wear Metro timetable
        </h2>
        <StationForm stations={stations} />
        <div className="flex justify-center w-full absolute bottom-8 left-0">
          <a
            href="https://transit.fyi/"
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            target="_blank"
          >
            A <span className="font-semibold">Transit.fyi</span> project
          </a>
        </div>
      </div>
    </div>
  );
}
