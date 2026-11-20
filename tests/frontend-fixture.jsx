import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AdminDashboard from "../src/pages/AdminDashboard";
import UserDashboard from "../src/pages/UserDashboard";
import StoreOwnerDashboard from "../src/pages/StoreOwnerDashboard";
import Login from "../src/pages/Login";
import Signup from "../src/pages/Signup";
import AccountModal from "../src/components/AccountModal";

const noop = () => {};
const user = {
  id: 1,
  name: "Alex Morgan Community Member",
  email: "alex@example.com",
  address: "Market Street",
  role: "USER",
};
const store = {
  id: 1,
  name: "The Green Corner Market",
  email: "store@example.com",
  address: "Market Street",
  rating: 4,
  my_rating: 4,
  count: 1,
};
const directory = {
  user,
  tab: "stores",
  filters: {},
  setFilters: noop,
  rows: [store],
  sort: "name",
  setSort: noop,
  direction: "asc",
  setDirection: noop,
  sortBy: noop,
  loading: false,
  busy: false,
  onRate: noop,
  onDetails: noop,
};
const modal = {
  setModal: noop,
  error: "",
  setError: noop,
  saveForm: noop,
  owners: [],
  busy: false,
};
export function renderScreens() {
  return {
    login: renderToStaticMarkup(<Login setSignup={noop} setError={noop} />),
    signup: renderToStaticMarkup(<Signup setSignup={noop} setError={noop} />),
    adminUsers: renderToStaticMarkup(
      <AdminDashboard
        {...directory}
        user={{ ...user, role: "ADMIN" }}
        tab="users"
        rows={[user]}
        stats={{ users: 1, stores: 1, ratings: 1 }}
      />,
    ),
    adminStores: renderToStaticMarkup(
      <AdminDashboard
        {...directory}
        user={{ ...user, role: "ADMIN" }}
        stats={{ users: 1, stores: 1, ratings: 1 }}
      />,
    ),
    normalUser: renderToStaticMarkup(<UserDashboard {...directory} />),
    owner: renderToStaticMarkup(
      <StoreOwnerDashboard
        owner={{
          store,
          ratings: [{ ...user, value: 4, updated_at: "2026-11-20T00:00:00Z" }],
        }}
        sort="name"
        direction="desc"
        sortBy={noop}
      />,
    ),
    password: renderToStaticMarkup(
      <AccountModal {...modal} modal={{ type: "password" }} />,
    ),
    newUser: renderToStaticMarkup(
      <AccountModal {...modal} modal={{ type: "user" }} />,
    ),
    newStore: renderToStaticMarkup(
      <AccountModal
        {...modal}
        modal={{ type: "store" }}
        owners={[{ ...user, role: "OWNER" }]}
      />,
    ),
    details: renderToStaticMarkup(
      <AccountModal
        {...modal}
        modal={{ type: "detail", user: { ...user, role: "OWNER", store } }}
      />,
    ),
  };
}
