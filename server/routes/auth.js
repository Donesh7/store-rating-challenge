import { Router } from "express";
import bcrypt from "bcryptjs";
import * as schema from "../validation.js";
import { parse, fail, safeUser } from "../utils/http.js";
import { digest, createSessionService } from "../services/sessions.js";
import { authenticate } from "../middleware/authentication.js";
export function authRoutes(db, { production }) {
  const app = Router();
  const session = createSessionService(db, production);
  app.post("/signup", async (req, res) => {
    const b = parse(schema.signup, req.body),
      hash = await bcrypt.hash(b.password, 12);
    const user = (
      await db.query(
        `INSERT INTO users(name,email,address,password_hash,role) VALUES($1,$2,$3,$4,'USER') RETURNING ${safeUser}`,
        [b.name, b.email, b.address, hash],
      )
    ).rows[0];
    await session(req, res, user);
  });
  app.post("/login", async (req, res) => {
    const b = parse(schema.login, req.body),
      user = (await db.query("SELECT * FROM users WHERE email=$1", [b.email]))
        .rows[0];
    if (!user || !(await bcrypt.compare(b.password, user.password_hash)))
      throw fail(401, "Invalid email or password");
    delete user.password_hash;
    await session(req, res, user);
  });
  app.use(authenticate(db));
  app.get("/me", (req, res) => res.json({ user: req.user }));
  app.post("/logout", async (req, res) => {
    await db.query("DELETE FROM sessions WHERE token_hash=$1", [
      digest(req.cookies.sid),
    ]);
    res.clearCookie("sid", { path: "/" }).json({ ok: true });
  });
  app.put("/password", async (req, res) => {
    const b = parse(schema.changePassword, req.body),
      u = (
        await db.query("SELECT password_hash FROM users WHERE id=$1", [
          req.user.id,
        ])
      ).rows[0];
    if (!(await bcrypt.compare(b.currentPassword, u.password_hash)))
      throw fail(400, "Current password is incorrect");
    await db.query("UPDATE users SET password_hash=$1 WHERE id=$2", [
      await bcrypt.hash(b.newPassword, 12),
      req.user.id,
    ]);
    await db.query("DELETE FROM sessions WHERE user_id=$1", [req.user.id]);
    res.clearCookie("sid", { path: "/" }).json({ ok: true });
  });

  return app;
}
