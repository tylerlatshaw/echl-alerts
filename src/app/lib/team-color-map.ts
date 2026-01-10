export const teamColorMap: Record<string, string> = {
    "adirondack-thunder": "#C8242F",
    "allen-americans": "#979899",
    "atlanta-gladiators": "#FDB619",
    "bloomington-bison": "#51C0E8",
    "cincinnati-cyclones": "#DE0E2C",
    "florida-everblades": "#00703C",
    "fort-wayne-komets": "#F47820",
    "greensboro-gargoyles": "#8f00e8",
    "greenville-swamp-rabbits": "#CF5E28",
    "idaho-steelheads": "#C1CCCC",
    "indy-fuel": "#CE102C",
    "iowa-heartlanders": "#A7A8A9",
    "jacksonville-icemen": "#A3A3BB",
    "kalamazoo-wings": "#E03A3E",
    "kansas-city-mavericks": "#F15F24",
    "maine-mariners": "#E3E3E3",
    "norfolk-admirals": "#FCC039",
    "orlando-solar-bears": "#FFD200",
    "rapid-city-rush": "#CD2036",
    "reading-royals": "#8349ff",
    "savannah-ghost-pirates": "#35D32F",
    "south-carolina-stingrays": "#C4112E",
    "tahoe-knight-monsters": "#007485",
    "toledo-walleye": "#FEC324",
    "trois-rivieres-lions": "#CFC8C8",
    "tulsa-oilers": "#7B212D",
    "utah-grizzlies": "#B1790C",
    "wheeling-nailers": "#FBB41B",
    "wichita-thunder": "#CEE5F6",
    "worcester-railers": "#A0A2A8",
};

export function resolveTeamColor(
    name: string,
    color?: string | null
) {
    return (
        teamColorMap[name] ??
        color ??
        ["#ffffff"]
    );
}