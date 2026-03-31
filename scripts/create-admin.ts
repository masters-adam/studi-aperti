import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing env vars. Run with: npx dotenv -e .env.local -- npx tsx scripts/create-admin.ts <email> <password>");
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: npx dotenv -e .env.local -- npx tsx scripts/create-admin.ts <email> <password>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log(`Creating admin for ${email}...`);

  // Create auth user
  const { data: user, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    console.error("Auth error:", authError.message);
    process.exit(1);
  }

  console.log(`  Auth user created: ${user.user.id}`);

  // Add to admins table
  const { error: dbError } = await supabase.from("admins").insert({
    id: user.user.id,
    email,
  });

  if (dbError) {
    console.error("DB error:", dbError.message);
    process.exit(1);
  }

  console.log(`  Added to admins table.`);
  console.log(`\nDone! Log in at /admin with ${email}`);
}

main();
