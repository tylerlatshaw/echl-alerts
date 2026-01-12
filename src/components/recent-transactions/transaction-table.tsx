"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Transaction } from "../../app/lib/types";

export default function TransactionTable() {

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const recordLimit = 25;

    useEffect(() => {
        const controller = new AbortController();

        async function getData() {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/league/tx-latest?limit=${recordLimit}`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error(await res.text());

                const json = await res.json();
                setTransactions(json.data);
            } catch (e) {
                if ((e as Error).name !== "AbortError") {
                    console.error("Error getting transactions:", e);
                }
            } finally {
                setLoading(false);
            }
        }

        getData();
        return () => controller.abort();
    }, []);

    if (loading)
        return <p id="meta" className="mt-2 text-lg text-gray-300">Loading…</p>;

    return (
        <>
            {!loading && transactions.length === 0 && (
                <p className="mt-4 text-gray-400">No recent transactions found.</p>
            )}

            <p id="error" className="mt-2 text-red-700"></p>

            <div className="mt-8 overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <table id="table" className="w-full rounded-lg bg-gray-800 mb-4">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Player</th>
                                <th className="px-4 py-3 font-semibold">Team</th>
                                <th className="px-4 py-3 font-semibold">Detail</th>
                                <th className="px-4 py-3 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-700">
                                    <td className="px-4 py-3">{tx.player}</td>
                                    <td className="px-4 py-3">{tx.team}</td>
                                    <td className="px-4 py-3">{tx.detail}</td>
                                    <td className="px-4 py-3">{dayjs(tx.date).format("M/D/YYYY")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}