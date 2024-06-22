import StationForm from "@/components/StationForm";
import StationSelect from "@/components/StationSelect";
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
      </div>
    </div>
  );
}
