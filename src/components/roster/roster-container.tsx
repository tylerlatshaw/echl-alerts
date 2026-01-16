import dayjs from "dayjs";
import type { Team, Roster } from "@/app/lib/types";
import { getRoster } from "@/app/lib/league/get-roster";
import RosterTableClient from "./roster-table-client";

type RosterEdge = Roster["data"]["tableData"]["edges"][number];

type Props = {
    teamData: Team;
    teamColor: string;
};

const positionRank: Record<string, number> = { F: 0, D: 1, G: 2 };

export default async function RosterTable({ teamData, teamColor }: Props) {
    const season =
        teamData.activeSeason?.slug ??
        `${dayjs().format("YYYY")}-${dayjs().add(1, "year").format("YYYY")}`;

    let edges: RosterEdge[] = [];

    try {
        const roster = await getRoster(teamData.id, season);

        edges =
            (roster.data.tableData.edges ?? [])
                .filter((p: RosterEdge) => p.jerseyNumber != null)
                .slice()
                .sort((a: RosterEdge, b: RosterEdge) => {
                    const aRank = positionRank[a.player.position ?? "Z"] ?? 99;
                    const bRank = positionRank[b.player.position ?? "Z"] ?? 99;
                    if (aRank !== bRank) return aRank - bRank;
                    return (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999);
                }) ?? [];
    } catch (e) {
        console.error("Error getting roster:", e);
        edges = [];
    }

    return <RosterTableClient players={edges} teamColor={teamColor} />;
}
