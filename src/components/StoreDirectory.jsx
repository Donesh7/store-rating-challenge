import React from "react";
import ListingFilters from "./ListingFilters";
import ManageUsers from "../pages/ManageUsers";
import DiscoverStores from "../pages/DiscoverStores";
export default function StoreDirectory({
  user,
  tab,
  filters,
  setFilters,
  rows,
  sort,
  setSort,
  direction,
  setDirection,
  sortBy,
  loading,
  busy,
  onRate,
  onDetails,
}) {
  return (
    <>
      <ListingFilters
        user={user}
        tab={tab}
        filters={filters}
        setFilters={setFilters}
      />
      <div className="results-heading">
        <h2>
          {tab === "users" ? "All users" : "The local directory"}{" "}
          <span>{rows.length}</span>
        </h2>
        {tab === "stores" && (
          <label className="inline">
            Sort by{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Name</option>
              <option value="address">Address</option>
              <option value="email">Email</option>
              <option value="rating">Rating</option>
            </select>
            <button
              className="secondary"
              onClick={() =>
                setDirection((d) => (d === "asc" ? "desc" : "asc"))
              }
            >
              {direction === "asc" ? "↑ Ascending" : "↓ Descending"}
            </button>
          </label>
        )}
      </div>
      {loading && <p role="status">Updating results…</p>}
      {tab === "users" ? (
        <ManageUsers
          rows={rows}
          sort={sort}
          direction={direction}
          sortBy={sortBy}
          onDetails={onDetails}
        />
      ) : (
        <DiscoverStores rows={rows} user={user} busy={busy} onRate={onRate} />
      )}
      {!rows.length && !loading && (
        <div className="empty">No {tab} found. Try adjusting your filters.</div>
      )}
    </>
  );
}
