import DefaultThemeSetter from "../../components/global-components/default-theme-setter";
import TeamList from "../../components/teams/team-list";

async function getTeamData() {

  const base = process.env.NEXT_PUBLIC_BASE_URL;

  const url = `${base}/api/get-league-data`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function Page() {
  const data = await getTeamData();

  return (
    <>
      <DefaultThemeSetter />
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{data.league.fullName || "ECHL"} Teams</h1>
        </div>
        <TeamList leagueData={data} />
      </div>
    </>
  );
}
