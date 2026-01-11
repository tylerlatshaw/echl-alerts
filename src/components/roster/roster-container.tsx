"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import dayjs from "dayjs";
import { makeColumns, RosterRow } from "./columns";
import { RosterResponse, Team } from "../../app/lib/types";

type RosterEdge = RosterResponse["data"]["tableData"]["edges"][number];

type Props = {
    teamData: Team;
    teamColor: string;
};

const positionRank: Record<string, number> = {
    F: 0,
    D: 1,
    G: 2,
};

export default function RosterTable({ teamData, teamColor }: Props) {

    const [players, setPlayers] = useState<RosterEdge[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function getData() {
            setLoading(true);
            try {
                const teamId = teamData.id;
                const season = teamData.activeSeason?.slug || dayjs().format("YYYY") + "-" + dayjs().add(1, "year").format("YYYY");

                const res = await fetch("/api/league/get-roster?team=" + encodeURIComponent(teamId) + "&season=" + season, {
                    cache: "no-store"
                });

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const json = await res.json();

                const unsortedData = json.data.tableData.edges.filter((p: RosterEdge) => p.jerseyNumber != null);

                const sortedData = unsortedData.sort((a: RosterEdge, b: RosterEdge) => {
                    const aRank = positionRank[a.player.position ?? "Z"] ?? 99;
                    const bRank = positionRank[b.player.position ?? "Z"] ?? 99;

                    if (aRank !== bRank) {
                        return aRank - bRank;
                    }

                    // same position > sort by jersey number
                    return (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999);
                });

                setPlayers(sortedData);
            } catch (e) {
                console.log("Error getting players: ", e);
            }

            setLoading(false);
        }

        getData();
    }, [teamData.id, teamData.activeSeason?.slug]);

    if (loading) return <p className="mt-2 text-lg text-gray-300">Loading…</p>;

    return (
        <>
            <div className="mt-8 overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <DataTable<RosterRow, unknown>
                        columns={makeColumns(teamColor)}
                        data={players}
                    />
                </div>
            </div>
        </>
    );
}