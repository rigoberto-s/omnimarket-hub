import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { seedDatabase } = await import("../src/db/seed");
  const result = await seedDatabase();
  console.log("Seed listo:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
