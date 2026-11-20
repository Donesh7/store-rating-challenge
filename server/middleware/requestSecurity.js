export function requestSecurity(req, res, next) {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    if (req.get("sec-fetch-site") === "cross-site")
      return res.status(403).json({ error: "Cross-site request rejected" });
    const origin = req.get("origin");
    if (origin && new URL(origin).host !== req.get("host"))
      return res.status(403).json({ error: "Invalid request origin" });
    if (!req.is("application/json"))
      return res.status(415).json({ error: "JSON content type required" });
  }
  next();
}
