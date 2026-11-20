import { digest } from "../services/sessions.js";
import { fail } from "../utils/http.js";
export function authenticate(db) {
  return async (req, res, next) => {
    if (!req.cookies.sid) throw fail(401, "Please log in");
    const user = (
      await db.query(
        `SELECT u.id,u.name,u.email,u.address,u.role FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>NOW()`,
        [digest(req.cookies.sid)],
      )
    ).rows[0];
    if (!user) throw fail(401, "Session expired. Please log in");
    req.user = user;
    next();
  };
}
