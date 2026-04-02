import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { ListingDetail } from "@/components/listing-detail";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select(
      "id, name, description, address, lat, lng, contact_email, contact_phone, website, availability, tags, images, status, created_at, updated_at, removed_at"
    )
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!data) notFound();

  return (
    <>
      <Header />
      <ListingDetail listing={data as Listing} />
    </>
  );
}
