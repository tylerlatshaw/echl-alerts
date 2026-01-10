import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import removeAccents from "remove-accents";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { resolvePlayerImage } from "../../app/lib/player-image-map";
import { Player } from "../../app/lib/types";
import { Button } from "../ui/button";

export type RosterRow = {
    player: Player;
    jerseyNumber: number | null;
};

function formatHeight(imperial?: string | null) {
    if (!imperial) return "—";

    // Normalize separators (handles 5'11, 5-11, 5′11)
    const match = imperial.match(/(\d+)\D+(\d+)/);
    if (!match) return imperial;

    const [, feet, inches] = match;
    return `${feet}' ${inches}"`;
}

function formatDob(dob?: string | null) {
    if (!dob) return "—";
    const [y, m, d] = dob.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function parseBirthplace(place: string | null) {
    if (!place) return { country: "", region: "", city: "" };

    const parts = place.split(",").map((p) => p.trim()).filter(Boolean);

    const city = parts[0] ?? "";
    const country = parts.length >= 2 ? (parts[parts.length - 1] ?? "") : "";
    const region = parts.length > 2 ? parts.slice(1, -1).join(", ") : (parts[1] ?? "");

    return { city, region, country };
}

export function makeColumns(teamColor: string): ColumnDef<RosterRow, unknown>[] {
    return [
        {
            id: "jerseyNumber",
            accessorFn: (row) => row.jerseyNumber ?? -1,
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="ml-3 text-center cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    #
                </Button>
            ),
            cell: ({ row }) => {
                const { jerseyNumber } = row.original;
                return (
                    jerseyNumber != null && (
                        <div className="flex items-center justify-center h-12 w-12 bg-white/5 rounded-full">
                            <span
                                className={"text-xl font-semibold"}
                                style={{ "color": teamColor }}
                            >{jerseyNumber}</span>
                        </div>
                    )
                );
            },
        },
        {
            id: "player",
            accessorFn: (row) => removeAccents(row.player.name),
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Player
                </Button>
            ),
            cell: ({ row }) => {
                const { player } = row.original;
                const src = resolvePlayerImage(player.name, player.imageUrl);

                return (
                    <div className="flex flex-row items-center gap-4">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-full drop-shadow-md drop-shadow-gay-500/50">
                            <Image
                                src={src}
                                alt={player.name}
                                fill
                                sizes="64px"
                                className="object-cover object-center"
                            />
                        </div>

                        <span className="font-bold">{player.name}</span>
                        <div className="relative size-8 overflow-hidden">
                            {player.nhlRights &&
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Image
                                            src={player.nhlRights?.team.logo?.small ?? ""}
                                            alt={player.nhlRights?.team.name ?? ""}
                                            fill
                                            sizes="64px"
                                            className="object-contain obqject-center"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        sideOffset={12}
                                    >
                                        <span>NHL Rights: {player.nhlRights.team.name} ({player.nhlRights.rights})</span>
                                    </TooltipContent>
                                </Tooltip>
                            }
                        </div>
                    </div>
                );
            },
        },
        {
            id: "position",
            accessorFn: (row) => row.player.position ?? "Z", // nulls sort last
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span className="hidden md:inline">Position</span>
                    <span className="inline md:hidden">POS</span>
                </Button>
            ),
            cell: ({ row }) => row.original.player.position ?? "—",
        },

        {
            id: "height",
            // Sort by inches if possible (e.g. "6'2\"" -> 74)
            accessorFn: (row) => {
                const h = row.player.height?.imperial;
                if (!h) return -1;
                const m = h.match(/(\d+)\D+(\d+)/);
                if (!m) return -1;
                const feet = Number(m[1]);
                const inches = Number(m[2]);
                return feet * 12 + inches;
            },
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span className="hidden md:inline">Height</span>
                    <span className="inline md:hidden">H</span>
                </Button>
            ),
            cell: ({ row }) => formatHeight(row.original.player.height?.imperial),
        },
        {
            id: "weight",
            accessorFn: (row) => row.player.weight?.imperial ?? -1,
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span className="hidden md:inline">Weight</span>
                    <span className="inline md:hidden">W</span>
                </Button>
            ),
            cell: ({ row }) => {
                const wt = row.original.player.weight?.imperial;
                return wt ? `${wt} lbs.` : "—";
            },
        },
        {
            id: "dob",
            accessorFn: (row) => row.player.dateOfBirth ?? "9999-12-31",
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span className="hidden md:inline">Date of Birth</span>
                    <span className="inline md:hidden">DOB</span>
                </Button>
            ),
            cell: ({ row }) => {
                return <span>
                    {formatDob(row.original.player.dateOfBirth)} - ({row.original.player.age ?? ""})
                </span>;
            }
        },
        {
            id: "birthplace",
            accessorFn: (row) => {
                const place = removeAccents(row.player.placeOfBirth || "");
                if (!place) return "-"; // sorts last

                const { country, city, region } = parseBirthplace(row.player.placeOfBirth);
                return `${country}|||${city}|||${region}`;
            },
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span className="hidden md:inline">Birthplace</span>
                    <span className="inline md:hidden">BP</span>
                </Button>
            ),
            cell: ({ row }) => {
                if (!row.original.player.nationality) return "—";

                const { nationality, placeOfBirth } = row.original.player;

                return (
                    <div className="flex flex-row items-center gap-2">
                        <div className="relative size-8 shrink-0 overflow-hidden rounded-full drop-shadow-md drop-shadow-gay-500/50">
                            <Image
                                src={`https://flagsapi.com/${nationality.iso_3166_1_alpha_2}/flat/64.png`}
                                alt={nationality.name}
                                fill
                                sizes="64px"
                                className="object-cover object-center"
                                style={{ transform: "scale(1.6)" }}
                            />
                        </div>
                        <span>{placeOfBirth ?? "—"}</span>
                    </div>
                );
            }
        }
    ];
}
