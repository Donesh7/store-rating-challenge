import React from "react";
import ProfileFields from "./ProfileFields";
import PasswordForm from "./PasswordForm";
import { roles, score } from "../utils/presentation";
export default function AccountModal({
  modal,
  setModal,
  error,
  setError,
  saveForm,
  owners,
  busy,
}) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={
          modal.type === "detail" ? "User details" : "Account and store form"
        }
      >
        <button
          className="close"
          aria-label="Close dialog"
          onClick={() => {
            setModal(null);
            setError("");
          }}
        >
          ×
        </button>
        <h2>
          {
            {
              user: "Add a community member",
              store: "Add a new store",
              password: "Update your password",
              detail: "User details",
            }[modal.type]
          }
        </h2>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        {modal.type === "detail" ? (
          <div className="detail">
            {["name", "email", "address", "role"].map((k) => (
              <p key={k}>
                <small>{k.toUpperCase()}</small>
                {k === "role" ? roles[modal.user[k]] : modal.user[k]}
              </p>
            ))}
            {modal.user.role === "OWNER" && (
              <p>
                <small>STORE RATING</small>
                {modal.user.store
                  ? `${modal.user.store.name} · ${score(modal.user.store.rating)}`
                  : "No store assigned"}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={saveForm}>
            {modal.type === "password" ? (
              <PasswordForm />
            ) : (
              <>
                <ProfileFields withPassword={modal.type === "user"} />
                {modal.type === "user" ? (
                  <label>
                    Role
                    <select name="role">
                      {Object.entries(roles).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label>
                    Store owner
                    <select name="ownerId" required defaultValue="">
                      <option value="" disabled>
                        Select an unassigned owner
                      </option>
                      {owners.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    {!owners.length && (
                      <small>
                        Create a user with the Store owner role first.
                      </small>
                    )}
                  </label>
                )}
              </>
            )}
            <button
              disabled={busy || (modal.type === "store" && !owners.length)}
              className="primary"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
