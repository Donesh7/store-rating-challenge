import { fail } from "../utils/http.js";
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) throw fail(403, "Access denied");
    next();
  };
