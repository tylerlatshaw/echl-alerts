"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { useState } from "react";
import { useTeamTheme } from "../../app/providers/team-theme-provider";
import { getReadableTextColor } from "../../app/lib/accessible-color";

export default function HeaderLinks() {
    const { teamColor } = useTeamTheme();
    const hoverTextColor = getReadableTextColor(teamColor);
    const [hovered, setHovered] = useState<"transaction" | "roster" | "subscribe" | null>(null);
    const team = "reading-royals";

    return (
        <>
            <Link
                href="/"
                className="text-2xl font-bold hidden md:block place-self-center"
                onMouseEnter={() => setHovered("transaction")}
                onMouseLeave={() => setHovered(null)}
                style={{
                    color: hovered === "transaction" ? teamColor : "white",
                }}
            >
                ECHL Alerts
            </Link>

            <nav className="flex gap-4 place-self-center justify-self-end">
                <Button
                    asChild
                    className="text-lg py-4 font-semibold"
                    onMouseEnter={() => setHovered("roster")}
                    onMouseLeave={() => setHovered(null)}
                >
                    <Link
                        href={`/roster/${team}`}
                        style={{
                            backgroundColor: hovered === "roster" ? teamColor : "#ffffff33",
                            color: hovered === "roster" ? hoverTextColor : "white",
                        }}
                    >
                        Roster
                    </Link>
                </Button>

                <Button
                    asChild
                    className="text-lg py-4 font-semibold"
                    onMouseEnter={() => setHovered("subscribe")}
                    onMouseLeave={() => setHovered(null)}
                >
                    <Link
                        href="/subscribe"
                        style={{
                            backgroundColor: hovered === "subscribe" ? teamColor : "#ffffff33",
                            color: hovered === "subscribe" ? hoverTextColor : "white",
                        }}
                    >
                        Subscribe
                    </Link>
                </Button>
            </nav>
        </>
    );
}