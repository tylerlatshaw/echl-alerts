
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { League, Team } from "../../app/lib/types";

type Props = {
    leagueData: { league: League; teams: Team[]; };
};

export default function TeamList({ leagueData }: Props) {

    return (
        <div className="mt-8 overflow-hidden rounded-lg">
            <div className="overflow-x-auto p-4">

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {
                        leagueData.teams.map((team) => {
                            return <Button
                                key={team.id}
                                variant={"default"}
                                size={"default"}
                                className="flex flex-col min-h-54 items-center justify-center bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-[8px] p-4 text-white"
                                asChild={true}
                            >
                                <Link href={`/roster/${team.slug}`}>
                                    <div className="h-24 w-24 my-2 relative mx-auto">
                                        <Image
                                            src={team.logo?.large || team.logo?.medium || "/default-player-image.png"}
                                            alt={team.name}
                                            fill
                                            sizes="64px"
                                            className="object-contain drop-shadow-[0_0_24px_rgb(255,255,255,0.3)]"
                                        />
                                    </div>
                                    <span className="flex items-center justify-center h-[68px] text-xl font-bold mb-2 text-wrap">{team.name}</span>
                                </Link>
                            </Button>;
                        })
                    }
                </div>

            </div>
        </div>
    );
}