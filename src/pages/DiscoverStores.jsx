import React from "react";
import StoreCard from "../components/StoreCard";
export default function DiscoverStores({ rows, user, busy, onRate }) {
  return (
    <div className="store-grid">
      {rows.map((store, index) => (
        <StoreCard
          key={store.id}
          store={store}
          index={index}
          user={user}
          busy={busy}
          onRate={onRate}
        />
      ))}
    </div>
  );
}
