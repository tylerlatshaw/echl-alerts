import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import type { TransactionRow } from "@/app/lib/types";
import { Button } from "../ui/button";

export function formatDate(iso: string) {
    const d = new Date(iso);
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const y = d.getUTCFullYear();
    return `${m}/${day}/${y}`;
}

export function makeTransactionColumns(): ColumnDef<TransactionRow>[] {
    return [
        {
            accessorKey: "date",
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Date</span>
                </Button>
            ),
            enableSorting: true,
            cell: ({ getValue }) => formatDate(getValue<string>()),
            sortingFn: (a, b) =>
                new Date(a.getValue("date") as string).getTime() -
                new Date(b.getValue("date") as string).getTime(),
        },
        {
            accessorKey: "player",
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Player</span>
                </Button>
            ),
            enableSorting: true,
            cell: ({ row }) => row.original.player,
        },
        {
            accessorKey: "detail",
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="-ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span>Details</span>
                </Button>
            ),
            enableSorting: true,
            cell: ({ row }) => row.original.detail,
        },
        {
            accessorKey: "team",
            header: ({ column }) => (
                <Button
                    variant="link"
                    className="ml-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span className="hidden md:inline">Team</span>
                </Button>
            ),
            enableSorting: true,
            cell: ({ row }) => (
                <div className="flex items-center">
                    <Image
                        src="/reading-royals-logo.svg"
                        alt="Reading Royals Logo"
                        width={32}
                        height={32}
                        className="h-8 w-auto px-4 drop-shadow-[0_0_4px_rgb(255,255,255,0.3)] hidden lg:inline"
                    />
                    <span>{row.original.team}</span>
                </div>
            ),
            meta: { className: "hidden md:table-cell" },
        },
    ];
}