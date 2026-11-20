import React from "react";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
export default function Login({ ...props }) {
  return (
    <AuthLayout {...props} signup={false}>
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="username"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
      />
    </AuthLayout>
  );
}
