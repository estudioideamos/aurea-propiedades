import { HomeExperience } from "./home-experience";
import { properties } from "./properties";

export const dynamic = "force-static";

export default function Home() {
  return <HomeExperience properties={properties} />;
}
