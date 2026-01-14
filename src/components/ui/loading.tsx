function Loading() {
    return (<>
        <div className="absolute top-0 left-0 w-screen h-screen z-40 flex flex-col items-center justify-center gap-6">
            <div className="border-purple-300 h-16 w-16 animate-spin rounded-full border-8 border-t-purple-800" />
            <span className="text-2xl font-bold">Loading...</span>
        </div>
    </>);
}

export { Loading };
