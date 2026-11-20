import React from "react";
import AdminMetrics from "../components/AdminMetrics";
import StoreDirectory from "../components/StoreDirectory";
export default function AdminDashboard({ stats, ...directoryProps }) {
  return (
    <>
      <AdminMetrics stats={stats} />
      <StoreDirectory {...directoryProps} />
    </>
  );
}
