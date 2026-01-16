export default function Loading() {
    return (
        <div className="mx-auto w-full">
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 rounded bg-white/10 animate-pulse" />
            </div>

            <div className="mt-8 overflow-hidden rounded-lg">
                <div className="overflow-x-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center justify-center bg-[#1a1a1a] rounded-lg p-4"
                            >
                                {/* logo */}
                                <div className="h-24 w-24 rounded bg-white/10 animate-pulse my-2" />

                                {/* name */}
                                <div className="h-5 w-32 rounded bg-white/10 animate-pulse mt-2" />
                                <div className="h-5 w-24 rounded bg-white/10 animate-pulse mt-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}