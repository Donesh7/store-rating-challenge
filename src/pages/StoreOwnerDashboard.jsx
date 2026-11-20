import React from "react";
import { score } from "../utils/presentation";
import SortableHeader from "../components/SortableHeader";
export default function StoreOwnerDashboard({
  owner,
  sort,
  direction,
  sortBy,
}) {
  return (
    <>
      <div className="metrics">
        <div className="metric">
          <span>Your store</span>
          <strong className="store-title">
            {owner.store?.name || "No store assigned"}
          </strong>
          <small>
            {owner.store?.address ||
              "Ask an administrator to assign your store."}
          </small>
        </div>
        <div className="metric">
          <span>Average rating</span>
          <strong>★ {score(owner.store?.rating)}</strong>
          <small>Out of 5 stars</small>
        </div>
        <div className="metric">
          <span>Total ratings</span>
          <strong>{owner.store?.count || 0}</strong>
          <small>Community experiences</small>
        </div>
      </div>
      <section className="panel">
        <h2>Community feedback</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortableHeader
                  label="Name"
                  field="name"
                  sort={sort}
                  direction={direction}
                  onSort={sortBy}
                />
                <SortableHeader
                  label="Email"
                  field="email"
                  sort={sort}
                  direction={direction}
                  onSort={sortBy}
                />
                <SortableHeader
                  label="Rating"
                  field="rating"
                  sort={sort}
                  direction={direction}
                  onSort={sortBy}
                />
                <SortableHeader
                  label="Updated"
                  field="updated_at"
                  sort={sort}
                  direction={direction}
                  onSort={sortBy}
                />
              </tr>
            </thead>
            <tbody>
              {owner.ratings.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td className="stars">
                    {"★".repeat(r.value)} <span>{r.value}/5</span>
                  </td>
                  <td>{new Date(r.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!owner.ratings.length && (
          <div className="empty">Your store’s ratings will appear here.</div>
        )}
      </section>
    </>
  );
}
