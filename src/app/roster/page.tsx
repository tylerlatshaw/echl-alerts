"use client";

import { useEffect, useState } from "react";
import DefaultThemeSetter from "../../components/global-components/default-theme-setter";
import TeamList from "../../components/teams/team-list";

export default function Page() {
  const [data, setData] = useState(null); //TODO <type> this later
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
          throw new Error(
            `get-league-data failed (${res.status}): ${text.slice(0, 300)}`
          );
        }

        // Guard against HTML (Cloudflare "Just a moment..." etc.)
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Expected JSON but got ${contentType}. Body starts: ${text.slice(0, 200)}`
          );
        }

        const json = await res.json();

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
          <span className="text-semibold font-semibold border border-red-300 bg-red-900/60 text-red-300 px-4 py-2 rounded-[4px]">
            You are missing a team selection. Please select a team from the list below.
          </span>
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
