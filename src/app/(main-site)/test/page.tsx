"use client";

import { Button } from "@/components/ui/button";

export default function Page() {
    return (
        <>
            <div className="mx-auto w-full">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        Sentry Error Testing
                    </h1>
                </div>

                <p className="m-12">
                    This page intentionally throws a client-side error to verify Sentry
                    production reporting and sourcemaps.
                </p>

                <Button
                    variant={"default"}
                    size={"default"}
                    className="bg-red-800 px-4 py-5"
                    onClick={() => {
                        throw new Error("Sentry client-side smoke test (intentional)");
                    }}
                >
                    Trigger Client Error
                </Button>

            </div>
        </>
    );
}
