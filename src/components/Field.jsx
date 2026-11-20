import React from "react";
export default function Field({ label, name, type = "text", ...props }) {
  return (
    <label>
      {label}
      <input name={name} type={type} required {...props} />
    </label>
  );
}
