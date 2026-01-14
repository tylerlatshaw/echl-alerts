"use client";

import { useEffect, useState } from "react";
import RosterTable from "./../../../../components/roster/roster-container";
import TeamColorSetter from "./../../../../components/roster/team-color-setter";
import ViewMoreButton from "./../../../../components/roster/view-more-button";
import { resolveTeamColor } from "./../../../lib/team-color-map";
import type { Team } from "./../../../lib/types";

type Props = {
  params: Promise<{ team: string }>;
};

export default function Page({ params }: Props) {
  const [teamSlug, setTeamSlug] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { team } = await params;
        if (cancelled) return;

        if (!team) {
          setError("Missing team parameter");
          setLoading(false);
          return;
        }

        setTeamSlug(team);
      } catch (e) {
        console.error("Error resolving params:", e);
        setError("Unable to resolve route params");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!teamSlug) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/league/get-team-data?team=${encodeURIComponent(teamSlug)}`,
          { cache: "no-store", signal: controller.signal }
        );

        const contentType = res.headers.get("content-type") ?? "";

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
        }

        // Guard against Cloudflare/HTML responses
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Expected JSON but got ${contentType}. Body starts: ${text.slice(0, 200)}`
          );
        }

        const json: { team?: Team } = await res.json();
        if (!json.team) throw new Error("Invalid team name");

        setTeamData(json.team);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;

        const msg = e instanceof Error ? e.message : "Unable to load team data";
        console.error("Error loading team:", e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [teamSlug]);

  if (loading) return <p className="p-6 text-gray-400 text-lg">Loading…</p>;

  if (error) {
    return (
      <div className="p-6 text-red-500 text-lg font-bold">
        {error}
      </div>
    );
  }

  if (!teamData) {
    return <p className="p-6 text-gray-400">No team data returned.</p>;
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
