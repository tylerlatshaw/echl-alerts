import { useState } from "react";
import Image from "next/image";
import { Player } from "../../app/lib/types";

export default function PlayerAvatar({ player }: { player: Player }) {
    const fallbackSrc = "/images/default-player.png";

    const [src, setSrc] = useState(player.imageUrl ?? fallbackSrc);

    return (
        <div className="relative size-8 shrink-0 overflow-hidden rounded-full drop-shadow-md">
            <Image
                src={src}
                alt={player.name}
                fill
                sizes="64px"
                className="object-cover object-center"
                onError={() => {
                    if (src !== fallbackSrc) {
                        setSrc(fallbackSrc);
                    }
                }}
            />
        </div>
    );
}