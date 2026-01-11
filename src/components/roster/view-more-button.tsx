"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { getReadableTextColor } from "../../app/lib/accessible-color";
import { useTeamTheme } from "../../app/providers/team-theme-provider";

export default function ViewMoreButton() {
    const { teamColor } = useTeamTheme();
    const [isHovered, setIsHovered] = useState(false);
    const hoverTextColor = getReadableTextColor(teamColor);

    return (
        <Button
            asChild
            className="py-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                href="/teams"
                style={{
                    backgroundColor: isHovered ? teamColor : "#ffffff33",
                    color: isHovered ? hoverTextColor : "white",
                }}

            >
                View Additional Teams <ArrowRight className="ml-2" />
            </Link>
        </Button>
    );
}