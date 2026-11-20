import { randomBytes, createHash } from "node:crypto";
export const digest = (s) => createHash("sha256").update(s).digest("hex");
export function createSessionService(db, production) {
  const cookie = {
    httpOnly: true,
    sameSite: "lax",
    secure: production,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  async function session(req, res, user) {
    if (req.cookies.sid)
      await db.query("DELETE FROM sessions WHERE token_hash=$1", [
        digest(req.cookies.sid),
      ]);
    await db.query("DELETE FROM sessions WHERE expires_at<NOW()");
    const token = randomBytes(32).toString("hex");
    await db.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')",
      [digest(token), user.id],
    );
    res.cookie("sid", token, cookie).json({ user });
  }

  return session;
}
