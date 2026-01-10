import { NextRequest, NextResponse } from "next/server";
import { RosterResponse } from "../../../lib/types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const team = searchParams.get("team");
        const season = searchParams.get("season");

        if (!team || !season) {
            return NextResponse.json(
                { error: "Missing team or season" },
                { status: 400 }
            );
        }

        const query = {
            "operationName": "Roster",
            "variables": {
                "team": team,
                "season": season,
                "sort": "player"
            },
            "query": `query Roster(
                $team: ID!, 
                $season: String, 
                $sort: String
            ) { tableData: teamRoster(id: $team, season: $season, sort: $sort) {
                edges {
                    player {
                        id
                        firstName
                        lastName
                        name
                        status
                        position
                        shoots
                        catches
                        dateOfBirth
                        age
                        placeOfBirth
                        nationality {
                            name
                            flagUrl {
                                small
                                medium
                            }
                            iso_3166_1_alpha_2
                        }
                            weight {
                            imperial
                        }
                            height {
                            imperial
                        }
                        gameStatus
                            nhlRights {
                            team {
                                logo {
                                    small
                                    medium
                                }
                                name
                            }
                            rights
                        }
                        imageUrl
                        imageCopyright
                        eliteprospectsUrlPath
                    } jerseyNumber
                }
            } footerData: teamSeasonComparison(id: $team, season: $season) {
                edges {
                    playersByPositions {
                        position
                        players
                    } averageHeight { imperial }
                    averageWeight { imperial }
                    averageAge
                }
            }}`
        };

        const res = await fetch("https://gql.eliteprospects.com/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(query),
        });

        const json: { data: RosterResponse } = await res.json();

        if (!res.ok) {
            throw new Error(`Elite Prospects API responded with status ${res.status}`);
        }

        return NextResponse.json({ data: json.data }, { status: 200 });

    } catch (e: unknown) {
        console.error("ERROR:", e);
        return new NextResponse(String(e), {
            status: 500,
            headers: { "content-type": "text/plain; charset=utf-8" },
        });
    }
}