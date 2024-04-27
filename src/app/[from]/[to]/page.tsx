import JourneyPage from "@/components/JourneyPage";
import { getJourneys, getStation } from "@/utils/data";

export default async function Journeys({
  params,
}: {
  params: { from: string; to: string };
}) {
  const from = await getStation(params.from),
    to = await getStation(params.to),
    stops = await getJourneys(from.id, to.id);
  return <JourneyPage from={from} to={to} stops={stops} />;
}
