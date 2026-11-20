import React from "react";
import Field from "./Field";
export default function ProfileFields({ withPassword = true }) {
  return (
    <>
      <Field
        label="Full name · 20–60 characters"
        name="name"
        minLength={20}
        maxLength={60}
        autoComplete="name"
      />
      <Field
        label="Email address"
        name="email"
        type="email"
        maxLength={254}
        autoComplete="email"
      />
      <label>
        Address
        <textarea name="address" required maxLength={400} />
      </label>
      {withPassword && (
        <Field
          label="Password · 8–16 characters, uppercase + special character"
          name="password"
          type="password"
          minLength={8}
          maxLength={16}
          pattern="(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).*"
          autoComplete="new-password"
        />
      )}
    </>
  );
}
