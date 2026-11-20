import { Router } from "express";
import * as schema from "../validation.js";
import { parse, fail, id } from "../utils/http.js";
import { requireRole } from "../middleware/authorization.js";
export function storesRoutes(db) {
  const app = Router();
  app.get("/", requireRole("USER", "ADMIN"), async (req, res) => {
    const p = [req.user.id],
      clauses = [];
    for (const k of ["name", "address", "email"])
      if (req.query[k]) {
        p.push("%" + String(req.query[k]) + "%");
        clauses.push(`s.${k} ILIKE $${p.length}`);
      }
    const sort =
        {
          name: "s.name",
          email: "s.email",
          address: "s.address",
          rating: "rating",
        }[req.query.sort] || "s.name",
      dir = req.query.direction === "desc" ? "DESC" : "ASC";
    res.json(
      (
        await db.query(
          `SELECT s.id,s.name,s.email,s.address,AVG(r.value)::float AS rating,COUNT(r.user_id)::int AS count,MAX(CASE WHEN r.user_id=$1 THEN r.value END) AS my_rating FROM stores s LEFT JOIN ratings r ON r.store_id=s.id ${clauses.length ? "WHERE " + clauses.join(" AND ") : ""} GROUP BY s.id ORDER BY ${sort} ${dir} NULLS LAST,s.id`,
          p,
        )
      ).rows,
    );
  });
  app.put("/:id/rating", requireRole("USER"), async (req, res) => {
    const b = parse(schema.rating, req.body),
      storeId = id(req.params.id);
    if (
      !(await db.query("SELECT id FROM stores WHERE id=$1", [storeId])).rows
        .length
    )
      throw fail(404, "Store not found");
    await db.query(
      "INSERT INTO ratings(user_id,store_id,value) VALUES($1,$2,$3) ON CONFLICT(user_id,store_id) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()",
      [req.user.id, storeId, b.value],
    );
    res.json({ ok: true });
  });

  return app;
}
