import React from "react";
import { roles } from "../utils/presentation";
export default function ListingFilters({ user, tab, filters, setFilters }) {
  return (
    <section className="filters">
      <div>
        <label>
          Search by name
          <input
            placeholder={
              tab === "users" ? "Find a person…" : "Find your next favourite…"
            }
            value={filters.name || ""}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </label>
      </div>
      <div>
        <label>
          Address
          <input
            placeholder="City, street, or neighbourhood"
            value={filters.address || ""}
            onChange={(e) =>
              setFilters({ ...filters, address: e.target.value })
            }
          />
        </label>
      </div>
      {user.role === "ADMIN" && (
        <>
          <div>
            <label>
              Email
              <input
                placeholder="Filter email…"
                value={filters.email || ""}
                onChange={(e) =>
                  setFilters({ ...filters, email: e.target.value })
                }
              />
            </label>
          </div>
          {tab === "users" && (
            <label>
              Role
              <select
                value={filters.role || ""}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
              >
                <option value="">All roles</option>
                {Object.entries(roles).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      )}
      <button className="secondary" onClick={() => setFilters({})}>
        Clear
      </button>
    </section>
  );
}
