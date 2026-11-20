import { Router } from "express";
import bcrypt from "bcryptjs";
import * as schema from "../validation.js";
import { parse, fail, id, safeUser } from "../utils/http.js";
import { requireRole } from "../middleware/authorization.js";
export function adminRoutes(db) {
  const app = Router();
  app.get("/stats", requireRole("ADMIN"), async (req, res) =>
    res.json(
      (
        await db.query(
          "SELECT (SELECT COUNT(*) FROM users)::int AS users,(SELECT COUNT(*) FROM stores)::int AS stores,(SELECT COUNT(*) FROM ratings)::int AS ratings",
        )
      ).rows[0],
    ),
  );
  app.post("/users", requireRole("ADMIN"), async (req, res) => {
    const b = parse(schema.createUser, req.body);
    res
      .status(201)
      .json(
        (
          await db.query(
            `INSERT INTO users(name,email,address,password_hash,role) VALUES($1,$2,$3,$4,$5) RETURNING ${safeUser}`,
            [
              b.name,
              b.email,
              b.address,
              await bcrypt.hash(b.password, 12),
              b.role,
            ],
          )
        ).rows[0],
      );
  });
  app.get("/users", requireRole("ADMIN"), async (req, res) => {
    const p = [],
      clauses = [];
    for (const k of ["name", "email", "address", "role"])
      if (req.query[k]) {
        p.push("%" + String(req.query[k]) + "%");
        clauses.push(`u.${k} ILIKE $${p.length}`);
      }
    const sort = ["name", "email", "address", "role"].includes(req.query.sort)
        ? req.query.sort
        : "name",
      dir = req.query.direction === "desc" ? "DESC" : "ASC";
    res.json(
      (
        await db.query(
          `SELECT u.id,u.name,u.email,u.address,u.role,s.id AS store_id FROM users u LEFT JOIN stores s ON s.owner_id=u.id ${clauses.length ? "WHERE " + clauses.join(" AND ") : ""} ORDER BY u.${sort} ${dir},u.id`,
          p,
        )
      ).rows,
    );
  });
  app.get("/users/:id", requireRole("ADMIN"), async (req, res) => {
    const u = (
      await db.query(`SELECT ${safeUser} FROM users WHERE id=$1`, [
        id(req.params.id),
      ])
    ).rows[0];
    if (!u) throw fail(404, "User not found");
    if (u.role === "OWNER")
      u.store =
        (
          await db.query(
            "SELECT s.id,s.name,AVG(r.value)::float AS rating FROM stores s LEFT JOIN ratings r ON r.store_id=s.id WHERE s.owner_id=$1 GROUP BY s.id",
            [u.id],
          )
        ).rows[0] || null;
    res.json(u);
  });
  app.post("/stores", requireRole("ADMIN"), async (req, res) => {
    const b = parse(schema.createStore, req.body),
      owner = (
        await db.query("SELECT id FROM users WHERE id=$1 AND role='OWNER'", [
          b.ownerId,
        ])
      ).rows[0];
    if (!owner) throw fail(400, "Select a store owner");
    res
      .status(201)
      .json(
        (
          await db.query(
            "INSERT INTO stores(name,email,address,owner_id) VALUES($1,$2,$3,$4) RETURNING *",
            [b.name, b.email, b.address, b.ownerId],
          )
        ).rows[0],
      );
  });

  return app;
}
