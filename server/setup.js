import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./db.js";
import { password } from "./validation.js";
export async function setup(db, seedPassword) {
  await db.exec?.("SELECT 1");
  const sql = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  if (db.exec) await db.exec(sql);
  else await db.query(sql);
  if (!seedPassword) return;
  password.parse(seedPassword);
  const hash = await bcrypt.hash(seedPassword, 12);
  for (const [name, email, role] of [
    ["Storefront System Administrator", "admin@example.com", "ADMIN"],
    ["Alex Morgan Community Member", "user@example.com", "USER"],
    ["Jordan Taylor Store Owner", "owner@example.com", "OWNER"],
  ]) {
    await db.query(
      "INSERT INTO users(name,email,address,password_hash,role) VALUES($1,$2,$3,$4,$5) ON CONFLICT(email) DO NOTHING",
      [name, email, "24 Market Street, Bengaluru", hash, role],
    );
  }
  const owner = (
    await db.query("SELECT id FROM users WHERE email=$1", ["owner@example.com"])
  ).rows[0];
  await db.query(
    "INSERT INTO stores(name,email,address,owner_id) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING",
    [
      "The Green Corner Market",
      "hello@greencorner.example",
      "24 Market Street, Bengaluru",
      owner.id,
    ],
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const db = await connectDatabase();
  try {
    await setup(db, process.env.SEED_PASSWORD);
    console.log(
      "Database schema ready. Seed accounts created only if SEED_PASSWORD is set.",
    );
  } finally {
    await (db.end?.() ?? db.close?.());
  }
}
