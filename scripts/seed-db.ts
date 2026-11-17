import { config } from "dotenv";

config();

async function main() {
  const { seedDatabase, getDataSourceStatus } = await import("../lib/data");
  const result = await seedDatabase();
  console.log(`Data source: ${getDataSourceStatus()}`);
  console.log(`Seed complete: ${result.inserted} inserted, ${result.skipped} already present.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
