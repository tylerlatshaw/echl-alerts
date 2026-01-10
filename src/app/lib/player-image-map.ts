export const playerImageMap: Record<string, string> = {
    "Alec Butcher": "https://assets.leaguestat.com/echl/120x160/7905.jpg",
    "Artem Guryev": "https://assets.leaguestat.com/echl/120x160/10091.jpg",
    "Artyom Guryev": "https://assets.leaguestat.com/echl/120x160/10091.jpg",
    "Artem Kulakov": "https://assets.leaguestat.com/echl/120x160/9820.jpg",
    "Artyom Kulakov": "https://assets.leaguestat.com/echl/120x160/9820.jpg",
    "Ben Meehan": "https://assets.leaguestat.com/echl/120x160/11088.jpg",
    "Brandon Saigeon": "https://assets.leaguestat.com/echl/120x160/8284.jpg",
    "Cameron Cook": "https://assets.leaguestat.com/echl/120x160/9483.jpg",
    "Carson Golder": "https://assets.leaguestat.com/echl/120x160/10066.jpg",
    "Connor McMenamin": "https://assets.leaguestat.com/echl/120x160/10299.jpg",
    "Émile Chouinard": "https://assets.leaguestat.com/echl/120x160/10418.jpg",
    "Hunter Johannes": "https://assets.leaguestat.com/echl/120x160/10626.jpg",
    "Ian Shane": "https://assets.leaguestat.com/echl/120x160/10815.jpg",
    "Jack Page": "https://assets.leaguestat.com/echl/120x160/10978.jpg",
    "Jacob Frasca": "https://assets.leaguestat.com/echl/120x160/10482.jpg",
    "Jake Willets": "https://assets.leaguestat.com/echl/120x160/9785.jpg",
    "Jérémy Michel": "https://assets.leaguestat.com/echl/120x160/10976.jpg",
    "Jordan Frasca": "https://assets.leaguestat.com/echl/120x160/9636.jpg",
    "Keith Petruzzelli": "https://assets.leaguestat.com/echl/120x160/8910.jpg",
    "Kyle Haskins": "https://assets.leaguestat.com/echl/120x160/10718.jpg",
    "Liam Devlin": "https://assets.leaguestat.com/echl/120x160/10783.jpg",
    "Miles Gendron": "https://assets.leaguestat.com/echl/120x160/7980.jpg",
    "Nick Capone": "https://assets.leaguestat.com/echl/120x160/10478.jpg",
    "Nolan Burke": "https://assets.leaguestat.com/echl/120x160/10087.jpg",
    "Ty Voit": "https://assets.leaguestat.com/echl/120x160/10118.jpg",
    "Victor Hadfield": "https://assets.leaguestat.com/echl/120x160/8848.jpg",
    "Yaniv Perets": "https://assets.leaguestat.com/echl/120x160/10070.jpg",
    "Yvan Mongo": "https://assets.leaguestat.com/echl/120x160/9380.jpg",
};

export function resolvePlayerImage(
    name: string,
    remoteUrl?: string | null
) {
    return (
        playerImageMap[name] ??
        remoteUrl ??
        "/default-player-image.png"
    );
}