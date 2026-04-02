/**
 * One-time script to backfill translations for existing listings.
 * Run: npx tsx scripts/backfill-translations.ts
 *
 * Prerequisites:
 * 1. Run the migration: alter table public.listings add column if not exists translations jsonb default null;
 * 2. Have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { translateListing } from "../lib/translate";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Fetch all listings without translations
  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, name, description, translations")
    .is("translations", null);

  if (error) {
    console.error("Error fetching listings:", error);
    process.exit(1);
  }

  if (!listings || listings.length === 0) {
    console.log("No listings need translation.");
    return;
  }

  console.log(`Found ${listings.length} listings to translate...\n`);

  for (const listing of listings) {
    try {
      console.log(`Translating: ${listing.name}...`);
      const translations = await translateListing(listing.name, listing.description);

      const { error: updateError } = await supabase
        .from("listings")
        .update({ translations })
        .eq("id", listing.id);

      if (updateError) {
        console.error(`  Failed to update ${listing.name}:`, updateError);
      } else {
        console.log(`  ✓ Done`);
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  Error translating ${listing.name}:`, err);
    }
  }

  console.log("\nBackfill complete!");
}

main();
