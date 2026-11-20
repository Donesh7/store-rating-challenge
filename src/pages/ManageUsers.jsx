import React from "react";
import { roles } from "../utils/presentation";
import SortableHeader from "../components/SortableHeader";
export default function ManageUsers({
  rows,
  sort,
  direction,
  sortBy,
  onDetails,
}) {
  return (
    <section className="panel">
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
                label="Address"
                field="address"
                sort={sort}
                direction={direction}
                onSort={sortBy}
              />
              <SortableHeader
                label="Role"
                field="role"
                sort={sort}
                direction={direction}
                onSort={sortBy}
              />
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                </td>
                <td>{r.email}</td>
                <td>{r.address}</td>
                <td>
                  <span className="badge">{roles[r.role]}</span>
                </td>
                <td>
                  <button className="link" onClick={() => onDetails(r.id)}>
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
