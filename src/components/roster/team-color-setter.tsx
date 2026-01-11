"use client";

import { useLayoutEffect } from "react";
import { useTeamTheme } from "../../app/providers/team-theme-provider";

export default function TeamColorSetter({ color, logo, name, url }: { color: string, logo: string, name: string, url: string }) {
    const { setTeamColor, setTeamLogo, setTeamName, setTeamUrl } = useTeamTheme();

    useLayoutEffect(() => {
        if (color) setTeamColor(color);
        if (logo) setTeamLogo(logo);
        if (name) setTeamName(name);
        if (url) setTeamUrl(url);
    }, [color, logo, name, url, setTeamColor, setTeamLogo, setTeamName, setTeamUrl]);

    return null;
}