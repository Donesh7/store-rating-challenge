export const safeUser = "id,name,email,address,role";
export const fail = (status, message) =>
  Object.assign(new Error(message), { status });
export const parse = (s, b) => {
  const r = s.safeParse(b);
  if (!r.success)
    throw fail(
      400,
      r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
  return r.data;
};
export const id = (v) => {
  if (!/^\d+$/.test(v) || !Number.isSafeInteger(Number(v)) || Number(v) < 1)
    throw fail(400, "Invalid ID");
  return Number(v);
};
