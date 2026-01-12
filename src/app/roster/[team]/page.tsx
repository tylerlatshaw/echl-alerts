"use client";

import { useEffect, useState } from "react";
import RosterTable from "../../../components/roster/roster-container";
import TeamColorSetter from "../../../components/roster/team-color-setter";
import ViewMoreButton from "../../../components/roster/view-more-button";
import { resolveTeamColor } from "../../lib/team-color-map";
import { Team } from "../../lib/types";

type Props = {
  params: Promise<{ team: string }>;
};

export default function Page({ params }: Props) {
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { team } = await params;
        if (cancelled) return;

        if (!team) {
          setError("Missing team parameter");
          return;
        }

        const res = await fetch(
          `/api/league/get-team-data?team=${encodeURIComponent(team)}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(await res.text());

        const json: { team: Team } = await res.json();
        if (!json?.team) throw new Error("Invalid team name");

        setTeamData(json.team);
      } catch (e) {
        console.error("Error loading team:", e);
        setError("Unable to load team data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (loading) return <p className="p-6 text-gray-400 text-lg">Loading…</p>;

  if (error)
    return (
      <div className="p-6 text-red-500 text-lg font-bold">
        {error}
      </div>
    );

  if (!teamData) return null;

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