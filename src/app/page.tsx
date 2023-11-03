import { Tralendar } from "@/components/Tralendar";
import { getData } from "@/utils/getData";

export const dynamic = "force-dynamic";
export const revalidate = 60;
export const maxDuration = 5;

export default async function Home() {
  const data = await getData();
  return (
    <main>
      <Tralendar events={data} />
    </main>
  );
}
