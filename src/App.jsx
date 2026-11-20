import React, { useState, useEffect } from "react";
import api from "./services/api";
import { roles } from "./utils/presentation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";
import Sidebar from "./components/Sidebar";
import AccountModal from "./components/AccountModal";

export default function App() {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false),
    [signup, setSignup] = useState(false),
    [tab, setTab] = useState("stores"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [rows, setRows] = useState([]),
    [stats, setStats] = useState({}),
    [owner, setOwner] = useState({ ratings: [] }),
    [filters, setFilters] = useState({}),
    [sort, setSort] = useState("name"),
    [direction, setDirection] = useState("asc"),
    [revision, setRevision] = useState(0),
    [modal, setModal] = useState(null),
    [owners, setOwners] = useState([]),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    api("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!user) return;
    let live = true;
    setLoading(true);
    setError("");
    const q = new URLSearchParams({ ...filters, sort, direction });
    const work =
      user.role === "OWNER"
        ? api("/owner/dashboard?" + q).then((v) => {
            if (live) setOwner(v);
          })
        : api((tab === "users" ? "/admin/users" : "/stores") + "?" + q).then(
            (v) => {
              if (live) setRows(v);
            },
          );
    Promise.all([
      work,
      user.role === "ADMIN"
        ? api("/admin/stats").then((v) => {
            if (live) setStats(v);
          })
        : null,
    ])
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [user, tab, filters, sort, direction, revision]);
  async function run(fn) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const refresh = () => setRevision((v) => v + 1);
  function changeTab(t) {
    setTab(t);
    setFilters({});
    setSort("name");
    setDirection("asc");
  }
  function sortBy(k) {
    if (sort === k) setDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(k);
      setDirection("asc");
    }
  }

  async function authenticate(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    await run(async () => {
      const r = await api(
        signup ? "/auth/signup" : "/auth/login",
        "POST",
        data,
      );
      setUser(r.user);
      changeTab("stores");
    });
  }
  async function openStore() {
    await run(async () => {
      setOwners(
        (await api("/admin/users?role=OWNER")).filter((u) => !u.store_id),
      );
      setModal({ type: "store" });
    });
  }
  async function saveForm(e) {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(e.currentTarget));
    await run(async () => {
      if (modal.type === "password") {
        await api("/auth/password", "PUT", b);
        setUser(null);
        setNotice("Password updated. Please log in again.");
      } else if (modal.type === "store") {
        await api("/admin/stores", "POST", {
          ...b,
          ownerId: Number(b.ownerId),
        });
        setNotice("Store created.");
      } else {
        await api("/admin/users", "POST", b);
        setNotice("User created.");
      }
      setModal(null);
      refresh();
    });
  }

  const directoryProps = {
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
    onRate: (storeId, value) =>
      run(async () => {
        await api("/stores/" + storeId + "/rating", "PUT", { value });
        setNotice("Rating saved. Thank you for sharing!");
        refresh();
      }),
    onDetails: (id) =>
      run(async () =>
        setModal({ type: "detail", user: await api("/admin/users/" + id) }),
      ),
  };
  if (!ready) return <div className="loading">Loading Storefront…</div>;
  if (!user) {
    const Page = signup ? Signup : Login;
    return (
      <Page
        error={error}
        notice={notice}
        busy={busy}
        authenticate={authenticate}
        setSignup={setSignup}
        setError={setError}
      />
    );
  }
  return (
    <div className="app">
      <Sidebar
        user={user}
        tab={tab}
        changeTab={changeTab}
        busy={busy}
        onPassword={() => setModal({ type: "password" })}
        onLogout={() =>
          run(async () => {
            await api("/auth/logout", "POST", {});
            setUser(null);
            setRows([]);
          })
        }
      />
      <main className="workspace">
        <header>
          <span>
            COMMUNITY /{" "}
            {user.role === "ADMIN"
              ? "ADMINISTRATION"
              : user.role === "OWNER"
                ? "YOUR STORE"
                : "DISCOVER"}
          </span>
          <span className="badge">{roles[user.role]}</span>
        </header>
        <div className="page-heading">
          <div>
            <span className="eyebrow">A LITTLE LOCAL KNOWLEDGE</span>
            <h1>
              {user.role === "OWNER"
                ? "Your store, at a glance."
                : tab === "users"
                  ? "The people behind it."
                  : "Great stores start here."}
            </h1>
            <p className="muted">
              {user.role === "OWNER"
                ? "See what your community thinks about your store."
                : tab === "users"
                  ? "Manage community members, owners, and administrators."
                  : "Explore your neighbourhood through the eyes of your community."}
            </p>
          </div>
          {user.role === "ADMIN" && (
            <button
              className="primary"
              onClick={() =>
                tab === "users" ? setModal({ type: "user" }) : openStore()
              }
            >
              ＋ Add {tab === "users" ? "user" : "store"}
            </button>
          )}
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}
        {user.role === "OWNER" ? (
          <StoreOwnerDashboard
            owner={owner}
            sort={sort}
            direction={direction}
            sortBy={sortBy}
          />
        ) : user.role === "ADMIN" ? (
          <AdminDashboard stats={stats} {...directoryProps} />
        ) : (
          <UserDashboard {...directoryProps} />
        )}
        <footer>
          Storefront <span>Made for the places around you.</span>
        </footer>
      </main>
      {modal && (
        <AccountModal
          modal={modal}
          setModal={setModal}
          error={error}
          setError={setError}
          saveForm={saveForm}
          owners={owners}
          busy={busy}
        />
      )}
    </div>
  );
}
