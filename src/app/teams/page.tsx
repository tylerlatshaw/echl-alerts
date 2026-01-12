"use client";

import { useEffect, useState } from "react";
import DefaultThemeSetter from "../../components/global-components/default-theme-setter";
import TeamList from "../../components/teams/team-list";
import { League, Team } from "../lib/types";

type LeagueData = {
  league: League,
  teams: Team[]
};

export default function Page() {
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function getTeamData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/league/get-league-data", {
          cache: "no-store",
        });

        const contentType = res.headers.get("content-type") ?? "";

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
        }

        // Guard against Cloudflare HTML
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Expected JSON but got ${contentType}. Body starts: ${text.slice(0, 200)}`
          );
        }

        const json: LeagueData = await res.json();

        if (!cancelled) setData(json);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("Error getting league data:", e);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getTeamData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <DefaultThemeSetter />
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {data?.league?.fullName || "ECHL"} Teams
          </h1>
        </div>

        {loading && <p className="mt-4 text-gray-400">Loading…</p>}

        {error && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && data && <TeamList leagueData={data} />}

        {!loading && !error && !data && (
          <p className="mt-4 text-gray-400">No league data returned.</p>
        )}
      </div>
    </>
  );
}
