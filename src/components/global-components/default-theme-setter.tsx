"use client";

import { useLayoutEffect } from "react";
import { useTeamTheme } from "../../app/providers/team-theme-provider";

export default function DefaultThemeSetter() {
    const { setTeamColor, setTeamLogo, setTeamName, setTeamUrl } = useTeamTheme();

    useLayoutEffect(() => {
        setTeamColor("#8349ff");
        setTeamLogo("/reading-royals-logo.svg");
        setTeamName("Reading Royals");
        setTeamUrl("https://royalshockey.com");
    }, [setTeamColor, setTeamLogo, setTeamName, setTeamUrl]);

    return null;
}