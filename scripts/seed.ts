import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  console.error("Run with: pnpm dotenv -e .env.local -- tsx scripts/seed.ts");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log("Seeding listings from WordPress data...\n");

  const seedPath = resolve(__dirname, "../docs/seed-data.json");
  const seedData = JSON.parse(readFileSync(seedPath, "utf-8"));

  const defaultCode = await bcrypt.hash("0000", 10);

  for (const item of seedData) {
    console.log(`  Inserting: ${item.name}`);

    const { error } = await supabase.from("listings").insert({
      name: item.name,
      description: item.description || "Studio in the Upper Tiber Valley",
      address: item.address,
      lat: item.lat,
      lng: item.lng,
      contact_email: item.contact_email || "",
      contact_phone: item.contact_phone || "",
      website: item.website || "",
      availability: {},
      tags: item.tags || [],
      images: item.images || [],
      edit_code: defaultCode,
      status: "approved",
    });

    if (error) {
      console.error(`  Error inserting ${item.name}:`, error.message);
    }
  }

  console.log("\nDone! Seeded", seedData.length, "listings.");
}

main();
