import { Router } from "express";
import { requireRole } from "../middleware/authorization.js";
export function ownerRoutes(db) {
  const app = Router();
  app.get("/dashboard", requireRole("OWNER"), async (req, res) => {
    const store =
      (
        await db.query(
          "SELECT s.id,s.name,s.address,AVG(r.value)::float AS rating,COUNT(r.user_id)::int AS count FROM stores s LEFT JOIN ratings r ON r.store_id=s.id WHERE s.owner_id=$1 GROUP BY s.id",
          [req.user.id],
        )
      ).rows[0] || null;
    const sort =
        {
          name: "u.name",
          email: "u.email",
          rating: "r.value",
          updated_at: "r.updated_at",
        }[req.query.sort] || "u.name",
      dir = req.query.direction === "desc" ? "DESC" : "ASC";
    const ratings = store
      ? (
          await db.query(
            `SELECT u.id,u.name,u.email,r.value,r.updated_at FROM ratings r JOIN users u ON u.id=r.user_id WHERE r.store_id=$1 ORDER BY ${sort} ${dir},u.id`,
            [store.id],
          )
        ).rows
      : [];
    res.json({ store, ratings });
  });

  return app;
}
