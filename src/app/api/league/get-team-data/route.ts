/**
 * @swagger
 * /api/league/get-team-data:
 *   get:
 *     summary: Get team data
 *     tags:
 *       - League
 *     operationId: getTeamData
 *     parameters:
 *       - in: query
 *         name: team
 *         required: true
 *         schema:
 *           type: string
 *         description: Team slug (e.g. reading-royals)
 *     responses:
 *       200:
 *         description: Team data returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Unable to complete request
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import { LeagueResponse } from "../../../lib/types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const team = searchParams.get("team");

        if (!team) {
            return NextResponse.json(
                { error: "Missing team" },
                { status: 400 }
            );
        }

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

        const filteredTeam = echl[0].teams.find((t) => t.slug === team);

        return NextResponse.json({ team: filteredTeam }, { status: 200 });

    } catch (e: unknown) {
        console.error("ERROR:", e);
        return new NextResponse(String(e), {
            status: 500,
            headers: { "content-type": "text/plain; charset=utf-8" },
        });
    }
}