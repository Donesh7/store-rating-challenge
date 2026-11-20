import React from "react";

export default function AdminMetrics({ stats }) {
  return (
    <div className="metrics">
      {[
        ["Community members", stats.users],
        ["Registered stores", stats.stores],
        ["Submitted ratings", stats.ratings],
      ].map(([k, v]) => (
        <div className="metric" key={k}>
          <span>{k}</span>
          <strong>{v ?? "—"}</strong>
          <small>Across the platform</small>
        </div>
      ))}
    </div>
  );
}
