import RosterTable from "@/components/roster/roster-container";
import TeamColorSetter from "@/components/roster/team-color-setter";
import ViewMoreButton from "@/components/roster/view-more-button";
import { resolveTeamColor } from "@/app/lib/team-color-map";
import type { Team } from "@/app/lib/types";
import { getTeamData } from "@/app/lib/league/get-team-data";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { team } = await params;

  const teamData = await getTeamData(team);

  if (!teamData) {
    return {
      title: "Roster",
      description: "ECHL team roster.",
    };
  }

  const title = `${teamData.name} Roster`;
  const description = `Current ${teamData.name} roster, player stats, and team information.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: teamData.logo?.large || "/og-default.png",
          width: 1200,
          height: 630,
          alt: teamData.name,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [teamData.logo?.large || "/og-default.png"],
    },
  };
}

type Props = {
  params: Promise<{ team: string }>;
};

export default async function Page({ params }: Props) {
  const { team: teamSlug } = await params;

  if (!teamSlug) {
    return <div className="p-6 text-red-500 text-lg font-bold">Missing team parameter</div>;
  }

  const teamData: Team | null = await getTeamData(teamSlug);

  if (!teamData) {
    return <div className="p-6 text-red-500 text-lg font-bold">Invalid team name</div>;
  }

  const teamColor = resolveTeamColor(
    teamData.slug,
    teamData.logo?.colors?.[0] ?? null
  );

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