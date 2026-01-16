import { getTransactions } from "../lib/league/get-transactions";
import { TransactionRow } from "../lib/types";
import DefaultThemeSetter from "./../../components/global-components/default-theme-setter";
import TransactionTable from "./../../components/recent-transactions/transaction-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent Transactions",
  description:
    "Latest ECHL transactions including signings, trades, and call-ups.",
};

const RECORD_LIMIT = 25;

export default async function Page() {
  const res = await getTransactions(RECORD_LIMIT);

  const transactions: TransactionRow[] = [];

  for (const row of res) {
    transactions.push({
      id: row.id ?? "",
      team: row.team,
      player: row.player,
      detail: row.detail,
      date: row.date
    });
  }

  return (
    <>
      <DefaultThemeSetter />
      <div className="mx-auto w-full">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Recent Transactions</h1>
        </div>

        <TransactionTable transactions={transactions} />
      </div>
    </>
  );
}
