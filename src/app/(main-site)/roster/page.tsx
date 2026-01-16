import { getTeams } from "@/app/lib/league/get-teams";
import DefaultThemeSetter from "./../../../components/global-components/default-theme-setter";
import TeamList from "./../../../components/teams/team-list";

export default async function Page() {

  const leagueData = await getTeams();

  return (
    <>
      <DefaultThemeSetter />

      <div className="mx-auto w-full">
        <div className="flex items-center justify-center w-full">
          <span className="text-semibold font-semibold border border-red-300 bg-red-900/60 text-red-300 px-4 py-2 rounded">
            You are missing a team selection. Please select a team from the list below.
          </span>
        </div>

        <TeamList leagueData={leagueData} />
      </div>
    </>
  );
}
