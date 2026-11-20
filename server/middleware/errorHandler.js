export function errorHandler(err, req, res, next) {
  if (err.code === "23505")
    return res
      .status(409)
      .json({ error: "Email or store owner is already in use" });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res
    .status(status)
    .json({
      error:
        status === 500
          ? "Something went wrong. Please try again."
          : err.message,
    });
}
