"use client";

import type { TransactionRow } from "@/app/lib/types";
import { DataTable } from "./data-table";
import { makeTransactionColumns } from "./columns";

type Props = { rows: TransactionRow[] };

export default function TransactionTableClient({ rows }: Props) {

    return <div className="mt-8 overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
            <DataTable columns={makeTransactionColumns()} data={rows} />;
        </div>
    </div>;
}