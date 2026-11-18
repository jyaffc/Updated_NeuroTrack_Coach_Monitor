import { AthleteDetailRoute } from "@/components/neurotrack/data-routes";
import { getAthleteDetailBundle } from "@/lib/neurotrack-data";

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  // Demo data is built on the server; uploaded sessions are read in the browser,
  // so an unknown ID here may still match an uploaded athlete
  const demoDetail = getAthleteDetailBundle(playerId);

  return <AthleteDetailRoute playerId={playerId} demoDetail={demoDetail} />;
}
