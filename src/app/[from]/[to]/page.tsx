import JourneyPage from "@/components/JourneyPage";
import { getJourneys } from "@/utils/data";

export default async function Journeys({
  params,
}: {
  params: { from: string; to: string };
}) {
  const journeys = await getJourneys(params.from, params.to);
  return <JourneyPage journeys={journeys} />;
}
