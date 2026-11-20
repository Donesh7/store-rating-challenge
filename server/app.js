import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "./middleware/authentication.js";
import { requestSecurity } from "./middleware/requestSecurity.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";
import { storesRoutes } from "./routes/stores.js";
import { ownerRoutes } from "./routes/owner.js";

export function createApp(
  db,
  { production = false, disableRateLimit = false } = {},
) {
  const app = express();
  // Only trust the known hosting proxy when running on Vercel.
  if (process.env.VERCEL) app.set("trust proxy", 1);
  app.use(helmet(), express.json({ limit: "16kb" }), cookieParser());
  app.use("/api", requestSecurity);
  if (!disableRateLimit)
    app.use(
      "/api/auth",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { error: "Too many attempts. Try again later." },
      }),
    );
  app.use("/api/auth", authRoutes(db, { production }));
  app.use("/api", authenticate(db));
  app.use("/api/admin", adminRoutes(db));
  app.use("/api/stores", storesRoutes(db));
  app.use("/api/owner", ownerRoutes(db));
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "Endpoint not found" }),
  );
  app.use(errorHandler);
  return app;
}
