import DefaultThemeSetter from "./../../components/global-components/default-theme-setter";
import TransactionTable from "./../../components/recent-transactions/transaction-table";

export default function Page() {
  return (
    <>
      <DefaultThemeSetter />
      <div className="mx-auto w-full">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Recent Transactions</h1>
        </div>
        <TransactionTable />
      </div>
    </>
  );
}
