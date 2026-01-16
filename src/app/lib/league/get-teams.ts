import "server-only";
import type { LeagueData, LeagueResponse } from "@/app/lib/types";

const ENDPOINT = "https://gql.eliteprospects.com/";
const REVALIDATE_SECONDS = 86400; // 24 hours

export async function getTeams(): Promise<LeagueData> {
    const query = {
        operationName: "LeagueRosters",
        variables: { visitorCountry: "US" },
        query: `query LeagueRosters($visitorCountry: String) {
            leagueRosters(visitorCountry: $visitorCountry) {
            league {
                slug
                commonName
                fullName
                logo { url colors }
                links { eliteprospectsUrl officialWebUrl statsUrl newsUrls }
            }
            teams {
                id
                name
                logo { small medium large colors }
                founded
                city
                country { slug name iso_3166_1_alpha_2 }
                activeSeason { slug startYear endYear }
                arena { id name location yearOfConstruction capacity infoAsHTML }
                secondaryArena { id name location yearOfConstruction capacity infoAsHTML }
                capHit
                links { officialWebUrl }
                slug
                eliteprospectsUrlPath
            }
            }
        }`,
    };

    // Optional: timeout so the page doesn't hang forever
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    try {
        const res = await fetch(ENDPOINT, {
            method: "POST",
            next: { revalidate: REVALIDATE_SECONDS },
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query),
            signal: controller.signal,
        });

        if (!res.ok) {
            const bodyText = await res.text().catch(() => "");
            throw new Error(
                `EliteProspects API error ${res.status} ${res.statusText}${bodyText ? ` - ${bodyText.slice(0, 200)}` : ""}`
            );
        }

        const json = (await res.json()) as LeagueResponse;

        const echl = json.data?.leagueRosters?.find((l) => l.league?.slug === "echl");
        if (!echl) {
            throw new Error("ECHL league not found in EliteProspects response");
        }

        const teamsSorted = [...(echl.teams ?? [])].sort((a, b) => a.name.localeCompare(b.name));

        return {
            data: {
                league: echl.league,
                teams: teamsSorted,
            },
        };
    } catch (e) {
        console.error("Error getting league data:", e);
        return {
            data: {
                league: {
                    slug: "echl",
                    commonName: "ECHL",
                    fullName: "ECHL",
                    logo: { url: "", colors: [] },
                    links: { eliteprospectsUrl: "", officialWebUrl: "", statsUrl: "", newsUrls: [] },
                },
                teams: [],
            },
        };
    } finally {
        clearTimeout(timeout);
    }
}