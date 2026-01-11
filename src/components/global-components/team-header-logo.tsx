"use client";

import Image from "next/image";
import { useTeamTheme } from "../../app/providers/team-theme-provider";

export default function TeamHeaderLogo() {
    const { teamLogo, teamName, teamUrl } = useTeamTheme();

    return (
        <>
            <a href={teamUrl} target="_blank" rel="noreferrer">
                <Image
                    src={teamLogo}
                    alt={`${teamName} Logo`}
                    width={64}
                    height={64}
                    className="h-16 w-auto cursor-pointer px-4 drop-shadow-[0_0_8px_rgb(255,255,255,0.3)] hover:drop-shadow-[0_0_8px_rgb(255,255,255,0.5)]"
                />
            </a>
        </>
    );
}