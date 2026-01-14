"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type { Transaction } from "../../app/lib/types";
import { Loading } from "../ui/loading";
import Image from "next/image";

const RECORD_LIMIT = 25;

export default function TransactionTable() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/league/tx-latest?limit=${RECORD_LIMIT}`, {
                    signal: controller.signal,
                    cache: "no-store",
                });

                if (!res.ok) throw new Error(await res.text());

                const json: { data: Transaction[] } = await res.json();
                setTransactions(json.data ?? []);
            } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") return;

                const msg = e instanceof Error ? e.message : "Unknown error";
                console.error("Error getting transactions:", e);
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        load();
        return () => controller.abort();
    }, []);

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/40 p-4 text-red-300">
                {error}
            </div>
        );
    }

    if (transactions.length === 0) {
        return <p className="mt-4 text-gray-400">No recent transactions found.</p>;
    }

    return (
        <div className="mt-8 overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
                <table className="mb-4 w-full rounded-lg bg-gray-800">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-1 py-2 md:px-4 md:py-3 font-semibold hidden md:table-cell">Team</th>
                            <th className="px-1 py-2 md:px-4 md:py-3 font-semibold">Player</th>
                            <th className="px-1 py-2 md:px-4 md:py-3 font-semibold">Detail</th>
                            <th className="px-1 py-2 md:px-4 md:py-3 font-semibold">Date</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-700">
                                <td className="px-1 py-2 md:px-4 md:py-3 flex items-center justify-center hidden md:table-cell">
                                    <Image src="/reading-royals-logo.svg"
                                        alt="Reading Royals Logo"
                                        width={32}
                                        height={32}
                                        className="h-8 w-auto px-4 drop-shadow-[0_0_4px_rgb(255,255,255,0.3)] hidden lg:inline"
                                    />
                                    {tx.team}
                                </td>
                                <td className="px-1 py-2 md:px-4 md:py-3">{tx.player}</td>
                                <td className="px-1 py-2 md:px-4 md:py-3">{tx.detail}</td>
                                <td className="px-1 py-2 md:px-4 md:py-3">
                                    {dayjs(tx.date).format("M/D/YYYY")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}