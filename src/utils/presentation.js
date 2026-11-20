export const score = (n) => (n == null ? "Not rated" : Number(n).toFixed(1));
export const roles = {
  ADMIN: "Administrator",
  USER: "Community member",
  OWNER: "Store owner",
};
