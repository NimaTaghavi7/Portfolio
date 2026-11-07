import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load `.env.local` first (Next.js convention), then `.env` as a fallback.
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations must use Neon's direct (non-pooled) endpoint. Runtime uses
    // the pooled DATABASE_URL through lib/db/prisma.ts.
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
