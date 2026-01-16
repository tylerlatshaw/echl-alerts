export default function Loading() {
    return (
        <div className="mx-auto w-full">
            {/* Team header */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-56 rounded bg-white/10 animate-pulse" />
                <div className="h-10 w-32 rounded bg-white/10 animate-pulse" />
            </div>

            {/* Roster table */}
            <div className="mt-8 overflow-hidden rounded-lg border border-white/10">
                <div className="overflow-x-auto">
                    <div className="min-w-[900px] bg-[#1a1a1a]">
                        {/* Table header */}
                        <div className="grid grid-cols-7 gap-4 bg-white/5 px-4 py-3">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 w-24 rounded bg-white/10 animate-pulse"
                                />
                            ))}
                        </div>

                        {/* Table rows */}
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-7 gap-4 px-4 py-4 border-t border-white/10"
                            >
                                {Array.from({ length: 7 }).map((__, j) => (
                                    <div
                                        key={j}
                                        className="h-4 w-full rounded bg-white/10 animate-pulse"
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
