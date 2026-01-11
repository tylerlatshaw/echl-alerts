import RosterTable from "../../../components/roster/roster-container";
import TeamColorSetter from "../../../components/roster/team-color-setter";
import ViewMoreButton from "../../../components/roster/view-more-button";
import { resolveTeamColor } from "../../lib/team-color-map";
import { Team } from "../../lib/types";

async function getTeamData(teamSlug: string) {
  const params = new URLSearchParams({ team: teamSlug });

  const base = process.env.NEXT_PUBLIC_BASE_URL;

  const url = `${base}/api/league/get-team-data?${params.toString()}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function Page({ params }: { params: Promise<{ team: string }> }) {

  const { team } = await params;

  if (!team) {
    return (
      <div className="p-6 text-red-500 text-lg font-bold">
        Missing team parameter. Try <code>/roster/reading-royals</code>
      </div>
    );
  }

  const data: { team: Team } = await getTeamData(team);

  if (!data || !data.team)
    return (
      <div className="p-6 text-red-500 text-lg font-bold">
        Invalid team name
      </div>
    );

  const teamData = data.team;
  const teamColor = resolveTeamColor(teamData.slug, teamData.logo?.colors![0] || null);

  return (
    <>
      <TeamColorSetter
        color={teamColor}
        logo={teamData.logo?.large || "/reading-royals-logo.svg"}
        name={teamData.name}
        url={teamData.links?.officialWebUrl || "https://royalshockey.com"}
      />
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{teamData.name}</h1>

          <ViewMoreButton />
        </div>

        <RosterTable teamData={teamData} teamColor={teamColor} />
      </div>
    </>
  );
}