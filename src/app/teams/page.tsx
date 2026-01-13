import DefaultThemeSetter from "../../components/global-components/default-theme-setter";
import TeamList from "../../components/teams/team-list";

export default function Page() {
  return (
    <>
      <DefaultThemeSetter />
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            ECHL Teams
          </h1>
        </div>

        <TeamList />
      </div>
    </>
  );
}
