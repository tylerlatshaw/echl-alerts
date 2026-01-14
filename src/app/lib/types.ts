export type LeagueResponse = {
    data: {
        leagueRosters: {
            league: League,
            teams: Team[]
        }[]
    }
};

export type LeagueData = {
    data: {
        league: League,
        teams: Team[]
    }
};

export type League = {
    slug: string,
    commonName: string | null,
    fullName: string | null,
    logo: {
        url: string | null,
        colors: string[] | null
    } | null,
    links: {
        eliteprospectsUrl: string,
        officialWebUrl: string,
        statsUrl: string,
        newsUrls: string[]
    } | null
}

export type Team = {
    id: string,
    name: string,
    logo: {
        small: string,
        medium: string,
        large: string | null,
        colors: string[] | null,
    } | null,
    founded: number | null,
    city: string | null,
    country: {
        slug: string,
        name: string,
        iso_3166_1_alpha_2: string | null,
    } | null,
    activeSeason: {
        slug: string,
        startYear: number,
        endYear: number,
    } | null,
    arena: {
        id: string,
        name: string,
        location: string | null,
        yearOfConstruction: number | null,
        capacity: number | null,
        infoAsHTML: string | null,
    } | null,
    secondaryArena: {
        id: string,
        name: string,
        location: string | null,
        yearOfConstruction: number | null,
        capacity: number | null,
        infoAsHTML: string | null,
    } | null,
    capHit: string | null,
    links: {
        officialWebUrl: string | null
    } | null,
    slug: string,
    eliteprospectsUrlPath: string,
}

export type RosterResponse = {
    data: {
        tableData: {
            edges: {
                player: Player,
                jerseyNumber: number | null
            }[]
        },
        footerData: {
            edges: {
                playersByPositions: {
                    position: Position,
                    players: number
                }[],
                averageHeight: {
                    imperial: string
                },
                averageWeight: {
                    imperial: string
                },
                averageAge: string
            }[]
        }
    }
}


export type Player = {
    id: string,
    firstName: string | null,
    lastName: string | null,
    name: string,
    status: "active" | "retired" | "deceased",
    position: Position | null,
    shoots: "L" | "R" | null,
    catches: "L" | "R" | null,
    dateOfBirth: string | null,
    age: number | null,
    placeOfBirth: string | null,
    nationality: {
        name: string,
        iso_3166_1_alpha_2: string
    } | null,
    weight: {
        imperial: number
    } | null,
    height: {
        imperial: string
    } | null,
    gameStatus: "healthy" | "injured" | "suspended",
    nhlRights: {
        team: {
            logo: {
                small: string,
                medium: string,
            } | null,
            name: string,
        },
        rights: "signed" | "unsigned"
    } | null,
    imageUrl: string | null,
    imageCopyright: string | null,
    eliteprospectsUrlPath: string | null
}

export type Position = "G" | "D" | "F";

export type Transaction = {
    id: string,
    player: string,
    team: string,
    detail: string,
    date: string,
    seenAt: string
};

export type Subscription = {
    firstName: string,
    lastName: string,
    email: string,
};