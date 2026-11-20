import "dotenv/config";
import pg from "pg";
import { mkdir } from "node:fs/promises";
// Embedded PostgreSQL is available for a zero-install local demonstration.
// Normal deployment uses PostgreSQL through DATABASE_URL.
export async function connectDatabase() {
  if (process.env.DEMO_DB === "1") {
    if (process.env.VERCEL)
      throw new Error(
        "Vercel requires a hosted PostgreSQL database; unset DEMO_DB.",
      );
    const { PGlite } = await import("@electric-sql/pglite");
    const directory = process.env.DEMO_DATA_DIR || "./.data/postgres";
    await mkdir(directory, { recursive: true });
    return new PGlite(directory);
  }
  if (!process.env.DATABASE_URL)
    throw new Error(
      "Set DATABASE_URL in .env, or use DEMO_DB=1 for the local demo.",
    );
  return new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
}
