export default async function api(path, method = "GET", data) {
  const r = await fetch("/api" + path, {
    method,
    headers: method === "GET" ? {} : { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const b = await r.json();
  if (!r.ok) throw new Error(b.error || "Request failed");
  return b;
}
