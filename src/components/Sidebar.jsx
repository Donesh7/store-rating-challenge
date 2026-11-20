import React from "react";
import { roles } from "../utils/presentation";
export default function Sidebar({
  user,
  tab,
  changeTab,
  busy,
  onPassword,
  onLogout,
}) {
  return (
    <aside>
      <a className="brand" href="/">
        ◈ Storefront
      </a>
      <span className="eyebrow">YOUR WORKSPACE</span>
      <nav>
        {user.role === "OWNER" ? (
          <button className="active">◉ My dashboard</button>
        ) : (
          <>
            <button
              className={tab === "stores" ? "active" : ""}
              onClick={() => changeTab("stores")}
            >
              ▦ {user.role === "ADMIN" ? "Stores overview" : "Discover stores"}
            </button>
            {user.role === "ADMIN" && (
              <button
                className={tab === "users" ? "active" : ""}
                onClick={() => changeTab("users")}
              >
                ♙ Manage users
              </button>
            )}
          </>
        )}
      </nav>
      <div className="sidebar-bottom">
        <div className="avatar">{user.name.slice(0, 1)}</div>
        <strong>{user.name}</strong>
        <small>{roles[user.role]}</small>
        <button onClick={onPassword}>Change password</button>
        <button disabled={busy} onClick={onLogout}>
          Sign out ↗
        </button>
      </div>
    </aside>
  );
}
