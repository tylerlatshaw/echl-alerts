import { getTeams } from "./../../lib/league/get-teams";
import DefaultThemeSetter from "./../../../components/global-components/default-theme-setter";
import TeamList from "./../../../components/teams/team-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams",
  description:
    "Browse all ECHL teams, arenas, and links in one place.",
};

export default async function Page() {

  const leagueData = await getTeams();

  return (
    <>
      <DefaultThemeSetter />
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            ECHL Teams
          </h1>
        </div>

        <TeamList leagueData={leagueData} />
      </div>
    </>
  );
}
