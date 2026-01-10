import dayjs from "dayjs";

export default function Footer() {
    return <>
        <footer className="w-full p-6 mx-auto max-w-3xl text-center text-xs text-slate-300/80">
            &copy; {dayjs().year()} Tyler J. Latshaw. All rights reserved.
            All trademarks, logos, and brandnames are the property of their
            respective owners. The ECHL wordmark, the ECHL logo, team names,
            and all team logos are trademarks and/or copyrighted works of
            their respective owners. This fan site is an independent,
            unofficial site and is not affiliated with, endorsed by, nor
            sponsored by the ECHL or any ECHL team.
        </footer>
    </>;
}