import DefaultThemeSetter from "../../components/global-components/default-theme-setter";
import TeamList from "../../components/teams/team-list";

async function getTeamData() {

  const base = process.env.NEXT_PUBLIC_BASE_URL;

  const url = `${base}/api/league/get-league-data`;

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
          <span className="text-semibold font-semibold border border-red-300 bg-red-900/60 text-red-300 px-4 py-2 rounded-[4px]">
            You are missing a team selection. Please select a team from the list below.
          </span>
        </div>
        <TeamList leagueData={data} />
      </div>
    </>
  );
}
