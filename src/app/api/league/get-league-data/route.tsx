import { NextRequest, NextResponse } from "next/server";
import { LeagueResponse } from "../../../lib/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
    try {
        const query = {
            "operationName": "LeagueRosters",
            "variables": {
                "visitorCountry": "US"
            },
            "query": `query LeagueRosters($visitorCountry: String) {
                leagueRosters(visitorCountry: $visitorCountry) {
                    league {
                        slug
                        commonName
                        fullName
                        logo {
                            url
                            colors
                        }
                        links {
                            eliteprospectsUrl
                            officialWebUrl
                            statsUrl
                            newsUrls
                        } 
                    } teams {
                        id
                        name
                        logo {
                            small
                            medium
                            large
                            colors
                        }
                        founded
                        city
                        country {
                            slug
                            name
                            iso_3166_1_alpha_2
                        }
                        activeSeason {
                            slug
                            startYear
                            endYear
                        }
                        arena {
                            id
                            name
                            location
                            yearOfConstruction
                            capacity
                            infoAsHTML
                        }
                        secondaryArena {
                            id
                            name
                            location
                            yearOfConstruction
                            capacity
                            infoAsHTML
                        }
                        capHit
                        links {
                            officialWebUrl
                        }
                        slug
                        eliteprospectsUrlPath
                    }
                }
            }`
        };

        const res = await fetch("https://gql.eliteprospects.com/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(query),
        });

        const json: LeagueResponse = await res.json();

        if (!res.ok) {
            throw new Error(`Elite Prospects API responded with status ${res.status}`);
        }

        const echl = json.data.leagueRosters.filter((l) => {
            return l.league.slug === "echl";
        });

        const teamsSorted = echl[0].teams.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        return NextResponse.json({ data: { league: echl[0].league, teams: teamsSorted } }, { status: 200 });

    } catch (e: unknown) {
        console.error("ERROR:", e);
        return new NextResponse(String(e), {
            status: 500,
            headers: { "content-type": "text/plain; charset=utf-8" },
        });
    }
}