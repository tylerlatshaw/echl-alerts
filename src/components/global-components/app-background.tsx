"use client";

import { useTeamTheme } from "../../app/providers/team-theme-provider";

export default function AppBackground() {
    const { teamColor } = useTeamTheme();

    return (
        <div
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{
                background: `
                    radial-gradient(
                    125% 125% at 50% 10%,
                    #000 50%,
                    ${teamColor} 100%
                    )
                `,
            }}
        />
    );
}