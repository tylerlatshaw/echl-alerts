import DefaultThemeSetter from "../../components/global-components/default-theme-setter";
import TeamList from "../../components/teams/team-list";

async function getTeamData() {
  const base =
    process.env.INTERNAL_BASE_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);

  if (!base) throw new Error("INTERNAL_BASE_URL is not set");

  const url = `${base}/api/league/get-league-data`;

  const res = await fetch(url, { cache: "no-store" });

  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`get-league-data failed (${res.status}): ${text.slice(0, 300)}`);
  }

  // Guard against Cloudflare / HTML responses
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Expected JSON but got ${contentType}. Body starts: ${text.slice(0, 200)}`
    );
  }

  return res.json();
}

export default async function Page() {
  const data = await getTeamData();

  return (
    <>
      <DefaultThemeSetter />
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between">
          <span className="text-semibold font-semibold border border-red-300 bg-red-900/60 text-red-300 px-4 py-2 rounded-[4px]">
            You are missing a team selection. Please select a team from the list below.
          </span>
        </div>
        <TeamList leagueData={data} />
      </div>
    </>
  );
}
