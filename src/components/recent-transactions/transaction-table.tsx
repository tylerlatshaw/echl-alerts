import "server-only";
import type { TransactionRow } from "@/app/lib/types";
import TransactionTableClient from "./transaction-table-client";


export default function TransactionTable({ transactions }: { transactions: TransactionRow[] }) {
  const rows: TransactionRow[] = transactions.map((tx) => ({
    id: tx.id,
    team: tx.team,
    player: tx.player,
    detail: tx.detail,
    date: tx.date,
  }));

  return <TransactionTableClient rows={rows} />;
}