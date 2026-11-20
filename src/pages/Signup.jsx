import React from "react";
import AuthLayout from "../components/AuthLayout";
import ProfileFields from "../components/ProfileFields";
export default function Signup({ ...props }) {
  return (
    <AuthLayout {...props} signup={true}>
      <ProfileFields />
    </AuthLayout>
  );
}
