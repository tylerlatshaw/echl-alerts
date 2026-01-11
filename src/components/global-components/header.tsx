import Image from "next/image";
import HeaderLinks from "./header-links";
import TeamHeaderLogo from "./team-header-logo";

export default function Header() {
    return <>
        <header className="sticky top-0 z-50 h-24 border-b border-white/20 bg-gray-900/80 p-4 backdrop-blur">
            <div className="grid grid-cols-3 mx-auto w-full lg:max-w-7xl">

                <div className="flex items-center divide-x-2 divide-white/20 place-self-center justify-self-start">
                    <a href="https://echl.com/transactions" target="_blank" rel="noreferrer">
                        <Image src="/echl-logo.svg"
                            alt="ECHL Logo"
                            width={56}
                            height={56}
                            className="h-14 w-auto cursor-pointer px-4 drop-shadow-[0_0_8px_rgb(255,255,255,0.3)] hover:drop-shadow-[0_0_8px_rgb(255,255,255,0.5)]"
                        />
                    </a>
                    
                    <TeamHeaderLogo />
                </div>

                <HeaderLinks />
            </div>
        </header>
    </>;
}