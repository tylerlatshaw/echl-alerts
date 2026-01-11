"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type TeamThemeContextValue = {
    teamColor: string;
    setTeamColor: (color: string) => void;
    teamLogo: string;
    setTeamLogo: (logo: string) => void;
    teamName: string;
    setTeamName: (name: string) => void;
    teamUrl: string;
    setTeamUrl: (url: string) => void;
};

const TeamThemeContext = createContext<TeamThemeContextValue | null>(null);

export function TeamThemeProvider({
    children,
    defaultColor = "#40007f",
    defaultLogo = "/reading-royals-logo.svg",
    defaultName = "Reading Royals",
    defaultUrl = "https://royalshockey.com",
}: {
    children: React.ReactNode;
    defaultColor?: string;
    defaultLogo?: string;
    defaultName?: string;
    defaultUrl?: string;
}) {
    const [teamColor, setTeamColor] = useState(defaultColor);
    const [teamLogo, setTeamLogo] = useState(defaultLogo);
    const [teamName, setTeamName] = useState(defaultName);
    const [teamUrl, setTeamUrl] = useState(defaultUrl);

    const value = useMemo(
        () => ({ teamColor, setTeamColor, teamLogo, setTeamLogo, teamName, setTeamName, teamUrl, setTeamUrl }),
        [teamColor, teamLogo, teamName, teamUrl]
    );

    return (
        <TeamThemeContext.Provider value={value}>
            {children}
        </TeamThemeContext.Provider>
    );
}

export function useTeamTheme() {
    const ctx = useContext(TeamThemeContext);
    if (!ctx) throw new Error("useTeamTheme must be used inside TeamThemeProvider");
    return ctx;
}