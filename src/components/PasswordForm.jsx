import React from "react";
import Field from "./Field";
export default function PasswordForm({}) {
  return (
    <>
      <Field
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
      />
      <Field
        label="New password · 8–16 characters, uppercase + special"
        name="newPassword"
        type="password"
        minLength={8}
        maxLength={16}
        autoComplete="new-password"
      />
    </>
  );
}
