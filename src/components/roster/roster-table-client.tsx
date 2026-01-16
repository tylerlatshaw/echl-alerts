"use client";

import { DataTable } from "./data-table";
import { makeColumns, type RosterRow } from "./columns";
import type { Roster } from "@/app/lib/types";

type Props = {
    players: Roster["data"]["tableData"]["edges"];
    teamColor: string;
};

export default function RosterTableClient({ players, teamColor }: Props) {
    if (!players || players.length === 0) {
        return <p className="mt-2 text-lg text-gray-300">No roster data found.</p>;
    }

    return (
        <div className="mt-8 overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
                <DataTable<RosterRow, unknown> columns={makeColumns(teamColor)} data={players} />
            </div>
        </div>
    );
}
