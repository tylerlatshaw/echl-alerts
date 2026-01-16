import "server-only";
import type { Team } from "@/app/lib/types";
import { getTeams } from "./get-teams";

export async function getTeamData(teamSlug: string): Promise<Team | null> {
    if (!teamSlug || typeof teamSlug !== "string") return null;

    const json = await getTeams();

    return json.data.teams?.find((t) => t.slug === teamSlug) ?? null;
}