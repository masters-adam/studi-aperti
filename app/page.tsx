import { Header } from "@/components/header";
import { Homepage } from "@/components/homepage";
import { getApprovedListings } from "@/lib/actions/listings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const listings = await getApprovedListings();

  return (
    <>
      <Header />
      <Homepage listings={listings} />
    </>
  );
}
