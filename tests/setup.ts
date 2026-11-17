import { config } from "dotenv";

config();

// This workspace is occasionally rewritten with an unusable MySQL URL. The
// integration tests target the seeded PostgreSQL database used by the app, so
// fall back to the documented local URL only when the configured URL is not
// PostgreSQL at all.
const configuredUrl = process.env.DATABASE_URL;
if (!configuredUrl?.startsWith("postgresql://") && !configuredUrl?.startsWith("postgres://")) {
  const exampleUrl = config({ path: ".env.example" }).parsed?.DATABASE_URL;
  if (exampleUrl) process.env.DATABASE_URL = exampleUrl;
}
