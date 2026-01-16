import "server-only";

const ENDPOINT = "https://gql.eliteprospects.com/";

export async function getRoster(teamId: string, season: string) {
    const query = {
        operationName: "Roster",
        variables: {
            team: teamId,
            season,
            sort: "player",
        },
        query: `query Roster($team: ID!, $season: String, $sort: String) {
      tableData: teamRoster(id: $team, season: $season, sort: $sort) {
        edges {
          player {
            id
            firstName
            lastName
            name
            status
            position
            shoots
            catches
            dateOfBirth
            age
            placeOfBirth
            nationality {
              name
              flagUrl { small medium }
              iso_3166_1_alpha_2
            }
            weight { imperial }
            height { imperial }
            gameStatus
            nhlRights {
              team { logo { small medium } name }
              rights
            }
            imageUrl
            imageCopyright
            eliteprospectsUrlPath
          }
          jerseyNumber
        }
      }
      footerData: teamSeasonComparison(id: $team, season: $season) {
        edges {
          playersByPositions { position players }
          averageHeight { imperial }
          averageWeight { imperial }
          averageAge
        }
      }
    }`,
    };

    const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
        next: { revalidate: 300 }, // 5 minutes
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`EliteProspects roster error ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();

    if (!json.data) {
        throw new Error("EliteProspects roster response missing data");
    }

    return json;
}