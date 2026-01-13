"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { LeagueData } from "../../app/lib/types";
import { useState, useEffect } from "react";
import { Loading } from "../ui/loading";

export default function TeamList() {

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
            {loading && <Loading />}

            {error && (
                <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/40 p-4 text-red-300">
                    {error}
                </div>
            )}

            {!loading && !error && data &&
                <div className="mt-8 overflow-hidden rounded-lg">
                    <div className="overflow-x-auto p-4">

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {
                                data?.data.teams.map((team) => {
                                    return <Button
                                        key={team.id}
                                        variant={"default"}
                                        size={"default"}
                                        className="flex flex-col min-h-54 items-center justify-center bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg p-4 text-white"
                                        asChild={true}
                                    >
                                        <Link href={`/roster/${team.slug}`}>
                                            <div className="h-24 w-24 my-2 relative mx-auto">
                                                <Image
                                                    src={team.logo?.large || team.logo?.medium || "/default-player-image.png"}
                                                    alt={team.name}
                                                    fill
                                                    sizes="64px"
                                                    className="object-contain drop-shadow-[0_0_24px_rgb(255,255,255,0.3)]"
                                                />
                                            </div>
                                            <span className="flex items-center justify-center h-[68px] text-xl font-bold mb-2 text-wrap">{team.name}</span>
                                        </Link>
                                    </Button>;
                                })
                            }
                        </div>

                    </div>
                </div>
            }

            {!loading && !error && !data && (
                <p className="mt-4 text-gray-400">No league data returned.</p>
            )}
        </>
    );
}