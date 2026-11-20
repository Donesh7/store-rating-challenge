import React from "react";
export default function SortableHeader({
  label,
  field: k,
  sort,
  direction,
  onSort: sortBy,
}) {
  return (
    <th
      scope="col"
      aria-sort={
        sort === k ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button className="sort" onClick={() => sortBy(k)}>
        {label} {sort === k ? (direction === "asc" ? "↑" : "↓") : "↕"}
      </button>
    </th>
  );
}
