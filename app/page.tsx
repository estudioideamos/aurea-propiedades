import { HomeExperience } from "./home-experience";
import { getLiveProperties } from "./live-properties";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <HomeExperience properties={await getLiveProperties()} />;
}